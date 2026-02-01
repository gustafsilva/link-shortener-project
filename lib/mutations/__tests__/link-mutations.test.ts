// Mock external dependencies BEFORE imports
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('@/lib/repositories/link-repository');
jest.mock('@clerk/nextjs/server');
jest.mock('next/cache');

import { createShortLink, getUserLinks, deleteShortLink, updateShortLink } from '../link-mutations';
import { linkRepository } from '@/lib/repositories/link-repository';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

const mockLinkRepository = linkRepository as jest.Mocked<typeof linkRepository>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

describe('link-mutations', () => {
  const mockUserId = 'user_123';
  const mockLink = {
    id: '1',
    userId: mockUserId,
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserLinks', () => {
    it('should return links for authenticated user', async () => {
      // Arrange
      const mockLinks = [mockLink];
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findByUserId.mockResolvedValue(mockLinks);

      // Act
      const result = await getUserLinks();

      // Assert
      expect(result).toEqual(mockLinks);
      expect(mockLinkRepository.findByUserId).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty array for unauthenticated user', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Act
      const result = await getUserLinks();

      // Assert
      expect(result).toEqual([]);
      expect(mockLinkRepository.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('createShortLink', () => {
    it('should create a short link with valid data and auto-generated code', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findByShortCode.mockResolvedValue(undefined);
      mockLinkRepository.create.mockResolvedValue(mockLink);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ success: true, data: mockLink });
      expect(mockLinkRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        originalUrl: 'https://example.com',
        shortCode: expect.any(String),
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should create a short link with custom code', async () => {
      // Arrange
      const customCode = 'custom123';
      const customLink = { ...mockLink, shortCode: customCode };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findByShortCode.mockResolvedValue(undefined);
      mockLinkRepository.create.mockResolvedValue(customLink);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
        customCode,
      });

      // Assert
      expect(result).toEqual({ success: true, data: customLink });
      expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(customCode);
      expect(mockLinkRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        originalUrl: 'https://example.com',
        shortCode: customCode,
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ error: 'Você precisa estar autenticado' });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when URL is invalid', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await createShortLink({
        url: 'invalid-url',
      });

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('URL inválida') 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when custom code is already in use', async () => {
      // Arrange
      const existingLink = {
        id: '2',
        userId: 'other_user',
        originalUrl: 'https://other.com',
        shortCode: 'custom',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findByShortCode.mockResolvedValue(existingLink);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
        customCode: 'custom',
      });

      // Assert
      expect(result).toEqual({ 
        error: 'Este código já está em uso. Por favor, escolha outro.' 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should validate custom code format - too short', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
        customCode: 'ab', // Too short
      });

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('pelo menos 3 caracteres') 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should validate custom code format - too long', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
        customCode: 'a'.repeat(21), // Too long
      });

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('no máximo 20 caracteres') 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should validate custom code format - invalid characters', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
        customCode: 'invalid@code', // Invalid characters
      });

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('apenas letras, números, hífens e underscores') 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });

    it('should retry when auto-generated code collides', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      
      // First call returns existing link (collision), second call returns null (available)
      mockLinkRepository.findByShortCode
        .mockResolvedValueOnce(mockLink)
        .mockResolvedValueOnce(undefined);
      
      mockLinkRepository.create.mockResolvedValue(mockLink);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ success: true, data: mockLink });
      expect(mockLinkRepository.findByShortCode).toHaveBeenCalledTimes(2);
      expect(mockLinkRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should return error after max retry attempts', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      
      // Always return existing link (collision)
      mockLinkRepository.findByShortCode.mockResolvedValue(mockLink);

      // Act
      const result = await createShortLink({
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ 
        error: 'Não foi possível gerar um código único. Tente novamente.' 
      });
      expect(mockLinkRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteShortLink', () => {
    it('should delete a link successfully', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.deleteById.mockResolvedValue(mockLink);

      // Act
      const result = await deleteShortLink('1');

      // Assert
      expect(result).toEqual({ success: true, data: mockLink });
      expect(mockLinkRepository.findById).toHaveBeenCalledWith('1');
      expect(mockLinkRepository.deleteById).toHaveBeenCalledWith('1');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Act
      const result = await deleteShortLink('1');

      // Assert
      expect(result).toEqual({ error: 'Você precisa estar autenticado' });
      expect(mockLinkRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should return error when link is not found', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await deleteShortLink('1');

      // Assert
      expect(result).toEqual({ error: 'Link não encontrado' });
      expect(mockLinkRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should return error when user does not own the link', async () => {
      // Arrange
      const otherUserLink = { ...mockLink, userId: 'other_user' };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(otherUserLink);

      // Act
      const result = await deleteShortLink('1');

      // Assert
      expect(result).toEqual({ 
        error: 'Você não tem permissão para excluir este link' 
      });
      expect(mockLinkRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should return error when ID is empty', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await deleteShortLink('');

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('ID do link é obrigatório') 
      });
      expect(mockLinkRepository.deleteById).not.toHaveBeenCalled();
    });

    it('should return error when deletion fails', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.deleteById.mockResolvedValue(undefined);

      // Act
      const result = await deleteShortLink('1');

      // Assert
      expect(result).toEqual({ error: 'Erro ao excluir link' });
    });
  });

  describe('updateShortLink', () => {
    it('should update a link successfully', async () => {
      // Arrange
      const updatedLink = { ...mockLink, originalUrl: 'https://updated.com' };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.update.mockResolvedValue(updatedLink);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://updated.com',
      });

      // Assert
      expect(result).toEqual({ success: true, data: updatedLink });
      expect(mockLinkRepository.update).toHaveBeenCalledWith('1', {
        originalUrl: 'https://updated.com',
        shortCode: undefined,
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should update a link with new custom code', async () => {
      // Arrange
      const newCode = 'newcode';
      const updatedLink = { ...mockLink, shortCode: newCode };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.findByShortCode.mockResolvedValue(undefined);
      mockLinkRepository.update.mockResolvedValue(updatedLink);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
        customCode: newCode,
      });

      // Assert
      expect(result).toEqual({ success: true, data: updatedLink });
      expect(mockLinkRepository.findByShortCode).toHaveBeenCalledWith(newCode);
      expect(mockLinkRepository.update).toHaveBeenCalledWith('1', {
        originalUrl: 'https://example.com',
        shortCode: newCode,
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ error: 'Você precisa estar autenticado' });
      expect(mockLinkRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when link is not found', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ error: 'Link não encontrado' });
      expect(mockLinkRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when user does not own the link', async () => {
      // Arrange
      const otherUserLink = { ...mockLink, userId: 'other_user' };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(otherUserLink);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ 
        error: 'Você não tem permissão para editar este link' 
      });
      expect(mockLinkRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when new custom code is already in use', async () => {
      // Arrange
      const existingLink = {
        id: '2',
        userId: 'other_user',
        originalUrl: 'https://other.com',
        shortCode: 'taken',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.findByShortCode.mockResolvedValue(existingLink);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
        customCode: 'taken',
      });

      // Assert
      expect(result).toEqual({ 
        error: 'Este código já está em uso. Por favor, escolha outro.' 
      });
      expect(mockLinkRepository.update).not.toHaveBeenCalled();
    });

    it('should not check for code collision when custom code is unchanged', async () => {
      // Arrange
      const updatedLink = { ...mockLink, originalUrl: 'https://updated.com' };
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.update.mockResolvedValue(updatedLink);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://updated.com',
        customCode: mockLink.shortCode, // Same as existing
      });

      // Assert
      expect(result).toEqual({ success: true, data: updatedLink });
      expect(mockLinkRepository.findByShortCode).not.toHaveBeenCalled();
    });

    it('should return error when URL is invalid', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'invalid-url',
      });

      // Assert
      expect(result).toEqual({ 
        error: expect.stringContaining('URL inválida') 
      });
      expect(mockLinkRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when update fails', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);
      mockLinkRepository.findById.mockResolvedValue(mockLink);
      mockLinkRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await updateShortLink({
        id: '1',
        url: 'https://example.com',
      });

      // Assert
      expect(result).toEqual({ error: 'Erro ao atualizar link' });
    });
  });
});
