---
description: Read this file to understand how to implement and use mutations (business logic layer) for the project.
---
# Mutations Instructions
This document provides guidelines on how to implement and use mutations for the project. Mutations handle all business logic operations and validation.

> **Note**: For detailed information about Server Functions (Server Actions), error handling patterns, and Server Components usage, see [server-functions.instructions.md](./server-functions.instructions.md).

## What are Mutations?

Mutations are server-side functions (Server Actions) that handle business logic in the application. They serve as the middle layer between Server Components (presentation) and Repositories (data access).

## Architecture Position

```
Server Component → Mutations → Repository → Database (Drizzle ORM)
```

**Mutations Layer (Business Logic):**
- Server-side functions that handle business logic
- Located in `/lib/mutations/` directory
- Can be called from Server Components
- **MUST** use the Repository layer for database access
- **MUST NOT** access Drizzle ORM directly
- Should handle validation, authorization, and error handling
- **MUST validate all input data using Zod schemas**
- Use `'use server'` directive for Next.js Server Actions

## File Structure

```
/lib
  /mutations
    link-mutations.ts    # Link-related business logic
    user-mutations.ts    # User-related business logic
```

## Basic Mutation Structure

**Example:** (`/lib/mutations/link-mutations.ts`)

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { linkRepository } from '@/lib/repositories/link-repository';

// Define validation schema
const createLinkSchema = z.object({
  url: z.string().url('URL inválida'),
  customCode: z.string().min(3).max(20).optional(),
});

// Define return type
type CreateLinkResult = 
  | { success: true; data: Link }
  | { error: string };

export async function createShortLink(
  data: { url: string; customCode?: string }
): Promise<CreateLinkResult> {
  try {
    // Validate input with Zod
    const validatedData = createLinkSchema.parse(data);
    
    // Authorization
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Não autenticado' };
    }
    
    // Business logic
    const code = validatedData.customCode || generateRandomCode();
    
    // Use Repository
    const link = await linkRepository.create({
      url: validatedData.url,
      code,
      userId,
    });
    
    // Revalidate cache
    revalidatePath('/dashboard');
    
    // Return success
    return { success: true, data: link };
  } catch (error) {
    // ALWAYS return errors, never throw
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar link' };
  }
}
```

## Critical: Error Handling Pattern

**⚠️ IMPORTANT: Always return error objects, NEVER throw errors from mutations.**

### ✅ DO - Return Error Objects:
```typescript
export async function createLink(data: LinkData) {
  try {
    // ... logic
    return { success: true, data: link };
  } catch (error) {
    // Return error object
    return { error: 'Erro ao criar link' };
  }
}
```

### ❌ DON'T - Throw Errors:
```typescript
export async function createLink(data: LinkData) {
  // ❌ Don't throw errors
  if (!data.url) {
    throw new Error('URL é obrigatória');
  }
  
  // ❌ Don't let errors bubble up
  const link = await repository.create(data);
  return link;
}
```

**Why return errors instead of throwing?**
- Better UX with graceful error handling
- Type-safe error checking: `if ('error' in result)`
- Prevents unhandled promise rejections
- Consistent pattern across the application

See [server-functions.instructions.md](./server-functions.instructions.md) for comprehensive error handling patterns.

## Rules for Mutations

### ✅ DO:
- Always use `'use server'` directive at the top of the file
- **Always return error objects `{ error: string }` instead of throwing**
- Always validate all input data using Zod schemas
- Always handle authentication and authorization
- Always implement business logic and rules
- Always use the Repository layer for all database operations
- Always revalidate cache with `revalidatePath()` after mutations
- Always use TypeScript with explicit return types
- Always export async functions that can be called from Server Components
- Always return serializable data (no functions, classes, or complex objects)

### ❌ DON'T:
- **Don't throw errors - always return `{ error: string }` objects**
- Don't access Drizzle ORM directly
- Don't put database queries in mutations
- Don't skip input validation
- Don't expose sensitive data in error messages
- Don't bypass the Repository layer
- Don't mix database logic with business logic
- Don't return non-serializable data

## Input Validation with Zod

Always validate input data at the mutation layer:

```typescript
'use server';

import { z } from 'zod';

const updateLinkSchema = z.object({
  linkId: z.string().uuid('ID de link inválido'),
  url: z.string().url('URL inválida').optional(),
  customCode: z.string().min(3).max(20).optional(),
});

export async function updateLink(
  linkId: string,
  url?: string,
  customCode?: string
) {
  try {
    // Validate all inputs
    const validatedData = updateLinkSchema.parse({ linkId, url, customCode });
    
    // Continue with business logic...
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao atualizar link' };
  }
}
```

## Authorization Pattern

Always check user permissions in mutations:

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { linkRepository } from '@/lib/repositories/link-repository';

export async function deleteLink(linkId: string) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { error: 'Não autenticado' };
    }
    
    // Verify ownership
    const link = await linkRepository.findById(linkId);
    
    if (!link) {
      return { error: 'Link não encontrado' };
    }
    
    if (link.userId !== userId) {
      return { error: 'Você não tem permissão para deletar este link' };
    }
    
    // Perform deletion
    await linkRepository.delete(linkId);
    
    return { success: true };
  } catch (error) {
    return { error: 'Erro ao deletar link' };
  }
}
```

## Error Handling Pattern

**CRITICAL: Always return error objects, never throw:**

```typescript
'use server';

import { z } from 'zod';
import { linkRepository } from '@/lib/repositories/link-repository';
import { revalidatePath } from 'next/cache';

const createLinkSchema = z.object({
  url: z.string().url('URL inválida'),
  customCode: z.string().min(3).max(20).optional(),
});

export async function createShortLink(data: { url: string; customCode?: string }) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Não autenticado' };
    }
    
    // Validation
    const validatedData = createLinkSchema.parse(data);
    
    // Business logic - check if custom code is already taken
    if (validatedData.customCode) {
      const existing = await linkRepository.findByCode(validatedData.customCode);
      if (existing) {
        return { error: 'Este código já está em uso' };
      }
    }
    
    // Create link
    const link = await linkRepository.create({
      url: validatedData.url,
      code: validatedData.customCode || generateRandomCode(),
      userId,
    });
    
    // Revalidate cache
    revalidatePath('/dashboard');
    
    // Return success
    return { success: true, data: link };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    
    // Return generic error for unexpected errors
    return { error: 'Erro ao criar link' };
  }
}
```

## Cache Revalidation

Always revalidate cache after mutations to ensure UI reflects changes:

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function updateLink(id: string, data: UpdateData) {
  try {
    // ... validation and update logic
    
    // Revalidate the dashboard to show updated link
    revalidatePath('/dashboard');
    
    // Revalidate specific dynamic routes if needed
    revalidatePath(`/links/${link.shortCode}`);
    
    return { success: true, data: updated };
  } catch (error) {
    return { error: 'Erro ao atualizar link' };
  }
}
```

## Complete Example Flow

**Server Component** calls **Mutation**:

```typescript
// /app/dashboard/page.tsx
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

**Mutation** handles logic and calls **Repository**:

```typescript
// /lib/mutations/link-mutations.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { linkRepository } from '@/lib/repositories/link-repository';

export async function getUserLinks() {
  // Authorization
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  // Use Repository for data access
  return await linkRepository.findByUserId(userId);
}
```

## Common Patterns

### Creating Resources
```typescript
export async function createResource(data: CreateData) {
  const validatedData = schema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  return await repository.create({ ...validatedData, userId });
}
```

### Updating Resources
```typescript
export async function updateResource(id: string, data: UpdateData) {
  const validatedData = schema.parse({ id, ...data });
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const resource = await repository.findById(id);
  if (!resource || resource.userId !== userId) {
    throw new Error('Not found or forbidden');
  }
  
  return await repository.update(id, validatedData);
}
```

### Deleting Resources
```typescript
export async function deleteResource(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const resource = await repository.findById(id);
  if (!resource || resource.userId !== userId) {
    throw new Error('Not found or forbidden');
  }
  
  return await repository.delete(id);
}
```

## Using Mutations from Client Components

When you need to call mutations from Client Components, use Server Actions:

```typescript
'use client';

import { createShortLink } from '@/lib/mutations/link-mutations';
import { useState } from 'react';

export function CreateLinkForm() {
  const [url, setUrl] = useState('');
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const link = await createShortLink(url);
      console.log('Link created:', link);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="url" 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
      />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Best Practices

1. **One file per domain** - Group related mutations together (e.g., `link-mutations.ts`, `user-mutations.ts`)
2. **Validate everything** - Never trust input data, always use Zod schemas
3. **Check authorization** - Always verify the user has permission to perform the action
4. **Keep it focused** - Each mutation should do one thing well
5. **Meaningful errors** - Provide clear error messages for users
6. **Use TypeScript** - Leverage type safety for better development experience
7. **Don't expose internals** - Return only necessary data to the client

## Summary

Mutations are the business logic layer that:
- ✅ Handle validation (Zod schemas)
- ✅ Handle authorization (Clerk auth)
- ✅ Implement business rules
- ✅ Call Repository functions for data access
- ❌ Never access Drizzle ORM directly
- ❌ Never put database queries in mutations
