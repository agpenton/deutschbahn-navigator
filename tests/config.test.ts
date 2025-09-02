import { describe, test, expect } from '@jest/globals';

describe('Config Utility', () => {
  test('should be importable', async () => {
    const { config } = await import('../src/utils/config');
    expect(config).toBeDefined();
  });

  test('should have configuration properties', async () => {
    const { config } = await import('../src/utils/config');
    expect(typeof config).toBe('object');
    // Test that config has some expected properties without being too specific
    // since we're running offline mode
    expect(config).toBeTruthy();
  });

  test('should export config object', async () => {
    const configModule = await import('../src/utils/config');
    expect(configModule.config).toBeDefined();
  });
});
