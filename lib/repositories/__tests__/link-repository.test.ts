import { linkRepository } from '../link-repository';
import { db } from '@/db';
import { shortLinks } from '@/db/schema';

// Mock database
jest.mock('@/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('linkRepository', () => {
  const mockLink = {
    id: '1',
    userId: 'user_123',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new link', async () => {
      // Arrange
      const mockData = {
        userId: 'user_123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
      };

      const mockReturning = jest.fn().mockResolvedValue([mockLink]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.insert.mockReturnValue({ values: mockValues } as any);

      // Act
      const result = await linkRepository.create(mockData);

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.insert).toHaveBeenCalledWith(shortLinks);
      expect(mockValues).toHaveBeenCalledWith(mockData);
      expect(mockReturning).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should find all links for a user', async () => {
      // Arrange
      const mockLinks = [mockLink];
      const mockOrderBy = jest.fn().mockResolvedValue(mockLinks);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findByUserId('user_123');

      // Assert
      expect(result).toEqual(mockLinks);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(shortLinks);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
    });

    it('should return empty array when user has no links', async () => {
      // Arrange
      const mockOrderBy = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findByUserId('user_123');

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByShortCode', () => {
    it('should find link by short code', async () => {
      // Arrange
      const mockLimit = jest.fn().mockResolvedValue([mockLink]);
      const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findByShortCode('abc123');

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(shortLinks);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should return undefined when link not found', async () => {
      // Arrange
      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findByShortCode('nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find link by id', async () => {
      // Arrange
      const mockLimit = jest.fn().mockResolvedValue([mockLink]);
      const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findById('1');

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(shortLinks);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it('should return undefined when link not found', async () => {
      // Arrange
      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findById('nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('deleteById', () => {
    it('should delete link by id', async () => {
      // Arrange
      const mockReturning = jest.fn().mockResolvedValue([mockLink]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.delete.mockReturnValue({ where: mockWhere } as any);

      // Act
      const result = await linkRepository.deleteById('1');

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.delete).toHaveBeenCalledWith(shortLinks);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
    });

    it('should return undefined when link not found', async () => {
      // Arrange
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.delete.mockReturnValue({ where: mockWhere } as any);

      // Act
      const result = await linkRepository.deleteById('nonexistent');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update link with full data', async () => {
      // Arrange
      const updateData = {
        originalUrl: 'https://updated.com',
        shortCode: 'newcode',
      };
      const updatedLink = { ...mockLink, ...updateData };

      const mockReturning = jest.fn().mockResolvedValue([updatedLink]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet } as any);

      // Act
      const result = await linkRepository.update('1', updateData);

      // Assert
      expect(result).toEqual(updatedLink);
      expect(mockDb.update).toHaveBeenCalledWith(shortLinks);
      expect(mockSet).toHaveBeenCalledWith(updateData);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
    });

    it('should update link with partial data (originalUrl only)', async () => {
      // Arrange
      const updateData = {
        originalUrl: 'https://updated.com',
      };
      const updatedLink = { ...mockLink, ...updateData };

      const mockReturning = jest.fn().mockResolvedValue([updatedLink]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet } as any);

      // Act
      const result = await linkRepository.update('1', updateData);

      // Assert
      expect(result).toEqual(updatedLink);
      expect(mockSet).toHaveBeenCalledWith(updateData);
    });

    it('should update link with partial data (shortCode only)', async () => {
      // Arrange
      const updateData = {
        shortCode: 'newcode',
      };
      const updatedLink = { ...mockLink, ...updateData };

      const mockReturning = jest.fn().mockResolvedValue([updatedLink]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet } as any);

      // Act
      const result = await linkRepository.update('1', updateData);

      // Assert
      expect(result).toEqual(updatedLink);
      expect(mockSet).toHaveBeenCalledWith(updateData);
    });

    it('should return undefined when link not found', async () => {
      // Arrange
      const updateData = {
        originalUrl: 'https://updated.com',
      };

      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.update.mockReturnValue({ set: mockSet } as any);

      // Act
      const result = await linkRepository.update('nonexistent', updateData);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
