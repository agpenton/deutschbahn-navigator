import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock console methods to avoid test output pollution
const originalConsole = console;
beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  } as any;
});

describe('Logger Utility', () => {
  test('should be importable', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(logger).toBeDefined();
  });

  test('should have logging methods', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  test('should log info messages', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(() => logger.info('Test info message')).not.toThrow();
  });

  test('should log error messages', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(() => logger.error('Test error message')).not.toThrow();
  });

  test('should log debug messages', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(() => logger.debug('Test debug message')).not.toThrow();
  });

  test('should log warn messages', async () => {
    const { logger } = await import('../src/utils/logger');
    expect(() => logger.warn('Test warn message')).not.toThrow();
  });
});
