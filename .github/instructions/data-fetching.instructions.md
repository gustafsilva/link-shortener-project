---
description: Read this file to understand how to implement repositories and work with Drizzle ORM for data access.
---
# Data Fetching Instructions (Repository & Drizzle ORM)
This document provides guidelines on how to implement the Repository layer and work with Drizzle ORM for database access. This is the **data access layer** of the application.

## Architecture Position

This project follows a clean architecture pattern:

```
Server Component → Mutations → Repository → Database (Drizzle ORM)
```

**This document covers the Repository layer**, which is the **ONLY layer** that should interact with Drizzle ORM directly.

## Repository Layer (Data Access)
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
  
  async findById(id: string) {
    return await db.query.links.findFirst({
      where: eq(links.id, id),
    });
  },
  
  async findByUserId(userId: string) {
    return await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
    });
  },
  
  async update(id: string, data: Partial<{ url: string; code: string }>) {
    const [updated] = await db
      .update(links)
      .set(data)
      .where(eq(links.id, id))
      .returning();
    return updated;
  },
  
  async delete(id: string) {
    await db.delete(links).where(eq(links.id, id));
  },
};
```

## Rules for Repositories

### ✅ DO:
- Create one repository file per database table/entity
- Use Drizzle ORM for all database operations
- Export an object with methods (repository pattern)
- Use TypeScript for type safety
- Handle database-specific logic (queries, relations, etc.)
- Use Drizzle's query builder for complex queries
- Return raw data from the database
- Keep methods focused and single-purpose

### ❌ DON'T:
- Don't implement business logic in repositories
- Don't handle authorization in repositories
- Don't validate input data (that's the mutation's job)
- Don't throw business-level errors
- Don't access other repositories directly (use composition in mutations)
- Don't expose Drizzle implementation details to other layers

## Working with Drizzle ORM

### Database Instance

The database instance is configured in `/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Schema Definition

Schemas are defined in `/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Common Drizzle Operations

#### Insert Data
```typescript
async create(data: { url: string; code: string; userId: string }) {
  const [link] = await db.insert(links).values(data).returning();
  return link;
}
```

#### Query Data
```typescript
// Find one record
async findByCode(code: string) {
  return await db.query.links.findFirst({
    where: eq(links.code, code),
  });
}

// Find multiple records
async findByUserId(userId: string) {
  return await db.query.links.findMany({
    where: eq(links.userId, userId),
    orderBy: (links, { desc }) => [desc(links.createdAt)],
  });
}

// Find with relations
async findWithClicks(code: string) {
  return await db.query.links.findFirst({
    where: eq(links.code, code),
    with: {
      clicks: true,
    },
  });
}
```

#### Update Data
```typescript
async update(id: string, data: Partial<{ url: string; code: string }>) {
  const [updated] = await db
    .update(links)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(links.id, id))
    .returning();
  return updated;
}
```

#### Delete Data
```typescript
async delete(id: string) {
  await db.delete(links).where(eq(links.id, id));
}
```

### Using Drizzle Operators

```typescript
import { eq, ne, gt, gte, lt, lte, like, and, or, desc, asc } from 'drizzle-orm';

// Equal
where: eq(links.userId, userId)

// Not equal
where: ne(links.status, 'deleted')

// Greater than
where: gt(links.clicks, 100)

// Like (pattern matching)
where: like(links.url, '%example.com%')

// Combining conditions
where: and(
  eq(links.userId, userId),
  gt(links.clicks, 10)
)

// OR conditions
where: or(
  eq(links.status, 'active'),
  eq(links.status, 'pending')
)

// Ordering
orderBy: (links, { desc, asc }) => [desc(links.createdAt), asc(links.code)]
```

### Complex Queries

#### Joins and Relations
```typescript
// Define relation in schema
export const linksRelations = relations(links, ({ many }) => ({
  clicks: many(clicks),
}));

// Use in repository
async findWithStats(userId: string) {
  return await db.query.links.findMany({
    where: eq(links.userId, userId),
    with: {
      clicks: {
        columns: { id: true },
      },
    },
  });
}
```

#### Aggregations
```typescript
import { count, sum, avg } from 'drizzle-orm';

async getClickStats(linkId: string) {
  const result = await db
    .select({
      totalClicks: count(clicks.id),
      uniqueVisitors: count(clicks.userId).distinct(),
    })
    .from(clicks)
    .where(eq(clicks.linkId, linkId));
    
  return result[0];
}
```

## Repository Patterns

### CRUD Operations
Every repository should provide basic CRUD methods:

```typescript
export const entityRepository = {
  // Create
  async create(data: CreateData) { /* ... */ },
  
  // Read
  async findById(id: string) { /* ... */ },
  async findByUserId(userId: string) { /* ... */ },
  async findAll() { /* ... */ },
  
  // Update
  async update(id: string, data: UpdateData) { /* ... */ },
  
  // Delete
  async delete(id: string) { /* ... */ },
};
```

### Specialized Queries
Add domain-specific query methods:

```typescript
export const linkRepository = {
  // ... CRUD methods ...
  
  async findPopularLinks(limit: number = 10) {
    return await db.query.links.findMany({
      orderBy: (links, { desc }) => [desc(links.clicks)],
      limit,
    });
  },
  
  async findRecentLinks(userId: string, limit: number = 5) {
    return await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { desc }) => [desc(links.createdAt)],
      limit,
    });
  },
  
  async incrementClicks(id: string) {
    await db
      .update(links)
      .set({ clicks: sql`${links.clicks} + 1` })
      .where(eq(links.id, id));
  },
};
```

## Best Practices

1. **Keep it simple** - Repositories should only handle data access, no business logic
2. **One repository per table** - Don't create giant repositories
3. **Descriptive method names** - `findByUserId`, not `getLinks`
4. **Return data directly** - Don't transform or validate, just return what the database gives you
5. **Use TypeScript** - Leverage Drizzle's type inference
6. **Handle null cases** - Return null/undefined when data isn't found
7. **Use transactions** - For operations that need atomicity
8. **Optimize queries** - Select only needed columns, use indexes

## Transactions

For operations that need to be atomic:

```typescript
async createLinkWithClick(linkData: LinkData, clickData: ClickData) {
  return await db.transaction(async (tx) => {
    const [link] = await tx.insert(links).values(linkData).returning();
    const [click] = await tx.insert(clicks).values({
      ...clickData,
      linkId: link.id,
    }).returning();
    
    return { link, click };
  });
}
```

## Error Handling

Let database errors bubble up - don't catch them in repositories:

```typescript
// ❌ DON'T
async findByCode(code: string) {
  try {
    return await db.query.links.findFirst({
      where: eq(links.code, code),
    });
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

// ✅ DO
async findByCode(code: string) {
  return await db.query.links.findFirst({
    where: eq(links.code, code),
  });
}
```

## Summary

The Repository layer:
- ✅ Is the ONLY layer that accesses Drizzle ORM
- ✅ Provides clean data access interface
- ✅ Handles database-specific queries and logic
- ✅ Returns raw database data
- ❌ Does NOT handle business logic
- ❌ Does NOT validate input
- ❌ Does NOT handle authorization
- ❌ Should NOT be called directly from Server Components

**Remember:** Mutations → Repositories → Drizzle ORM. Never skip layers!
