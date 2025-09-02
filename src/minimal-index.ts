import { MinimalMcpServer } from './minimal-server.js';

// Add comprehensive error logging
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function main(): Promise<void> {
  console.error('Starting Minimal Deutsche Bahn MCP Server...');
  console.error('Node version:', process.version);
  
  try {
    console.error('Creating minimal server instance...');
    const server = new MinimalMcpServer();
    
    console.error('Starting minimal server...');
    await server.start();
    
    console.error('Minimal server started successfully');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Minimal Deutsche Bahn MCP Server shutting down...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Minimal Deutsche Bahn MCP Server shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start Minimal Deutsche Bahn MCP Server:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error in main:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  process.exit(1);
});
