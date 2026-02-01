---
description: Read this file to understand how to create and use Server Functions (Server Actions) in Next.js with proper error handling and best practices.
---
# Server Functions Instructions
This document provides guidelines on how to implement Server Functions (Server Actions) in Next.js following best practices for error handling and Server Components integration.

## What are Server Functions?

Server Functions (also called Server Actions) are asynchronous functions that run exclusively on the server in Next.js. They enable you to handle form submissions, data mutations, and server-side logic directly from Server Components.

## Architecture Context

```
Server Component → Server Function/Mutation → Repository → Database
```

**Server Functions:**
- Execute only on the server (never sent to the client)
- Can be called from Server Components or Client Components
- Handle data mutations and server-side operations
- Must return serializable data (no functions, classes, or complex objects)
- Should handle errors by returning error objects, not throwing

## File Organization

Server Functions are typically implemented as mutations in the `/lib/mutations/` directory:

```
/lib
  /mutations
    link-mutations.ts    # Link-related server functions
    user-mutations.ts    # User-related server functions
```

See [mutations.instructions.md](./mutations.instructions.md) for detailed mutation layer guidelines.

## Basic Server Function Structure

```typescript
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

export async function createItem(data: { name: string }) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Não autenticado' };
    }
    
    // 2. Validate input
    const validatedData = schema.parse(data);
    
    // 3. Business logic
    const item = await repository.create({
      ...validatedData,
      userId,
    });
    
    // 4. Revalidate cache
    revalidatePath('/dashboard');
    
    // 5. Return success
    return { success: true, data: item };
  } catch (error) {
    // 6. Handle errors - RETURN, don't throw
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar item' };
  }
}
```

## Critical Error Handling Rules

### ✅ ALWAYS Return Error Objects

**DO THIS:**
```typescript
'use server';

export async function createLink(url: string) {
  try {
    // ... logic
    return { success: true, data: link };
  } catch (error) {
    // Return error object - don't throw
    return { error: 'Erro ao criar link' };
  }
}
```

**DON'T DO THIS:**
```typescript
'use server';

export async function createLink(url: string) {
  // ❌ Don't throw errors from server functions
  if (!url) {
    throw new Error('URL é obrigatória');
  }
  
  // ❌ Don't let errors bubble up uncaught
  const link = await repository.create(url);
  return link;
}
```

### Why Return Errors Instead of Throwing?

1. **Better UX**: Allows graceful error handling in components
2. **Type Safety**: Consumers can check `if ('error' in result)`
3. **No Crashes**: Prevents unhandled promise rejections
4. **Predictable**: Consistent error handling pattern across the app

## Return Type Pattern

Use a discriminated union type for server function returns:

```typescript
'use server';

type Result<T> = 
  | { success: true; data: T }
  | { error: string };

export async function createLink(url: string): Promise<Result<Link>> {
  try {
    // ... validation and logic
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar link' };
  }
}
```

## Validation Pattern

Always validate input data using Zod schemas:

```typescript
'use server';

import { z } from 'zod';

const createLinkSchema = z.object({
  url: z.string().url('URL inválida'),
  customCode: z.string().min(3).max(20).optional(),
});

export async function createLink(data: { url: string; customCode?: string }) {
  try {
    // Validate input
    const validatedData = createLinkSchema.parse(data);
    
    // ... rest of logic
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar link' };
  }
}
```

## Authentication Pattern

Use Clerk's `auth()` for authentication checks:

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';

export async function protectedAction() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { error: 'Você precisa estar autenticado' };
    }
    
    // ... rest of logic
    return { success: true, data: result };
  } catch (error) {
    return { error: 'Erro na operação' };
  }
}
```

Or use the helper function:

```typescript
'use server';

import { requireAuth } from '@/lib/auth-helpers';

export async function protectedAction() {
  try {
    const { userId } = await requireAuth();
    
    // ... rest of logic
    return { success: true, data: result };
  } catch (error) {
    // requireAuth throws if not authenticated
    return { error: 'Erro na operação' };
  }
}
```

## Cache Revalidation

Use `revalidatePath` to update cached data after mutations:

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createLink(data: LinkData) {
  try {
    const link = await repository.create(data);
    
    // Revalidate the dashboard to show new link
    revalidatePath('/dashboard');
    
    // Revalidate specific dynamic routes if needed
    revalidatePath(`/links/${link.shortCode}`);
    
    return { success: true, data: link };
  } catch (error) {
    return { error: 'Erro ao criar link' };
  }
}
```

## Using Server Functions in Server Components

Server Components can directly call server functions:

```tsx
// app/dashboard/page.tsx
import { getUserLinks } from '@/lib/mutations/link-mutations';

export default async function DashboardPage() {
  // Direct call - no need for useEffect or useState
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

## Using Server Functions in Client Components

Client Components can call server functions via form actions or event handlers:

```tsx
'use client';

import { createLink } from '@/lib/mutations/link-mutations';
import { useState } from 'react';

export function CreateLinkForm() {
  const [error, setError] = useState<string | null>(null);
  
  async function handleSubmit(formData: FormData) {
    const url = formData.get('url') as string;
    
    // Call server function
    const result = await createLink({ url });
    
    // Handle result
    if ('error' in result) {
      setError(result.error);
    } else {
      setError(null);
      // Handle success
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="url" type="url" />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Create Link</button>
    </form>
  );
}
```

## Server Components Best Practices

### ✅ DO:
- **Default to Server Components** - Use them unless you need client interactivity
- **Fetch data directly** - Call server functions or repositories directly in async components
- **Keep components simple** - One responsibility per component
- **Pass data down** - Fetch in parent, pass to children as props
- **Use Suspense** - Show loading states for async components

### ❌ DON'T:
- **Don't use hooks** - No useState, useEffect, etc. in Server Components
- **Don't use browser APIs** - No window, document, localStorage
- **Don't add event handlers** - No onClick, onChange, etc.
- **Don't use Context** - Use props or fetch data where needed

## Server Component Example

```tsx
// app/dashboard/page.tsx - Server Component
import { Suspense } from 'react';
import { getUserLinks } from '@/lib/mutations/link-mutations';
import { LinkCard } from '@/components/link-card';
import { CreateLinkDialog } from '@/components/create-link-dialog';

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const links = await getUserLinks();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Links</h1>
        {/* Client Component for interactivity */}
        <CreateLinkDialog />
      </div>
      
      <div className="grid gap-4">
        {links.length === 0 ? (
          <p className="text-muted-foreground">No links yet</p>
        ) : (
          links.map(link => (
            <LinkCard key={link.id} link={link} />
          ))
        )}
      </div>
    </div>
  );
}
```

## Loading States with Suspense

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';

async function LinksList() {
  const links = await getUserLinks();
  return (
    <div>
      {links.map(link => <LinkCard key={link.id} link={link} />)}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>My Links</h1>
      <Suspense fallback={<div>Loading links...</div>}>
        <LinksList />
      </Suspense>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Create Resource

```typescript
'use server';

export async function createResource(data: CreateData) {
  try {
    const { userId } = await requireAuth();
    const validatedData = schema.parse(data);
    
    const resource = await repository.create({
      ...validatedData,
      userId,
    });
    
    revalidatePath('/dashboard');
    return { success: true, data: resource };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar recurso' };
  }
}
```

### Pattern 2: Update Resource

```typescript
'use server';

export async function updateResource(id: string, data: UpdateData) {
  try {
    const { userId } = await requireAuth();
    
    // Verify ownership
    const resource = await repository.findById(id);
    if (!resource) {
      return { error: 'Recurso não encontrado' };
    }
    if (resource.userId !== userId) {
      return { error: 'Você não tem permissão para editar este recurso' };
    }
    
    const validatedData = schema.parse(data);
    const updated = await repository.update(id, validatedData);
    
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao atualizar recurso' };
  }
}
```

### Pattern 3: Delete Resource

```typescript
'use server';

export async function deleteResource(id: string) {
  try {
    const { userId } = await requireAuth();
    
    // Verify ownership
    const resource = await repository.findById(id);
    if (!resource) {
      return { error: 'Recurso não encontrado' };
    }
    if (resource.userId !== userId) {
      return { error: 'Você não tem permissão para deletar este recurso' };
    }
    
    await repository.delete(id);
    
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Erro ao deletar recurso' };
  }
}
```

## Rules Summary

### Server Function Rules:
1. **Always** use `'use server'` directive at the top of the file
2. **Always** return error objects instead of throwing
3. **Always** validate input with Zod schemas
4. **Always** check authentication and authorization
5. **Always** revalidate paths after mutations
6. **Always** return serializable data only

### Server Component Rules:
1. **Default** to Server Components unless you need client interactivity
2. **Fetch data** directly in async Server Components
3. **No hooks** - useState, useEffect, etc. are not allowed
4. **No event handlers** - onClick, onChange, etc. are not allowed
5. **Use Suspense** for loading states
6. **Pass data** down to children as props

## Complete Example

**Server Function:**
```typescript
// /lib/mutations/link-mutations.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';
import { linkRepository } from '@/lib/repositories/link-repository';

const createLinkSchema = z.object({
  url: z.string().url('URL inválida'),
  customCode: z.string().min(3).max(20).optional(),
});

type CreateLinkResult = 
  | { success: true; data: Link }
  | { error: string };

export async function createShortLink(
  data: { url: string; customCode?: string }
): Promise<CreateLinkResult> {
  try {
    const { userId } = await requireAuth();
    const validatedData = createLinkSchema.parse(data);
    
    const link = await linkRepository.create({
      ...validatedData,
      userId,
    });
    
    revalidatePath('/dashboard');
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar link' };
  }
}
```

**Server Component:**
```tsx
// app/dashboard/page.tsx
import { getUserLinks } from '@/lib/mutations/link-mutations';
import { CreateLinkDialog } from '@/components/create-link-dialog';

export default async function DashboardPage() {
  const links = await getUserLinks();
  
  return (
    <div>
      <h1>My Links</h1>
      <CreateLinkDialog />
      <div>
        {links.map(link => (
          <div key={link.id}>{link.shortCode}</div>
        ))}
      </div>
    </div>
  );
}
```

## Related Documentation

- [mutations.instructions.md](./mutations.instructions.md) - Detailed mutation layer guidelines
- [data-fetching.instructions.md](./data-fetching.instructions.md) - Repository and data access patterns
