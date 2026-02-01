// Add custom jest matchers from jest-dom
require('@testing-library/jest-dom');

// Mock Next.js modules
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
