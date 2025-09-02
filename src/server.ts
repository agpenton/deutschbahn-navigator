import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from './utils/logger.js';

/**
 * Create and configure the MCP server for Deutsche Bahn Navigator
 * This version provides Deutsche Bahn information without requiring external APIs
 */
export function createMCPServer(): McpServer {
  logger.info('Creating Deutsche Bahn Navigator MCP server...');

  const server = new McpServer(
    {
      name: 'deutschbahn-navigator',
      version: '1.3.6',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  logger.info('Deutsche Bahn Navigator MCP server created successfully (offline mode)');
  return server;
}
