import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export class MinimalMcpServer {
  private readonly server: Server;

  constructor() {
    console.error('MinimalMcpServer: Creating server instance');
    
    this.server = new Server(
      {
        name: 'deutschbahn-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    console.error('MinimalMcpServer: Setting up handlers');
    this.setupHandlers();
    console.error('MinimalMcpServer: Handlers set up');
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('MinimalMcpServer: Handling list tools request');
      return {
        tools: [
          {
            name: 'deutschbahn.test',
            description: 'A test tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Test message',
                },
              },
              required: ['message'],
            },
          },
        ],
      };
    });

    // Handle tool call requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error('MinimalMcpServer: Handling tool call request:', request.params.name);
      
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Test response from Deutsche Bahn MCP server',
          },
        ],
      };
    });
  }

  async start(): Promise<void> {
    try {
      console.error('MinimalMcpServer: Creating transport');
      const transport = new StdioServerTransport();
      
      console.error('MinimalMcpServer: Connecting to transport');
      await this.server.connect(transport);
      
      console.error('MinimalMcpServer: Server connected successfully');
    } catch (error) {
      console.error('MinimalMcpServer: Error in start method:', error);
      throw error;
    }
  }
}
