'use client';

import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo/Nome do Site */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-foreground">
            Link Shortener
          </Link>
        </div>

        {/* Opções do Usuário */}
        <div className="flex items-center gap-4">
          {!isLoaded ? (
            // Loading state
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            // Authenticated user
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </>
          ) : (
            // Unauthenticated user
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">Entrar</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Criar Conta</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
