# Agent Instructions - Link Shortener Project

## Overview

This file serves as the entry point for LLM agents working on the Link Shortener project. All coding standards, best practices, and guidelines are documented in separate markdown files located in the `/docs` directory.

## Project Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+ (Strict mode)
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Runtime**: React 19

## Documentation Structure

The coding guidelines are organized into the following documents. **You MUST read the relevant documentation BEFORE generating any code:**

- **[Authentication](/docs/authentication.md)** - Clerk authentication implementation, route protection, and security guidelines *(READ THIS before working on auth, protected routes, or user data)*
- **[UI Components](/docs/ui-components.md)** - shadcn/ui component usage, styling patterns, and form handling *(READ THIS before creating forms, UI components, or styling)*
- **[Data Fetching](/.github/instructions/data-fetching.instructions.md)** - Repository pattern and Drizzle ORM usage *(READ THIS before working with database queries or data access)*
- **[Mutations](/.github/instructions/mutations.instructions.md)** - Business logic layer implementation *(READ THIS before creating business logic or data mutations)*
- **[Server Functions](/.github/instructions/server-functions.instructions.md)** - Server Actions, error handling, and Server Components usage *(READ THIS before creating server functions, handling errors, or working with Server Components)*

**Workflow:**
1. User requests a task
2. Identify which documentation file(s) are relevant
3. Read the ENTIRE relevant documentation file(s)
4. Review existing code patterns
5. Generate code following the documented guidelines


## Quick Reference

### Project Structure
```
/app              - Next.js routes and pages
  /api            - API route handlers
  /dashboard      - Protected dashboard routes
  globals.css     - Global styles
  layout.tsx      - Root layout
  page.tsx        - Home page
/components       - Reusable React components
  /ui             - shadcn/ui components
/db               - Database configuration and schema
  index.ts        - Database instance
  schema.ts       - Drizzle schema definitions
/docs             - Agent instructions and guidelines
/hooks            - Custom React hooks
/lib              - Utility functions
  utils.ts        - Shared utilities (cn, etc.)
/public           - Static assets
```

### Key Commands
```bash
# Development
yarn dev         # Start development server

# Database
yarn db:generate # Generate migrations
yarn db:migrate  # Run migrations
yarn db:studio   # Open Drizzle Studio

# Build
yarn build       # Build for production
yarn start       # Start production server

# Linting
yarn lint        # Run ESLint
```

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## When Working on This Project

### Before Writing Code
1. **Read the relevant documentation** - Check the specific guideline document for the area you're working on
2. **Understand the stack** - Familiarize yourself with the technologies being used
3. **Check existing patterns** - Look at similar implementations in the codebase
4. **Consider the user** - Think about authentication, authorization, and data ownership

### During Development
1. **Follow TypeScript strict mode** - Always use explicit types
2. **Default to Server Components** - Use Client Components only when necessary
3. **Handle errors gracefully** - Provide meaningful error messages
4. **Think about performance** - Optimize queries, use proper caching
5. **Maintain consistency** - Follow established patterns and naming conventions

### After Writing Code
1. **Test your changes** - Ensure everything works as expected
2. **Check for errors** - Run the linter and fix any issues
3. **Review security** - Ensure proper authentication and authorization
4. **Update documentation** - If you've introduced new patterns or conventions

## Priority Rules

When in doubt, follow this priority order:

1. **Security** - Never compromise on authentication or authorization
2. **Type Safety** - Use TypeScript properly, avoid `any`
3. **Performance** - Optimize database queries and minimize client-side JavaScript
4. **User Experience** - Provide loading states, error messages, and clear feedback
5. **Code Quality** - Write clean, maintainable, and well-documented code
6. **Consistency** - Follow existing patterns in the codebase

## Getting Help

If you encounter a situation not covered in these guidelines:

1. Check the official documentation:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Drizzle ORM Docs](https://orm.drizzle.team)
   - [Clerk Docs](https://clerk.com/docs)
   - [TypeScript Docs](https://www.typescriptlang.org/docs)
   - [Tailwind CSS Docs](https://tailwindcss.com/docs)

2. Look for similar patterns in the existing codebase

3. Follow industry best practices and conventions

## Contributing to These Guidelines

If you identify a pattern that should be documented or find inconsistencies:

1. Update the relevant documentation file in `/docs`
2. Ensure examples are clear and follow the established format
3. Keep guidelines practical and actionable
4. Update this index if you add new documentation files

---

**Remember**: These guidelines exist to maintain code quality and consistency. They're not rigid rules but rather best practices learned from building this project. Use your judgment and prioritize delivering value to users.
