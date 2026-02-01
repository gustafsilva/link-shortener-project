import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toBe('text-red-500 bg-blue-500');
    });

    it('should handle single class name', () => {
      const result = cn('text-red-500');
      expect(result).toBe('text-red-500');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
      expect(result).not.toContain('disabled-class');
    });

    it('should handle tailwind class conflicts', () => {
      // twMerge should resolve conflicts, keeping the last one
      const result = cn('p-4', 'p-6');
      expect(result).toBe('p-6');
    });

    it('should handle complex tailwind conflicts', () => {
      const result = cn('px-4 py-2', 'p-6');
      // p-6 overrides both px and py
      expect(result).toBe('p-6');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['text-red-500', 'bg-blue-500']);
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle undefined and null values', () => {
      const result = cn('text-red-500', undefined, null, 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle object syntax with clsx', () => {
      const result = cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'border': true,
      });
      
      expect(result).toContain('text-red-500');
      expect(result).not.toContain('bg-blue-500');
      expect(result).toContain('border');
    });

    it('should combine multiple input types', () => {
      const result = cn(
        'base-class',
        ['array-class-1', 'array-class-2'],
        {
          'object-class': true,
          'excluded-class': false,
        },
        'final-class'
      );
      
      expect(result).toContain('base-class');
      expect(result).toContain('array-class-1');
      expect(result).toContain('array-class-2');
      expect(result).toContain('object-class');
      expect(result).not.toContain('excluded-class');
      expect(result).toContain('final-class');
    });

    it('should handle variant conflicts correctly', () => {
      // When using variants, the last one should win
      const result = cn(
        'bg-red-500',
        'hover:bg-blue-500',
        'bg-green-500'
      );
      
      expect(result).toContain('hover:bg-blue-500');
      expect(result).toContain('bg-green-500');
      expect(result).not.toContain('bg-red-500');
    });

    it('should handle responsive classes', () => {
      const result = cn(
        'text-sm',
        'md:text-base',
        'lg:text-lg'
      );
      
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
    });

    it('should handle whitespace correctly', () => {
      const result = cn('  text-red-500  ', '  bg-blue-500  ');
      expect(result).not.toContain('  ');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });
  });
});
