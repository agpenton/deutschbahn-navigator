import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

/**
 * Register web-related tools
 */
export function registerWebTools(server: McpServer): void {
  // Tool: Fetch URL
  server.tool(
    'fetch_url',
    'Fetch content from a URL using HTTP GET request',
    {
      url: z.string().url().describe('The URL to fetch'),
      headers: z.record(z.string()).optional().describe('Optional HTTP headers to include'),
    },
    async ({ url, headers = {} }): Promise<CallToolResult> => {
      try {
        logger.info(`Fetching URL: ${url}`);
        
        // Security check: only allow HTTP/HTTPS URLs
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('Only HTTP and HTTPS URLs are allowed');
        }

        // Add default user agent if not provided
        const requestHeaders = {
          'User-Agent': 'Claude-Desktop-Extension/1.0',
          ...headers,
        };

        const response = await fetch(url, {
          method: 'GET',
          headers: requestHeaders,
          // Security: Set reasonable timeout
          signal: AbortSignal.timeout(30000), // 30 seconds
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const isText = contentType.includes('text/') || contentType.includes('application/json');

        let content: string;
        if (isText) {
          content = await response.text();
        } else {
          content = `Binary content (${contentType}) - ${response.headers.get('content-length') || 'unknown'} bytes`;
        }

        return {
          content: [
            {
              type: 'text',
              text: `URL: ${url}\nStatus: ${response.status} ${response.statusText}\nContent-Type: ${contentType}\nSize: ${content.length} characters\n\n${isJson ? 'JSON Content:\n' : ''}${content}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error fetching URL ${url}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: HTTP POST Request
  server.tool(
    'http_post',
    'Send HTTP POST request with JSON data',
    {
      url: z.string().url().describe('The URL to send POST request to'),
      data: z.record(z.any()).optional().describe('JSON data to send in request body'),
      headers: z.record(z.string()).optional().describe('Optional HTTP headers to include'),
    },
    async ({ url, data = {}, headers = {} }): Promise<CallToolResult> => {
      try {
        logger.info(`Sending POST request to: ${url}`);
        
        // Security check: only allow HTTP/HTTPS URLs
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          throw new Error('Only HTTP and HTTPS URLs are allowed');
        }

        const requestHeaders = {
          'Content-Type': 'application/json',
          'User-Agent': 'Claude-Desktop-Extension/1.0',
          ...headers,
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(30000), // 30 seconds
        });

        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();

        return {
          content: [
            {
              type: 'text',
              text: `POST ${url}\nStatus: ${response.status} ${response.statusText}\nContent-Type: ${contentType}\n\nRequest Data:\n${JSON.stringify(data, null, 2)}\n\nResponse:\n${responseText}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error sending POST request to ${url}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error sending POST request: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
