#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server.js';
import { logger } from './utils/logger.js';
import { config } from './utils/config.js';
import express from 'express';
import cors from 'cors';

/**
 * Deutschbahn Navigator - Claude Desktop Extension
 * Provides train search and listing functionality using Deutsche Bahn APIs
 */

async function main() {
  try {
    const server = createMCPServer();
    
    // Check if we should run in HTTP mode (for development/testing)
    const useHttp = process.env.DB_NAVIGATOR_HTTP === 'true';
    
    if (useHttp) {
      logger.info('Starting Deutschbahn Navigator in HTTP mode...');
      await startHttpServer(server);
    } else {
      logger.info('Starting Deutschbahn Navigator in STDIO mode...');
      await startStdioServer(server);
    }
  } catch (error) {
    logger.error('Failed to start Deutschbahn Navigator:', error);
    process.exit(1);
  }
}

/**
 * Start the server in STDIO mode (default for Claude Desktop)
 */
async function startStdioServer(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  await server.server.connect(transport);
  logger.info('Deutschbahn Navigator connected via STDIO');
}

/**
 * Start the server in HTTP mode (for development/testing)
 */
async function startHttpServer(server: McpServer): Promise<void> {
  const app = express();
  const port = config.httpPort;

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      service: 'deutschbahn-navigator',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // MCP over HTTP endpoint (if needed for remote access)
  app.post('/mcp', async (req, res) => {
    try {
      // Basic MCP-over-HTTP implementation
      const { method, params } = req.body;
      
      // This would need proper MCP-over-HTTP implementation
      // For now, just return a basic response
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: { message: 'MCP over HTTP not fully implemented yet' }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.listen(port, () => {
    logger.info(`Deutschbahn Navigator HTTP server running on port ${port}`);
    logger.info(`Health check: http://localhost:${port}/health`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down Deutschbahn Navigator...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down Deutschbahn Navigator...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
