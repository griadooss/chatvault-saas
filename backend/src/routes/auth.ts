import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Login endpoint
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').trim(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw createError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  // Generate JWT token
  if (!process.env.JWT_SECRET) {
    throw createError('JWT secret not configured', 500);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
}));

// Register new user (admin only)
router.post('/register', authenticateToken, requireAdmin, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['ADMIN', 'TREASURER', 'USER', 'VIEWER']).withMessage('Valid role is required'),
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { email, password, firstName, lastName, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
              role: role as string,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
}));

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user,
  });
}));

// Update user profile
router.put('/me', authenticateToken, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('currentPassword').optional().isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { firstName, lastName, currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  const updateData: any = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;

  // Handle password change
  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      updatedAt: true,
    },
  });

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser,
  });
}));

// List all users (admin only)
router.get('/users', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({ users });
}));

// Deactivate user (admin only)
router.patch('/users/:id/deactivate', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  if (id === req.user!.id) {
    throw createError('Cannot deactivate your own account', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
    },
  });

  res.json({
    message: 'User deactivated successfully',
    user,
  });
}));

export default router; 