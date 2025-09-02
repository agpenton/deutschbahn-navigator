// Jest setup file for Deutsche Bahn Navigator tests

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_NAVIGATOR_HTTP = 'false';

// Global test configuration
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
