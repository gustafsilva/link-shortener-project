---
description: Read this file to understand how to implement unit tests for mutations, repositories, and utility functions using Jest.
---
# Unit Testing Instructions

This document provides guidelines on how to write unit tests for the Link Shortener project. We focus on testing business logic (mutations), data access (repositories), and utility functions using Jest.

## What to Test

✅ **DO test:**
- Mutations (business logic layer)
- Repositories (data access layer)
- Utility functions
- Helper functions
- Authentication/authorization flows

❌ **DON'T test:**
- Visual components (React components)
- UI interactions
- E2E flows (use separate E2E testing tools)

## Testing Stack

- **Test Framework**: Jest
- **Mocking**: Jest mocks
- **Type Safety**: TypeScript
- **Test Location**: `__tests__` directory alongside source files

## File Structure

```
/lib
  /mutations
    link-mutations.ts
    __tests__
      link-mutations.test.ts
  /repositories
    link-repository.ts
    __tests__
      link-repository.test.ts
  utils.ts
  __tests__
    utils.test.ts
```

## Testing Mutations

Mutations contain business logic and should be thoroughly tested. Mock all external dependencies including repositories, authentication, and Next.js functions.

### Setup

```typescript
import { createShortLink, getUserLinks, deleteShortLink } from '../link-mutations';
import { linkRepository } from '@/lib/repositories/link-repository';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Mock external dependencies
jest.mock('@/lib/repositories/link-repository');
jest.mock('@clerk/nextjs/server');
jest.mock('next/cache');

const mockLinkRepository = linkRepository as jest.Mocked<typeof linkRepository>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;
```

### Example: Testing createShortLink

```typescript
describe('createShortLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a short link with valid data', async () => {
    // Arrange
    const mockUserId = 'user_123';
    const mockLink = {
      id: '1',
      userId: mockUserId,
      originalUrl: 'https://example.com',
      shortCode: 'abc123',
      createdAt: new Date(),
    };

    mockAuth.mockResolvedValue({ userId: mockUserId });
    mockLinkRepository.findByShortCode.mockResolvedValue(null);
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

  it('should return error when user is not authenticated', async () => {
    // Arrange
    mockAuth.mockResolvedValue({ userId: null });

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
    mockAuth.mockResolvedValue({ userId: 'user_123' });

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
    const mockUserId = 'user_123';
    const existingLink = {
      id: '1',
      userId: 'other_user',
      originalUrl: 'https://other.com',
      shortCode: 'custom',
      createdAt: new Date(),
    };

    mockAuth.mockResolvedValue({ userId: mockUserId });
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

  it('should validate custom code format', async () => {
    // Arrange
    mockAuth.mockResolvedValue({ userId: 'user_123' });

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
});
```

### Key Testing Patterns for Mutations

1. **Test Authorization**: Always test authenticated and unauthenticated scenarios
2. **Test Validation**: Test all Zod schema validations (invalid data, edge cases)
3. **Test Business Logic**: Test all business rules and logic paths
4. **Test Error Handling**: Ensure errors are returned, not thrown
5. **Mock All External Dependencies**: Mock repositories, auth, revalidation, etc.

## Testing Repositories

Repositories handle database operations. Mock the database connection and Drizzle ORM functions.

### Setup

```typescript
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
```

### Example: Testing linkRepository.create

```typescript
describe('linkRepository', () => {
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
      
      const mockLink = {
        id: '1',
        ...mockData,
        createdAt: new Date(),
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

  describe('findByShortCode', () => {
    it('should find link by short code', async () => {
      // Arrange
      const mockLink = {
        id: '1',
        userId: 'user_123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        createdAt: new Date(),
      };

      const mockLimit = jest.fn().mockResolvedValue([mockLink]);
      const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      mockDb.select.mockReturnValue({ from: mockFrom } as any);

      // Act
      const result = await linkRepository.findByShortCode('abc123');

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.select).toHaveBeenCalled();
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

  describe('deleteById', () => {
    it('should delete link by id', async () => {
      // Arrange
      const mockLink = {
        id: '1',
        userId: 'user_123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        createdAt: new Date(),
      };

      const mockReturning = jest.fn().mockResolvedValue([mockLink]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      mockDb.delete.mockReturnValue({ where: mockWhere } as any);

      // Act
      const result = await linkRepository.deleteById('1');

      // Assert
      expect(result).toEqual(mockLink);
      expect(mockDb.delete).toHaveBeenCalledWith(shortLinks);
    });
  });
});
```

### Key Testing Patterns for Repositories

1. **Mock Database**: Always mock the db instance from @/db
2. **Test CRUD Operations**: Test create, read, update, delete operations
3. **Test Query Logic**: Verify correct query construction (where, limit, orderBy)
4. **Test Return Values**: Ensure correct data shape is returned
5. **Test Edge Cases**: Test empty results, multiple results, etc.

## Testing Utility Functions

Utility functions are typically pure functions and easier to test. No mocking needed for most cases.

### Example: Testing cn utility

```typescript
import { cn } from '../utils';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', {
      'active-class': true,
      'inactive-class': false,
    });
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('inactive-class');
  });

  it('should handle tailwind class conflicts', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2'); // Last one wins
  });
});
```

### Example: Testing generateShortCode helper

```typescript
import { generateShortCode } from '../helpers';

describe('generateShortCode', () => {
  it('should generate code with default length of 7', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(7);
  });

  it('should generate code with only alphanumeric characters', () => {
    const code = generateShortCode();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should generate different codes on each call', () => {
    const code1 = generateShortCode();
    const code2 = generateShortCode();
    expect(code1).not.toBe(code2);
  });

  it('should generate code with custom length', () => {
    const code = generateShortCode(10);
    expect(code).toHaveLength(10);
  });
});
```

## Jest Configuration

Ensure your `jest.config.js` is properly configured:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts',
    '!lib/**/__tests__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

## Best Practices

### ✅ DO:
- Write tests for all mutations
- Write tests for all repository functions
- Write tests for all utility/helper functions
- Mock all external dependencies (auth, db, Next.js functions)
- Test both success and error scenarios
- Test validation logic thoroughly
- Use descriptive test names (it should...)
- Follow AAA pattern: Arrange, Act, Assert
- Clear mocks between tests with `beforeEach`
- Test edge cases and boundary conditions

### ❌ DON'T:
- Don't test React components (use separate E2E or component testing tools)
- Don't test Next.js internals
- Don't make real database calls in unit tests
- Don't make real API calls
- Don't skip error scenarios
- Don't test implementation details, test behavior
- Don't leave console.log in tests

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test link-mutations.test.ts

# Run tests matching pattern
yarn test --testNamePattern="createShortLink"
```

## Coverage Goals

Aim for high coverage on business-critical code:

- **Mutations**: 90%+ coverage
- **Repositories**: 85%+ coverage
- **Utilities**: 80%+ coverage

## Example Test Patterns

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Scenarios

```typescript
it('should return error when operation fails', async () => {
  mockRepository.create.mockRejectedValue(new Error('DB Error'));
  
  const result = await mutation({ data: 'test' });
  
  expect(result).toEqual({ error: expect.any(String) });
});
```

### Testing with Multiple Conditions

```typescript
it.each([
  ['invalid-url', 'URL inválida'],
  ['', 'URL é obrigatória'],
  ['http://', 'URL inválida'],
])('should validate URL: %s', async (url, expectedError) => {
  const result = await createShortLink({ url });
  expect(result).toEqual({ error: expect.stringContaining(expectedError) });
});
```

### Testing Time-Dependent Code

```typescript
it('should set createdAt to current time', () => {
  const mockDate = new Date('2024-01-01');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  
  const result = createEntity();
  
  expect(result.createdAt).toEqual(mockDate);
});
```

## Summary

Unit testing in this project focuses on testing:
1. **Mutations** - Business logic with mocked dependencies
2. **Repositories** - Data access with mocked database
3. **Utilities** - Pure functions without mocks

Follow the AAA pattern, mock external dependencies, test both success and error paths, and maintain high coverage on critical business logic.
