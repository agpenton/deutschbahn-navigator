import { DeutscheBahnMcpServer } from './mcp/server.js';

async function main(): Promise<void> {
  try {
    const server = new DeutscheBahnMcpServer();
    await server.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Deutsche Bahn MCP Server shutting down...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Deutsche Bahn MCP Server shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start Deutsche Bahn MCP Server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});
