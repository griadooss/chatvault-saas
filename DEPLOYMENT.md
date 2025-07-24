# ChatVault SaaS Deployment Guide

## Phase 2: Environment Setup & Deployment

### Prerequisites
- Railway account (for backend + database)
- Vercel account (for frontend)
- Clerk account (for authentication)
- Stripe account (for billing)

### Step 1: Set up Clerk Authentication

1. **Create Clerk Account**
   - Go to https://clerk.com
   - Sign up and create a new application
   - Note your Publishable Key and Secret Key

2. **Configure Environment Variables**
   ```bash
   # Frontend (.env.local)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   
   # Backend (.env)
   CLERK_SECRET_KEY=sk_test_your_key_here
   CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

### Step 2: Set up Stripe Billing

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up and get your API keys
   - Create webhook endpoint for subscription events

2. **Configure Stripe Environment Variables**
   ```bash
   # Backend (.env)
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### Step 3: Deploy Backend to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables in Railway**
   - Go to Railway dashboard
   - Add all backend environment variables
   - Set `FRONTEND_URL` to your Vercel URL

### Step 4: Deploy Frontend to Vercel

1. **Connect Repository**
   - Go to Vercel dashboard
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Environment Variables**
   - Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Add `NEXT_PUBLIC_API_URL` (Railway backend URL)

3. **Deploy**
   - Vercel will automatically deploy on push to main

### Step 5: Database Setup

1. **Create PostgreSQL Database**
   - In Railway dashboard, add PostgreSQL service
   - Get connection string

2. **Run Migrations**
   ```bash
   cd backend
   DATABASE_URL="your_railway_db_url" npx prisma db push
   DATABASE_URL="your_railway_db_url" npm run db:seed
   ```

### Step 6: Test Deployment

1. **Test Authentication**
   - Visit your Vercel URL
   - Try signing up/signing in
   - Verify user creation in database

2. **Test API Endpoints**
   - Test chat upload functionality
   - Test subscription creation
   - Verify Stripe webhooks

### Environment Variables Summary

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

### Troubleshooting

1. **CORS Issues**: Ensure `FRONTEND_URL` is set correctly in backend
2. **Database Connection**: Verify `DATABASE_URL` format and permissions
3. **Authentication**: Check Clerk keys and domain configuration
4. **Stripe Webhooks**: Verify webhook endpoint URL and secret

### Next Steps

After successful deployment:
1. Set up custom domain
2. Configure production Stripe keys
3. Set up monitoring and logging
4. Implement backup strategies
5. Plan scaling strategy 