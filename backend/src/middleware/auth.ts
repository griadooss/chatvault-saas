import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ error: 'Clerk secret key not configured' });
    }

    // Verify the Clerk token
    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get or create user in our database
    const clerkUserId = payload.sub;
    const email = payload.email || payload.email_addresses?.[0]?.email_address;
    
    if (!email) {
      return res.status(401).json({ error: 'Email not found in token' });
    }

    let user = await prisma.user.findUnique({
      where: { id: clerkUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    // Create user if they don't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: clerkUserId,
          email: email,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          role: 'USER',
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(["ADMIN"]);
export const requireUser = requireRole(["ADMIN", "USER"]); 