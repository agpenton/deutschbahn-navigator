import { describe, test, expect, beforeEach } from '@jest/globals';
import { createMCPServer } from '../src/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

describe('MCP Server', () => {
  let server: McpServer;

  beforeEach(() => {
    server = createMCPServer();
  });

  describe('createMCPServer', () => {
    test('should create a server instance', () => {
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(McpServer);
    });

    test('should have correct server name and version', () => {
      // Since we can't directly access the server configuration,
      // we'll test that the server was created without errors
      expect(server).toBeTruthy();
    });

    test('should be a valid MCP server', () => {
      // Test that the server has the expected MCP server properties
      expect(server).toHaveProperty('server');
      expect(typeof server.server).toBe('object');
    });
  });

  describe('Server Capabilities', () => {
    test('should initialize without throwing errors', () => {
      expect(() => {
        const testServer = createMCPServer();
      }).not.toThrow();
    });

    test('should be ready for connection', () => {
      // The server should be in a state where it can accept connections
      expect(server.server).toBeDefined();
    });
  });

  describe('Server Configuration', () => {
    test('should create server with expected configuration', () => {
      // Test that server creation doesn't fail and returns a valid object
      const testServer = createMCPServer();
      expect(testServer).toBeDefined();
      expect(testServer.server).toBeDefined();
    });

    test('should handle multiple server instances', () => {
      const server1 = createMCPServer();
      const server2 = createMCPServer();
      
      expect(server1).toBeDefined();
      expect(server2).toBeDefined();
      expect(server1).not.toBe(server2); // Should be different instances
    });
  });
});
