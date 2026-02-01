'use server';

import { z } from 'zod';
import { linkRepository } from '@/lib/repositories/link-repository';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth-helpers';

// Validation schemas
const createLinkSchema = z.object({
  url: z.string().url('URL inválida. Por favor, insira uma URL válida.'),
  customCode: z
    .string()
    .min(3, 'O código deve ter pelo menos 3 caracteres.')
    .max(20, 'O código deve ter no máximo 20 caracteres.')
    .regex(/^[a-zA-Z0-9-_]+$/, 'O código deve conter apenas letras, números, hífens e underscores.')
    .optional(),
});

// Helper function to generate random short code
function generateShortCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Get all links for the current user
export async function getUserLinks() {
  const { userId } = await requireAuth();
  
  return await linkRepository.findByUserId(userId);
}

// Create a new short link
export async function createShortLink(data: { url: string; customCode?: string }) {
  // Authorization
  const { userId } = await requireAuth();
  
  // Validate input
  const validatedData = createLinkSchema.parse(data);
  
  // Generate or use custom code
  let shortCode = validatedData.customCode || generateShortCode();
  
  // Check if custom code already exists
  if (validatedData.customCode) {
    const existing = await linkRepository.findByShortCode(validatedData.customCode);
    if (existing) {
      throw new Error('Este código já está em uso. Por favor, escolha outro.');
    }
  } else {
    // Ensure generated code is unique
    let attempts = 0;
    let existing = await linkRepository.findByShortCode(shortCode);
    
    while (existing && attempts < 10) {
      shortCode = generateShortCode();
      existing = await linkRepository.findByShortCode(shortCode);
      attempts++;
    }
    
    if (attempts >= 10) {
      throw new Error('Não foi possível gerar um código único. Tente novamente.');
    }
  }
  
  // Create link
  const link = await linkRepository.create({
    userId,
    originalUrl: validatedData.url,
    shortCode,
  });
  
  // Revalidate dashboard page
  revalidatePath('/dashboard');
  
  return link;
}

// Delete a link
export async function deleteShortLink(id: string) {
  const { userId } = await requireAuth();
  
  const deleted = await linkRepository.deleteById(id, userId);
  
  // Revalidate dashboard page
  revalidatePath('/dashboard');
  
  return deleted;
}
