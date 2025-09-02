import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { DEUTSCHBAHN_TOOLS } from './tools.js';
import {
  HttpClient,
  StationService,
  TimetableService,
  FacilityService,
  JourneyService,
} from '../services/index.js';
import {
  StationSearchRequestSchema,
  StationInfoRequestSchema,
  DeparturesRequestSchema,
  ArrivalsRequestSchema,
  FacilityStatusRequestSchema,
  JourneyPlanRequestSchema,
} from '../types/index.js';

export class DeutscheBahnMcpServer {
  private readonly server: Server;
  private readonly stationService: StationService;
  private readonly timetableService: TimetableService;
  private readonly facilityService: FacilityService;
  private readonly journeyService: JourneyService;

  constructor() {
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

    // Initialize HTTP client with configuration
    const httpClient = new HttpClient({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
      retryDelay: 1000,
      ...(process.env.DB_API_KEY && { apiKey: process.env.DB_API_KEY }),
      ...(process.env.DB_CLIENT_ID && { clientId: process.env.DB_CLIENT_ID }),
    });

    // Initialize services
    this.stationService = new StationService(httpClient);
    this.timetableService = new TimetableService(httpClient, this.stationService);
    this.facilityService = new FacilityService(httpClient, this.stationService);
    this.journeyService = new JourneyService(httpClient);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: DEUTSCHBAHN_TOOLS,
    }));

    // Handle tool call requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'deutschbahn.searchStations':
            return await this.handleSearchStations(args);
          case 'deutschbahn.stationInfo':
            return await this.handleStationInfo(args);
          case 'deutschbahn.departures':
            return await this.handleDepartures(args);
          case 'deutschbahn.arrivals':
            return await this.handleArrivals(args);
          case 'deutschbahn.facilityStatus':
            return await this.handleFacilityStatus(args);
          case 'deutschbahn.planJourney':
            return await this.handlePlanJourney(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        console.error(`Error in tool ${name}:`, error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handleSearchStations(args: any) {
    const request = StationSearchRequestSchema.parse(args);
    const result = await this.stationService.searchStations(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleStationInfo(args: any) {
    const request = StationInfoRequestSchema.parse(args);
    const result = await this.stationService.getStationInfo(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleDepartures(args: any) {
    const request = DeparturesRequestSchema.parse(args);
    const result = await this.timetableService.getDepartures(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleArrivals(args: any) {
    const request = ArrivalsRequestSchema.parse(args);
    const result = await this.timetableService.getArrivals(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleFacilityStatus(args: any) {
    const request = FacilityStatusRequestSchema.parse(args);
    const result = await this.facilityService.getFacilityStatus(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handlePlanJourney(args: any) {
    const request = JourneyPlanRequestSchema.parse(args);
    const result = await this.journeyService.planJourney(request);
    
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Deutsche Bahn MCP Server started');
  }
}
