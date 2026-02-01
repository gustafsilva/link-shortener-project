'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { linkRepository } from '@/lib/repositories/link-repository';
import { revalidatePath } from 'next/cache';
import type { shortLinks } from '@/db/schema';

type Link = typeof shortLinks.$inferSelect;

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

const deleteLinkSchema = z.object({
  id: z.string().min(1, 'ID do link é obrigatório'),
});

const updateLinkSchema = z.object({
  id: z.string().min(1, 'ID do link é obrigatório'),
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
export async function getUserLinks(): Promise<Link[]> {
  const { userId } = await auth();
  
  if (!userId) {
    return [];
  }
  
  return await linkRepository.findByUserId(userId);
}

// Create a new short link
export async function createShortLink(
  data: { url: string; customCode?: string }
): Promise<{ success: true; data: Link } | { error: string }> {
  try {
    // Authorization
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Você precisa estar autenticado' };
    }
    
    // Validate input
    const validatedData = createLinkSchema.parse(data);
    
    // Generate or use custom code
    let shortCode = validatedData.customCode || generateShortCode();
    
    // Check if custom code already exists
    if (validatedData.customCode) {
      const existing = await linkRepository.findByShortCode(validatedData.customCode);
      if (existing) {
        return { error: 'Este código já está em uso. Por favor, escolha outro.' };
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
        return { error: 'Não foi possível gerar um código único. Tente novamente.' };
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
    
    return { success: true, data: link };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao criar link' };
  }
}

// Delete a link
export async function deleteShortLink(
  id: string
): Promise<{ success: true; data: Link } | { error: string }> {
  try {
    // Authorization
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Você precisa estar autenticado' };
    }
    
    // Validate input
    const validatedData = deleteLinkSchema.parse({ id });
    
    // Verify ownership before deletion
    const link = await linkRepository.findById(validatedData.id);
    if (!link) {
      return { error: 'Link não encontrado' };
    }
    
    if (link.userId !== userId) {
      return { error: 'Você não tem permissão para excluir este link' };
    }
    
    // Delete link
    const deleted = await linkRepository.deleteById(validatedData.id);
    
    if (!deleted) {
      return { error: 'Erro ao excluir link' };
    }
    
    // Revalidate dashboard page
    revalidatePath('/dashboard');
    
    return { success: true, data: deleted };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao excluir link' };
  }
}

// Update a link
export async function updateShortLink(
  data: { id: string; url: string; customCode?: string }
): Promise<{ success: true; data: Link } | { error: string }> {
  try {
    // Authorization
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Você precisa estar autenticado' };
    }
    
    // Validate input
    const validatedData = updateLinkSchema.parse(data);
    
    // Verify ownership before update
    const link = await linkRepository.findById(validatedData.id);
    if (!link) {
      return { error: 'Link não encontrado' };
    }
    
    if (link.userId !== userId) {
      return { error: 'Você não tem permissão para editar este link' };
    }
    
    // Check if custom code is being changed and if it already exists
    if (validatedData.customCode && validatedData.customCode !== link.shortCode) {
      const existing = await linkRepository.findByShortCode(validatedData.customCode);
      if (existing) {
        return { error: 'Este código já está em uso. Por favor, escolha outro.' };
      }
    }
    
    // Update link
    const updated = await linkRepository.update(validatedData.id, {
      originalUrl: validatedData.url,
      shortCode: validatedData.customCode,
    });
    
    if (!updated) {
      return { error: 'Erro ao atualizar link' };
    }
    
    // Revalidate dashboard page
    revalidatePath('/dashboard');
    
    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: 'Erro ao atualizar link' };
  }
}
