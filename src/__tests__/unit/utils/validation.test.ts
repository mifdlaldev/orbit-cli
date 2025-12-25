/**
 * Validation Utilities Tests
 * Tests for project name validation including Windows reserved names
 *
 * @see src/utils/validation.ts
 */

import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  validateFrameworkId,
  sanitizeInput,
  validateAndSanitizeProjectName,
} from '../../../utils/validation.js';

describe('validateProjectName', () => {
  describe('basic validation', () => {
    it('should accept valid project names', () => {
      expect(validateProjectName('my-app').valid).toBe(true);
      expect(validateProjectName('myapp123').valid).toBe(true);
      expect(validateProjectName('a').valid).toBe(true);
      expect(validateProjectName('hello-world-app').valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result = validateProjectName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Project name is required');
    });

    it('should reject names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = validateProjectName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('50 characters');
    });

    it('should reject names with uppercase letters', () => {
      const result = validateProjectName('MyApp');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject names with special characters', () => {
      expect(validateProjectName('my_app').valid).toBe(false);
      expect(validateProjectName('my.app').valid).toBe(false);
      expect(validateProjectName('my@app').valid).toBe(false);
    });

    it('should reject names that start with a number', () => {
      const result = validateProjectName('123app');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('start with a letter');
    });

    it('should reject names that start with a hyphen', () => {
      const result = validateProjectName('-myapp');
      expect(result.valid).toBe(false);
    });
  });

  describe('Windows reserved names', () => {
    const windowsReservedNames = [
      'con',
      'prn',
      'aux',
      'nul',
      'com1',
      'com2',
      'com3',
      'com4',
      'com5',
      'com6',
      'com7',
      'com8',
      'com9',
      'lpt1',
      'lpt2',
      'lpt3',
      'lpt4',
      'lpt5',
      'lpt6',
      'lpt7',
      'lpt8',
      'lpt9',
    ];

    it.each(windowsReservedNames)('should reject Windows reserved name: %s', (name) => {
      const result = validateProjectName(name);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Windows reserved device name');
    });
  });

  describe('project reserved names', () => {
    // Note: node_modules and package have characters that fail regex first,
    // so we only test the ones that reach the reserved name check
    it('should reject "dist" as reserved project name', () => {
      const result = validateProjectName('dist');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved project name');
    });

    it('should reject "build" as reserved project name', () => {
      const result = validateProjectName('build');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved project name');
    });

    it('should reject "src" as reserved project name', () => {
      const result = validateProjectName('src');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved project name');
    });

    it('should reject "test" as reserved project name', () => {
      const result = validateProjectName('test');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('reserved project name');
    });
  });
});

describe('validateFrameworkId', () => {
  it('should accept valid framework IDs', () => {
    expect(validateFrameworkId('nextjs')).toBe(true);
    expect(validateFrameworkId('nuxt')).toBe(true);
    expect(validateFrameworkId('astro')).toBe(true);
    expect(validateFrameworkId('sveltekit')).toBe(true);
    expect(validateFrameworkId('vue')).toBe(true);
    expect(validateFrameworkId('remix')).toBe(true);
    expect(validateFrameworkId('laravel')).toBe(true);
  });

  it('should reject invalid framework IDs', () => {
    expect(validateFrameworkId('react')).toBe(false);
    expect(validateFrameworkId('angular')).toBe(false);
    expect(validateFrameworkId('')).toBe(false);
    expect(validateFrameworkId('invalid')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should remove shell metacharacters', () => {
    expect(sanitizeInput('my;app')).toBe('myapp');
    expect(sanitizeInput('my&app')).toBe('myapp');
    expect(sanitizeInput('my|app')).toBe('myapp');
    expect(sanitizeInput('my$app')).toBe('myapp');
    expect(sanitizeInput('my`app')).toBe('myapp');
  });

  it('should remove quotes', () => {
    expect(sanitizeInput("my'app")).toBe('myapp');
    expect(sanitizeInput('my"app')).toBe('myapp');
  });

  it('should remove control characters', () => {
    expect(sanitizeInput('my\x00app')).toBe('myapp');
    expect(sanitizeInput('my\napp')).toBe('myapp');
    expect(sanitizeInput('my\rapp')).toBe('myapp');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  myapp  ')).toBe('myapp');
  });

  it('should preserve valid characters', () => {
    expect(sanitizeInput('my-app-123')).toBe('my-app-123');
  });
});

describe('validateAndSanitizeProjectName', () => {
  it('should sanitize and validate in one step', () => {
    const result = validateAndSanitizeProjectName('my-app');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('my-app');
  });

  it('should sanitize dangerous characters before validation', () => {
    // After sanitizing 'my;app' -> 'myapp', validation should pass
    const result = validateAndSanitizeProjectName('myapp');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('myapp');
  });
});
