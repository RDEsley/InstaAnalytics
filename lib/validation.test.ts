import { sanitizeUsername, usernameSchema } from './validation';

describe('Validation Functions', () => {
  describe('sanitizeUsername', () => {
    test('removes @ symbol at the beginning', () => {
      expect(sanitizeUsername('@instagram')).toBe('instagram');
    });
    
    test('trims whitespace', () => {
      expect(sanitizeUsername(' instagram ')).toBe('instagram');
    });
    
    test('converts to lowercase', () => {
      expect(sanitizeUsername('Instagram')).toBe('instagram');
    });
    
    test('combines all transformations', () => {
      expect(sanitizeUsername('@Instagram ')).toBe('instagram');
    });
  });
  
  describe('usernameSchema', () => {
    test('accepts valid Instagram handle', () => {
      const result = usernameSchema.safeParse('instagram');
      expect(result.success).toBe(true);
    });
    
    test('accepts valid Instagram handle with @', () => {
      const result = usernameSchema.safeParse('@instagram');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('instagram');
      }
    });
    
    test('rejects handles with invalid characters', () => {
      const result = usernameSchema.safeParse('instagram!');
      expect(result.success).toBe(false);
    });
    
    test('rejects handles that are too long', () => {
      const result = usernameSchema.safeParse('a'.repeat(31));
      expect(result.success).toBe(false);
    });
  });
});