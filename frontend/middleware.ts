// Temporarily disabled for testing
// import { clerkMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
// export default clerkMiddleware({
//   publicRoutes: ["/", "/pricing"],
//   ignoredRoutes: ["/api/webhook/clerk", "/api/webhook/stripe"],
// });

// Temporary simple middleware for testing
export function middleware() {
  // Do nothing - just pass through
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 