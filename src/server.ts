import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerDBTools } from './tools/db-tools.js';
import { registerDBResources } from './resources/db-resources.js';
import { registerDBPrompts } from './prompts/db-prompts.js';
import { logger } from './utils/logger.js';

/**
 * Create and configure the MCP server for Deutschbahn Navigator
 */
export function createMCPServer(): McpServer {
  logger.info('Creating Deutschbahn Navigator MCP server...');

  const server = new McpServer(
    {
      name: 'deutschbahn-navigator',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register tools for Deutsche Bahn API operations
  registerDBTools(server);
  logger.info('Deutsche Bahn tools registered');

  // Register resources for help and configuration
  registerDBResources(server);
  logger.info('Deutsche Bahn resources registered');

  // Register prompts for journey planning assistance
  registerDBPrompts(server);
  logger.info('Deutsche Bahn prompts registered');

  logger.info('Deutschbahn Navigator MCP server created successfully');
  return server;
}
