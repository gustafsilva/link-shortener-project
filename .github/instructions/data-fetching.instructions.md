---
description: Read this file to understand how to fetch data for the project.
---
# Data Fetching Instructions
This document provides guidelines on how to fetch data for the project in Next.js. Adhere to these instructions to ensure consistency and optimal performance.

## Architecture Layers

This project follows a clean architecture pattern with three distinct layers:

```
Server Component → Mutations → Repository → Database (Drizzle ORM)
```

### Layer 1: Server Components (Presentation)
- **ALWAYS use Server Components** for data fetching whenever possible
- Server Components provide better performance and SEO
- **MUST NOT** access Drizzle ORM directly
- **MUST NOT** access Repository layer directly
- **MUST ONLY** communicate with the Mutations layer

### Layer 2: Mutations (Business Logic)
- Server-side functions that handle business logic
- Located in `/lib/mutations/` directory
- Can be called from Server Components
- **MUST** use the Repository layer for database access
- **MUST NOT** access Drizzle ORM directly
- Should handle validation, authorization, and error handling
- **MUST validate all input data using Zod schemas**
- Use `'use server'` directive for Next.js Server Actions

**Example Structure:**
```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { linkRepository } from '@/lib/repositories/link-repository';

// Define validation schema
const createLinkSchema = z.object({
  url: z.string().url('Invalid URL format'),
  customCode: z.string().min(3).max(20).optional(),
});

export async function createShortLink(url: string, customCode?: string) {
  // Validate input with Zod
  const validatedData = createLinkSchema.parse({ url, customCode });
  
  // Authorization
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Business logic
  const code = validatedData.customCode || generateRandomCode();
  
  // Use Repository
  return await linkRepository.create({
    url: validatedData.url,
    code,
    userId,
  });
}
```

### Layer 3: Repository (Data Access)
- Abstracts all database operations
- Located in `/lib/repositories/` directory
- **ONLY layer that can access Drizzle ORM directly**
- Provides clean interface for data operations
- Handles database-specific logic and queries

**Example Structure:**
```typescript
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const linkRepository = {
  async create(data: { url: string; code: string; userId: string }) {
    const [link] = await db.insert(links).values(data).returning();
    return link;
  },
  
  async findByCode(code: string) {
    return await db.query.links.findFirst({
      where: eq(links.code, code),
    });
  },
  
  async findByUserId(userId: string) {
    return await db.query.links.findMany({
      where: eq(links.userId, userId),
    });
  },
};
```

## Directory Structure

```
/lib
  /mutations          # Server Actions (Business Logic)
    link-mutations.ts
    user-mutations.ts
  /repositories       # Data Access Layer
    link-repository.ts
    user-repository.ts
/app
  /dashboard
    page.tsx          # Server Component using mutations
```

## Rules and Best Practices

### ✅ DO:
- Always use Server Components for data fetching
- Create mutations for all business logic operations
- Create repositories for all database operations
- Use TypeScript for type safety across all layers
- Handle errors at the mutation layer
- Validate all input data at the mutation layer using Zod schemas
- Define clear Zod schemas for each mutation's input
- Use Drizzle ORM only within repositories

### ❌ DON'T:
- Don't access Drizzle ORM from Server Components
- Don't access Drizzle ORM from mutations
- Don't access repositories from Server Components
- Don't put business logic in repositories
- Don't put database queries in mutations
- Don't mix layers or skip the architecture

## Example: Complete Flow

**1. Server Component** (`/app/dashboard/page.tsx`):
```typescript
import { getUserLinks } from '@/lib/mutations/link-mutations';

export default async function DashboardPage() {
  const links = await getUserLinks();
  
  return (
    <div>
      {links.map(link => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
```

**2. Mutation** (`/lib/mutations/link-mutations.ts`):
```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { linkRepository } from '@/lib/repositories/link-repository';

export async function getUserLinks() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return await linkRepository.findByUserId(userId);
}
```

**3. Repository** (`/lib/repositories/link-repository.ts`):
```typescript
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const linkRepository = {
  async findByUserId(userId: string) {
    return await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    });
  },
};
```

## When to Use Client Components

Use Client Components (`'use client'`) only when you need:
- Interactive features (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)

**Even with Client Components, data fetching should still go through the mutation layer using Server Actions.**
