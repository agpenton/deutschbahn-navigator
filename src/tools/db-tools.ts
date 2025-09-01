import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { config, DB_API_ENDPOINTS } from '../utils/config.js';

/**
 * Deutsche Bahn API client
 */
class DBApiClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.dbApiBaseUrl;
    this.apiKey = config.dbApiKey;
    this.timeout = config.requestTimeout;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const headers: Record<string, string> = {
      'User-Agent': 'Deutschbahn-Navigator/1.0.0',
      'Accept': 'application/json',
    };

    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      // Some DB APIs might use different auth headers
      headers['DB-Api-Key'] = this.apiKey;
    }

    try {
      logger.debug(`Making request to: ${url.toString()}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.debug('API response received successfully');
      return data;
    } catch (error) {
      logger.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async searchStations(query: string, limit: number = 10): Promise<any> {
    return this.makeRequest(DB_API_ENDPOINTS.stations, {
      searchstring: query,
      limit,
    });
  }

  async getStationInfo(stationId: string): Promise<any> {
    return this.makeRequest(`${DB_API_ENDPOINTS.stations}/${stationId}`);
  }

  async getDepartures(stationId: string, datetime?: string, duration: number = 60): Promise<any> {
    const params: Record<string, any> = {
      evaNo: stationId,
      duration,
    };
    
    if (datetime) {
      params.date = datetime;
    }

    return this.makeRequest(`${DB_API_ENDPOINTS.timetables}/plan/${stationId}/${datetime || new Date().toISOString()}`, params);
  }

  async getArrivals(stationId: string, datetime?: string, duration: number = 60): Promise<any> {
    // Similar to departures but for arrivals
    return this.getDepartures(stationId, datetime, duration);
  }

  async getFacilitiesStatus(stationId: string): Promise<any> {
    return this.makeRequest(`${DB_API_ENDPOINTS.facilities}/${stationId}`);
  }
}

const dbApi = new DBApiClient();

/**
 * Register Deutsche Bahn tools with the MCP server
 */
export function registerDBTools(server: McpServer): void {
  // Tool: Search stations
  server.tool(
    'search_stations',
    'Search for Deutsche Bahn stations by name or location',
    {
      query: z.string().describe('Station name or location to search for'),
      limit: z.number().optional().default(10).describe('Maximum number of results to return'),
    },
    async ({ query, limit = 10 }): Promise<CallToolResult> => {
      try {
        logger.info(`Searching stations with query: ${query}`);
        
        if (!config.dbApiKey) {
          return {
            content: [{
              type: 'text',
              text: 'Deutsche Bahn API key not configured. Please set DB_API_KEY environment variable.\n\nTo get an API key:\n1. Visit https://developers.deutschebahn.com/\n2. Register for an account\n3. Subscribe to the StaDa (Station Data) API\n4. Set the DB_API_KEY environment variable',
            }],
            isError: true,
          };
        }

        const data = await dbApi.searchStations(query, limit);
        
        let resultText = `🚆 Station Search Results for "${query}"\n\n`;
        
        if (data && Array.isArray(data.result)) {
          data.result.forEach((station: any, index: number) => {
            resultText += `${index + 1}. **${station.name}**\n`;
            resultText += `   📍 EVA: ${station.evaNumbers?.[0]?.number || 'N/A'}\n`;
            resultText += `   🏢 Category: ${station.category || 'N/A'}\n`;
            if (station.address) {
              resultText += `   📮 Address: ${station.address.city}, ${station.address.zipcode}\n`;
            }
            resultText += '\n';
          });
        } else {
          resultText += 'No stations found for the given query.';
        }

        return {
          content: [{
            type: 'text',
            text: resultText,
          }],
        };
      } catch (error) {
        logger.error('Error searching stations:', error);
        return {
          content: [{
            type: 'text',
            text: `Error searching stations: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get station information
  server.tool(
    'get_station_info',
    'Get detailed information about a specific Deutsche Bahn station',
    {
      station_id: z.string().describe('Station ID or EVA number'),
    },
    async ({ station_id }): Promise<CallToolResult> => {
      try {
        logger.info(`Getting station info for: ${station_id}`);
        
        if (!config.dbApiKey) {
          return {
            content: [{
              type: 'text',
              text: 'Deutsche Bahn API key not configured. Please set DB_API_KEY environment variable.',
            }],
            isError: true,
          };
        }

        const data = await dbApi.getStationInfo(station_id);
        
        let resultText = `🚆 Station Information\n\n`;
        resultText += `**Name:** ${data.name}\n`;
        resultText += `**EVA Number:** ${data.evaNumbers?.[0]?.number || 'N/A'}\n`;
        resultText += `**Category:** ${data.category || 'N/A'}\n`;
        
        if (data.address) {
          resultText += `**Address:** ${data.address.street || ''} ${data.address.houseNumber || ''}, ${data.address.zipcode} ${data.address.city}\n`;
        }
        
        if (data.ril100Identifiers?.length > 0) {
          resultText += `**RIL100:** ${data.ril100Identifiers[0].rilIdentifier}\n`;
        }
        
        if (data.federalState) {
          resultText += `**Federal State:** ${data.federalState}\n`;
        }

        return {
          content: [{
            type: 'text',
            text: resultText,
          }],
        };
      } catch (error) {
        logger.error('Error getting station info:', error);
        return {
          content: [{
            type: 'text',
            text: `Error getting station information: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get departures
  server.tool(
    'get_departures',
    'Get departure board for a station',
    {
      station_id: z.string().describe('Station ID or EVA number'),
      datetime: z.string().optional().describe('Date and time in ISO format (default: now)'),
      duration: z.number().optional().default(60).describe('Duration in minutes to look ahead'),
    },
    async ({ station_id, datetime, duration = 60 }): Promise<CallToolResult> => {
      try {
        logger.info(`Getting departures for station: ${station_id}`);
        
        if (!config.dbApiKey) {
          return {
            content: [{
              type: 'text',
              text: 'Deutsche Bahn API key not configured. Please set DB_API_KEY environment variable.',
            }],
            isError: true,
          };
        }

        const data = await dbApi.getDepartures(station_id, datetime, duration);
        
        let resultText = `🚆 Departures from Station ${station_id}\n`;
        resultText += `📅 Time Range: ${duration} minutes from ${datetime || 'now'}\n\n`;
        
        if (data && Array.isArray(data.departures)) {
          data.departures.slice(0, 10).forEach((departure: any) => {
            const time = departure.when ? new Date(departure.when).toLocaleTimeString() : 'N/A';
            resultText += `🕐 **${time}** - ${departure.line || 'N/A'}\n`;
            resultText += `   📍 To: ${departure.direction || 'N/A'}\n`;
            resultText += `   🚄 Platform: ${departure.platform || 'N/A'}\n`;
            if (departure.delay) {
              resultText += `   ⏰ Delay: +${departure.delay} min\n`;
            }
            resultText += '\n';
          });
        } else {
          resultText += 'No departure information available.';
        }

        return {
          content: [{
            type: 'text',
            text: resultText,
          }],
        };
      } catch (error) {
        logger.error('Error getting departures:', error);
        return {
          content: [{
            type: 'text',
            text: `Error getting departures: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get arrivals
  server.tool(
    'get_arrivals',
    'Get arrival board for a station',
    {
      station_id: z.string().describe('Station ID or EVA number'),
      datetime: z.string().optional().describe('Date and time in ISO format (default: now)'),
      duration: z.number().optional().default(60).describe('Duration in minutes to look ahead'),
    },
    async ({ station_id, datetime, duration = 60 }): Promise<CallToolResult> => {
      try {
        logger.info(`Getting arrivals for station: ${station_id}`);
        
        if (!config.dbApiKey) {
          return {
            content: [{
              type: 'text',
              text: 'Deutsche Bahn API key not configured. Please set DB_API_KEY environment variable.',
            }],
            isError: true,
          };
        }

        const data = await dbApi.getArrivals(station_id, datetime, duration);
        
        let resultText = `🚆 Arrivals at Station ${station_id}\n`;
        resultText += `📅 Time Range: ${duration} minutes from ${datetime || 'now'}\n\n`;
        
        if (data && Array.isArray(data.arrivals)) {
          data.arrivals.slice(0, 10).forEach((arrival: any) => {
            const time = arrival.when ? new Date(arrival.when).toLocaleTimeString() : 'N/A';
            resultText += `🕐 **${time}** - ${arrival.line || 'N/A'}\n`;
            resultText += `   📍 From: ${arrival.direction || 'N/A'}\n`;
            resultText += `   🚄 Platform: ${arrival.platform || 'N/A'}\n`;
            if (arrival.delay) {
              resultText += `   ⏰ Delay: +${arrival.delay} min\n`;
            }
            resultText += '\n';
          });
        } else {
          resultText += 'No arrival information available.';
        }

        return {
          content: [{
            type: 'text',
            text: resultText,
          }],
        };
      } catch (error) {
        logger.error('Error getting arrivals:', error);
        return {
          content: [{
            type: 'text',
            text: `Error getting arrivals: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Search connections
  server.tool(
    'search_connections',
    'Search for train connections between two stations',
    {
      from_station: z.string().describe('Departure station name or ID'),
      to_station: z.string().describe('Arrival station name or ID'),
      departure_time: z.string().optional().describe('Departure date and time in ISO format (default: now)'),
      max_results: z.number().optional().default(5).describe('Maximum number of connections to return'),
    },
    async ({ from_station, to_station, departure_time, max_results = 5 }): Promise<CallToolResult> => {
      try {
        logger.info(`Searching connections from ${from_station} to ${to_station}`);
        
        return {
          content: [{
            type: 'text',
            text: `🚆 Connection Search: ${from_station} → ${to_station}\n\n` +
                  `⚠️ Connection search functionality requires integration with Deutsche Bahn's journey planning API.\n` +
                  `This feature is currently not available as it requires specific API access.\n\n` +
                  `For now, you can:\n` +
                  `1. Use search_stations to find station IDs\n` +
                  `2. Use get_departures to see trains leaving ${from_station}\n` +
                  `3. Use get_arrivals to see trains arriving at ${to_station}\n\n` +
                  `Visit https://www.bahn.de/ for full journey planning.`,
          }],
        };
      } catch (error) {
        logger.error('Error searching connections:', error);
        return {
          content: [{
            type: 'text',
            text: `Error searching connections: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get facilities status
  server.tool(
    'get_facilities_status',
    'Get status of station facilities (elevators, escalators, etc.)',
    {
      station_id: z.string().describe('Station ID or EVA number'),
    },
    async ({ station_id }): Promise<CallToolResult> => {
      try {
        logger.info(`Getting facilities status for station: ${station_id}`);
        
        if (!config.dbApiKey) {
          return {
            content: [{
              type: 'text',
              text: 'Deutsche Bahn API key not configured. Please set DB_API_KEY environment variable.',
            }],
            isError: true,
          };
        }

        const data = await dbApi.getFacilitiesStatus(station_id);
        
        let resultText = `🏢 Facilities Status for Station ${station_id}\n\n`;
        
        if (data && Array.isArray(data.facilities)) {
          const elevators = data.facilities.filter((f: any) => f.type === 'ELEVATOR');
          const escalators = data.facilities.filter((f: any) => f.type === 'ESCALATOR');
          
          if (elevators.length > 0) {
            resultText += `🛗 **Elevators (${elevators.length})**\n`;
            elevators.forEach((elevator: any, index: number) => {
              const status = elevator.state === 'ACTIVE' ? '✅ Working' : '❌ Out of Order';
              resultText += `   ${index + 1}. ${elevator.description || 'Elevator'} - ${status}\n`;
            });
            resultText += '\n';
          }
          
          if (escalators.length > 0) {
            resultText += `🚶 **Escalators (${escalators.length})**\n`;
            escalators.forEach((escalator: any, index: number) => {
              const status = escalator.state === 'ACTIVE' ? '✅ Working' : '❌ Out of Order';
              resultText += `   ${index + 1}. ${escalator.description || 'Escalator'} - ${status}\n`;
            });
          }
          
          if (elevators.length === 0 && escalators.length === 0) {
            resultText += 'No elevator or escalator information available.';
          }
        } else {
          resultText += 'No facilities information available for this station.';
        }

        return {
          content: [{
            type: 'text',
            text: resultText,
          }],
        };
      } catch (error) {
        logger.error('Error getting facilities status:', error);
        return {
          content: [{
            type: 'text',
            text: `Error getting facilities status: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
          isError: true,
        };
      }
    }
  );
}
