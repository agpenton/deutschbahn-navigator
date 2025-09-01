import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { config } from '../utils/config.js';

/**
 * Register Deutsche Bahn resources with the MCP server
 */
export function registerDBResources(server: McpServer): void {
  // Resource: Station search help
  server.registerResource(
    'station_search_help',
    'help://station-search',
    {
      title: 'Station Search Help',
      description: 'Help documentation for searching Deutsche Bahn stations',
      mimeType: 'text/markdown',
    },
    async (): Promise<ReadResourceResult> => {
      try {
        const helpContent = `# Deutsche Bahn Station Search Help

## Overview
The Deutschbahn Navigator extension provides tools to search and get information about Deutsche Bahn stations across Germany.

## Available Tools

### 🔍 search_stations
Search for stations by name or location.

**Parameters:**
- \`query\` (required): Station name or city to search for
- \`limit\` (optional): Maximum number of results (default: 10)

**Example:**
\`\`\`
search_stations("Berlin")
search_stations("München Hauptbahnhof")
\`\`\`

### 📍 get_station_info
Get detailed information about a specific station.

**Parameters:**
- \`station_id\` (required): Station EVA number or ID

**Example:**
\`\`\`
get_station_info("8000105")  // Berlin Hauptbahnhof
\`\`\`

### 🚆 get_departures
Get departure information for a station.

**Parameters:**
- \`station_id\` (required): Station EVA number
- \`datetime\` (optional): Date/time in ISO format
- \`duration\` (optional): Minutes to look ahead (default: 60)

### 🚇 get_arrivals
Get arrival information for a station.

**Parameters:**
- \`station_id\` (required): Station EVA number
- \`datetime\` (optional): Date/time in ISO format
- \`duration\` (optional): Minutes to look ahead (default: 60)

### 🔧 get_facilities_status
Check elevator and escalator status at a station.

**Parameters:**
- \`station_id\` (required): Station EVA number

## Tips
- Use search_stations first to find station IDs
- EVA numbers are the primary station identifiers
- Most major stations have facilities information available
- Departure/arrival boards show real-time information when available

## Setup Required
To use this extension, you need a Deutsche Bahn API key:
1. Visit https://developers.deutschebahn.com/
2. Register for an account  
3. Subscribe to the appropriate APIs (StaDa, Timetables, FaSta)
4. Set the DB_API_KEY environment variable
`;

        return {
          contents: [{
            uri: 'help://station-search',
            mimeType: 'text/markdown',
            text: helpContent,
          }],
        };
      } catch (error) {
        logger.error('Error reading station search help:', error);
        throw error;
      }
    }
  );

  // Resource: API configuration
  server.registerResource(
    'api_configuration',
    'config://db-api',
    {
      title: 'Deutsche Bahn API Configuration',
      description: 'Configuration and endpoints for Deutsche Bahn APIs',
      mimeType: 'application/json',
    },
    async (): Promise<ReadResourceResult> => {
      try {
        const configInfo = {
          baseUrl: config.dbApiBaseUrl,
          hasApiKey: !!config.dbApiKey,
          endpoints: {
            stations: '/stada/v2/stations',
            timetables: '/timetables/v1',
            facilities: '/fasta/v2/facilities',
          },
          documentation: {
            main: 'https://developers.deutschebahn.com/',
            stada: 'https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada',
            timetables: 'https://developers.deutschebahn.com/db-api-marketplace/apis/product/timetables',
            facilities: 'https://developers.deutschebahn.com/db-api-marketplace/apis/product/fasta',
          },
          setup_instructions: [
            'Visit https://developers.deutschebahn.com/',
            'Register for a developer account',
            'Subscribe to required APIs (StaDa, Timetables, FaSta)',
            'Get your API key from the developer dashboard',
            'Set DB_API_KEY environment variable',
            'Restart the extension'
          ],
          common_station_ids: {
            'Berlin Hauptbahnhof': '8000105',
            'München Hauptbahnhof': '8000261',
            'Hamburg Hauptbahnhof': '8002549',
            'Köln Hauptbahnhof': '8000207',
            'Frankfurt (Main) Hauptbahnhof': '8000105',
            'Düsseldorf Hauptbahnhof': '8000085',
            'Stuttgart Hauptbahnhof': '8000096',
          }
        };

        return {
          contents: [{
            uri: 'config://db-api',
            mimeType: 'application/json',
            text: JSON.stringify(configInfo, null, 2),
          }],
        };
      } catch (error) {
        logger.error('Error reading API configuration:', error);
        throw error;
      }
    }
  );
}
