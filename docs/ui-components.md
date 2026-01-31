# UI Components Guidelines

## Overview

This application uses **shadcn/ui** exclusively for all UI components. All components follow the **New York** style variant.

## Core Rules

### 1. shadcn/ui Only
- **ALWAYS** use shadcn/ui components for UI elements
- **NEVER** create custom UI components from scratch
- **NEVER** use other component libraries (Material-UI, Ant Design, Chakra, etc.)
- All buttons, inputs, modals, cards, etc. must come from shadcn/ui

### 2. Component Installation

When you need a component that's not yet in the project:

```bash
npx shadcn@latest add [component-name]
```

Examples:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add form
```

### 3. Component Usage

Always import from `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Available Components

Common shadcn/ui components you can use:

### Layout & Structure
- `card` - Container component
- `separator` - Divider line
- `scroll-area` - Custom scrollbar

### Forms & Inputs
- `button` - Buttons with variants
- `input` - Text inputs
- `textarea` - Multi-line text
- `checkbox` - Checkboxes
- `radio-group` - Radio buttons
- `select` - Dropdown select
- `switch` - Toggle switch
- `form` - Form wrapper with validation
- `label` - Form labels

### Overlays & Feedback
- `dialog` - Modal dialogs
- `alert-dialog` - Confirmation dialogs
- `popover` - Popup content
- `tooltip` - Hover tooltips
- `toast` - Notifications
- `alert` - Alert messages
- `sheet` - Side panel/drawer

### Display
- `badge` - Status badges
- `avatar` - User avatars
- `table` - Data tables
- `tabs` - Tab navigation
- `accordion` - Collapsible content
- `dropdown-menu` - Context menus
- `skeleton` - Loading placeholders

### Navigation
- `navigation-menu` - Main navigation
- `breadcrumb` - Breadcrumb navigation
- `pagination` - Page navigation

## Styling Components

### Using Variants
shadcn/ui components come with predefined variants:

```tsx
// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Button sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Extending with Tailwind
You can add Tailwind classes for additional styling:

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>

<Card className="max-w-md mx-auto shadow-lg">
  <CardContent>...</CardContent>
</Card>
```

## Composition Pattern

Build complex UIs by composing shadcn/ui components:

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginCard() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign In</Button>
      </CardFooter>
    </Card>
  );
}
```

## Form Handling

Use shadcn/ui Form with react-hook-form and zod:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email(),
});

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Icons

Use **Lucide React** for icons (bundled with shadcn/ui):

```tsx
import { Check, X, Loader2, ChevronDown } from "lucide-react";

<Button>
  <Check className="mr-2 h-4 w-4" />
  Confirm
</Button>

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

## Configuration

shadcn/ui is configured in [components.json](components.json):

```json
{
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## What NOT to Do

❌ Don't create custom buttons, inputs, or form elements
❌ Don't use HTML elements directly for UI (`<button>`, `<input>`, etc.)
❌ Don't install other UI libraries
❌ Don't write custom modal/dialog logic
❌ Don't create custom dropdown/select components
❌ Don't reinvent components that exist in shadcn/ui

## When to Add a Component

Before creating any UI element, check:

1. **Does shadcn/ui have this component?** → Use it
2. **Is the component already installed?** → Check `/components/ui`
3. **Need to install it?** → Run `npx shadcn@latest add [component-name]`

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Lucide Icons](https://lucide.dev)

## Custom Components

### Navbar Component

The application includes a custom Navbar component that integrates Clerk authentication with shadcn/ui components.

**Location**: `/components/navbar.tsx`

**Features**:
- Displays site name/logo on the left
- Shows authentication options on the right
- Uses Clerk modals for sign in/sign up (no page navigation)
- Displays user button and dashboard link when authenticated
- Responsive design with proper loading states

**Usage**:
```tsx
import { Navbar } from "@/components/navbar";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
```

**Implementation Pattern**:
```tsx
'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">Site Name</Link>
        
        {/* Auth Options */}
        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <LoadingSkeleton />
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

**Key Points**:
- Component is a **Client Component** (`'use client'`) because it uses Clerk hooks
- Uses `useAuth()` hook to check authentication state
- Implements loading state while auth is initializing
- Uses shadcn/ui `Button` component for consistent styling
- Sign in/sign up buttons use `mode="modal"` to open in modals (not navigate to new pages)
- Follows composition pattern with shadcn/ui components
