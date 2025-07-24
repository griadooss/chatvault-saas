# Phase 3: Deployment Log

## Deployment Sequence
1. ✅ **External Services Setup** (Clerk + Stripe)
2. ⏳ **Railway Backend Deployment**
3. ⏳ **Vercel Frontend Deployment**
4. ⏳ **Database Setup & Testing**

## Step 1: External Services Setup

### Clerk Authentication Setup
- [ ] Create Clerk account at https://clerk.com
- [ ] Create new application
- [ ] Get Publishable Key and Secret Key
- [ ] Configure webhook endpoints

### Stripe Billing Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys (publishable and secret)
- [ ] Create webhook endpoint for subscription events
- [ ] Get webhook secret

### Environment Variables to Configure
**Frontend (.env.local)**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

**Backend (.env)**
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Step 2: Railway Backend Deployment
- [ ] Install Railway CLI
- [ ] Deploy backend to Railway
- [ ] Add PostgreSQL database
- [ ] Configure environment variables
- [ ] Test backend deployment

## Step 3: Vercel Frontend Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables
- [ ] Deploy frontend
- [ ] Test frontend deployment

## Step 4: Database Setup & Testing
- [ ] Run Prisma migrations
- [ ] Seed database
- [ ] Test authentication flow
- [ ] Test chat functionality
- [ ] Test subscription management

## Notes
- All external service keys needed before deployment
- Backend must be deployed before frontend (for API URL)
- Database setup requires deployed backend
- Testing should be done incrementally at each step 