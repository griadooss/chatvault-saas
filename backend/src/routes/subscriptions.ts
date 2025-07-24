import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { createError } from '../utils/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });
}

// Get user's subscription
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { user: true },
  });

  res.json(subscription || { status: 'free', planId: 'free' });
}));

// Create checkout session
router.post('/create-checkout-session', [
  body('priceId').isString().notEmpty().withMessage('Price ID is required'),
], authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(`Validation failed: ${errors.array().map(e => e.msg).join(', ')}`, 400);
  }

  const { priceId } = req.body;
  const userId = req.user!.id;

  // Get or create Stripe customer
  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const customer = await stripe.customers.create({
      email: user!.email,
      metadata: {
        userId: userId,
      },
    });

    customerId = customer.id;

    // Create subscription record
    subscription = await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customerId,
        status: 'incomplete',
        planId: 'free',
      },
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
    metadata: {
      userId: userId,
    },
  });

  res.json({ sessionId: session.id });
}));

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const sig = (req.headers as any)['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeletion(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}));

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  // Map price ID to plan
  const planMap: { [key: string]: string } = {
    'price_pro_basic': 'pro',
    'price_pro_premium': 'premium',
    'price_enterprise': 'enterprise',
  };

  const planId = planMap[priceId] || 'free';

  await prisma.subscription.upsert({
    where: { stripeCustomerId: customerId },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      planId: planId,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      planId: planId,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      userId: '', // This should be set from customer metadata
    },
  });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      status: 'canceled',
      cancelAtPeriodEnd: true,
    },
  });
}

// Cancel subscription
router.post('/cancel', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const userId = req.user!.id;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw createError('No active subscription found', 404);
  }

  // Cancel at period end
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { userId },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  res.json({ message: 'Subscription will be canceled at the end of the current period' });
}));

export default router; 