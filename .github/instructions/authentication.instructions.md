# Authentication Guidelines

## Overview

This application uses **Clerk** exclusively for all authentication and user management. No other authentication method should be implemented or used.

## Core Rules

### 1. Clerk-Only Authentication
- **ALWAYS** use Clerk for authentication
- **NEVER** implement custom authentication logic
- **NEVER** use alternative authentication providers (Auth.js, NextAuth, Passport, etc.)
- All user sessions, login, logout, and registration must go through Clerk

### 2. Route Protection

#### Protected Routes
- `/dashboard` and all its subroutes require authentication
- Users must be logged in to access these routes
- Unauthenticated users attempting to access protected routes should be redirected to `/` (home page)

#### Public Routes
- `/` (home page) is public but has conditional behavior
- Other public routes (if any) should be explicitly defined

### 3. Redirect Rules

**When user is authenticated:**
- If accessing `/` (home page) → Redirect to `/dashboard`

**When user is NOT authenticated:**
- If accessing `/dashboard` → Redirect to `/` (home page)

### 4. Authentication UI

#### Login & Registration
- Must be done via Clerk modals/components
- Modals should open **on the same page** (not navigate to separate routes)
- Use Clerk's built-in UI components: `<SignIn />`, `<SignUp />`, `<UserButton />`

#### Implementation Pattern
```tsx
// Example: Trigger Clerk auth modal
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

// For unauthenticated users
<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>

// For authenticated users
<UserButton />
```

## Implementation Checklist

When working with authentication:

- [ ] Are you using Clerk components/hooks exclusively?
- [ ] Are protected routes properly guarded?
- [ ] Are redirect rules correctly implemented?
- [ ] Is authentication UI shown as modals (not separate pages)?
- [ ] Have you avoided implementing custom auth logic?

## Common Clerk Hooks & Components

### Server Components
```tsx
import { auth, currentUser } from "@clerk/nextjs/server";

// Get user ID
const { userId } = await auth();

// Get full user object
const user = await currentUser();
```

### Client Components
```tsx
import { useAuth, useUser } from "@clerk/nextjs";

// Get auth state
const { isLoaded, userId, isSignedIn } = useAuth();

// Get user data
const { user } = useUser();
```

### UI Components
```tsx
import { 
  SignIn, 
  SignUp, 
  UserButton,
  SignInButton,
  SignUpButton 
} from "@clerk/nextjs";
```

## Route Protection Methods

### Method 1: Middleware (Recommended)
```tsx
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Method 2: Page-Level Protection
```tsx
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }
  
  // ... rest of component
}
```

### Method 3: Conditional Redirect (Home Page)
```tsx
// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  // ... rest of component
}
```

## Environment Variables

Ensure these Clerk environment variables are configured:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Security Best Practices

1. **Always verify authentication server-side** - Never trust client-side checks alone
2. **Use Clerk middleware** for route protection when possible
3. **Validate userId** before any database operations
4. **Store userId from Clerk** in your database to associate data with users
5. **Never expose sensitive data** to unauthenticated users

## What NOT to Do

❌ Don't create custom login/signup forms
❌ Don't implement JWT handling manually
❌ Don't use cookies or sessions directly
❌ Don't create separate auth routes (`/login`, `/signup`, `/logout`)
❌ Don't mix authentication providers
❌ Don't store passwords or credentials in your database
❌ Don't implement password reset logic manually

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components Reference](https://clerk.com/docs/components/overview)
