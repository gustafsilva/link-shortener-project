import { auth } from '@clerk/nextjs/server';

/**
 * Require authentication and return the user ID
 * @throws Error if user is not authenticated
 * @returns Promise with the authenticated user information
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Não autorizado. Por favor, faça login.');
  }
  
  return { userId };
}
