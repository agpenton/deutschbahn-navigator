import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

/**
 * Register filesystem-related tools
 */
export function registerFileSystemTools(server: McpServer): void {
  // Tool: Read file
  server.tool(
    'read_file',
    'Read the contents of a file from the local filesystem',
    {
      path: z.string().describe('The file path to read'),
    },
    async ({ path: filePath }): Promise<CallToolResult> => {
      try {
        logger.info(`Reading file: ${filePath}`);
        
        // Security check: ensure path is not trying to access restricted areas
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.includes('..') || normalizedPath.startsWith('/etc') || normalizedPath.startsWith('/var')) {
          throw new Error('Access to this path is restricted for security reasons');
        }

        const content = await fs.readFile(normalizedPath, 'utf-8');
        const stats = await fs.stat(normalizedPath);
        
        return {
          content: [
            {
              type: 'text',
              text: `File: ${filePath}\nSize: ${stats.size} bytes\nLast modified: ${stats.mtime.toISOString()}\n\nContent:\n${content}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error reading file ${filePath}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Write file
  server.tool(
    'write_file',
    'Write content to a file on the local filesystem',
    {
      path: z.string().describe('The file path to write to'),
      content: z.string().describe('The content to write to the file'),
    },
    async ({ path: filePath, content }): Promise<CallToolResult> => {
      try {
        logger.info(`Writing to file: ${filePath}`);
        
        // Security check: ensure path is not trying to access restricted areas
        const normalizedPath = path.normalize(filePath);
        if (normalizedPath.includes('..') || normalizedPath.startsWith('/etc') || normalizedPath.startsWith('/var')) {
          throw new Error('Access to this path is restricted for security reasons');
        }

        // Ensure directory exists
        const dir = path.dirname(normalizedPath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(normalizedPath, content, 'utf-8');
        const stats = await fs.stat(normalizedPath);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully wrote ${stats.size} bytes to ${filePath}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error writing file ${filePath}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error writing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: List directory
  server.tool(
    'list_directory',
    'List the contents of a directory',
    {
      path: z.string().describe('The directory path to list'),
    },
    async ({ path: dirPath }): Promise<CallToolResult> => {
      try {
        logger.info(`Listing directory: ${dirPath}`);
        
        // Security check: ensure path is not trying to access restricted areas
        const normalizedPath = path.normalize(dirPath);
        if (normalizedPath.includes('..') || normalizedPath.startsWith('/etc') || normalizedPath.startsWith('/var')) {
          throw new Error('Access to this path is restricted for security reasons');
        }

        const entries = await fs.readdir(normalizedPath, { withFileTypes: true });
        const items = await Promise.all(
          entries.map(async (entry) => {
            const fullPath = path.join(normalizedPath, entry.name);
            try {
              const stats = await fs.stat(fullPath);
              return {
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
                size: entry.isFile() ? stats.size : undefined,
                modified: stats.mtime.toISOString(),
              };
            } catch {
              return {
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : entry.isFile() ? 'file' : 'other',
                size: undefined,
                modified: 'unknown',
              };
            }
          })
        );

        const formatted = items
          .map(item => {
            const sizeStr = item.size !== undefined ? ` (${item.size} bytes)` : '';
            return `${item.type === 'directory' ? '📁' : '📄'} ${item.name}${sizeStr} - ${item.modified}`;
          })
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Directory listing for: ${dirPath}\nTotal items: ${items.length}\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error listing directory ${dirPath}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error listing directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Create directory
  server.tool(
    'create_directory',
    'Create a new directory',
    {
      path: z.string().describe('The directory path to create'),
    },
    async ({ path: dirPath }): Promise<CallToolResult> => {
      try {
        logger.info(`Creating directory: ${dirPath}`);
        
        // Security check: ensure path is not trying to access restricted areas
        const normalizedPath = path.normalize(dirPath);
        if (normalizedPath.includes('..') || normalizedPath.startsWith('/etc') || normalizedPath.startsWith('/var')) {
          throw new Error('Access to this path is restricted for security reasons');
        }

        await fs.mkdir(normalizedPath, { recursive: true });
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully created directory: ${dirPath}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error creating directory ${dirPath}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error creating directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Tool: Delete file or directory
  server.tool(
    'delete_path',
    'Delete a file or directory (use with caution)',
    {
      path: z.string().describe('The file or directory path to delete'),
      recursive: z.boolean().optional().describe('Whether to delete directories recursively'),
    },
    async ({ path: targetPath, recursive = false }): Promise<CallToolResult> => {
      try {
        logger.info(`Deleting path: ${targetPath}`);
        
        // Security check: ensure path is not trying to access restricted areas
        const normalizedPath = path.normalize(targetPath);
        if (normalizedPath.includes('..') || normalizedPath.startsWith('/etc') || normalizedPath.startsWith('/var')) {
          throw new Error('Access to this path is restricted for security reasons');
        }

        // Additional safety check for important directories
        const dangerousPaths = ['/', '/home', '/usr', '/bin', '/sbin', process.cwd()];
        if (dangerousPaths.includes(normalizedPath) || normalizedPath === '.') {
          throw new Error('Cannot delete system or current working directory');
        }

        const stats = await fs.stat(normalizedPath);
        
        if (stats.isDirectory()) {
          if (!recursive) {
            throw new Error('Cannot delete directory without recursive flag');
          }
          await fs.rm(normalizedPath, { recursive: true, force: true });
        } else {
          await fs.unlink(normalizedPath);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully deleted: ${targetPath}`,
            },
          ],
        };
      } catch (error) {
        logger.error(`Error deleting path ${targetPath}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error deleting path: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
