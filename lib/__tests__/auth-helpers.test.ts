// Mock Clerk auth before importing
jest.mock('@clerk/nextjs/server');

import { requireAuth } from '../auth-helpers';
import { auth } from '@clerk/nextjs/server';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('auth-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return userId when user is authenticated', async () => {
      // Arrange
      const mockUserId = 'user_123';
      mockAuth.mockResolvedValue({ userId: mockUserId } as any);

      // Act
      const result = await requireAuth();

      // Assert
      expect(result).toEqual({ userId: mockUserId });
      expect(mockAuth).toHaveBeenCalled();
    });

    it('should throw error when user is not authenticated', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: null } as any);

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow('Não autorizado. Por favor, faça login.');
      expect(mockAuth).toHaveBeenCalled();
    });

    it('should throw error when userId is undefined', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: undefined } as any);

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow('Não autorizado. Por favor, faça login.');
    });

    it('should throw error when userId is empty string', async () => {
      // Arrange
      mockAuth.mockResolvedValue({ userId: '' } as any);

      // Act & Assert
      await expect(requireAuth()).rejects.toThrow('Não autorizado. Por favor, faça login.');
    });
  });
});
