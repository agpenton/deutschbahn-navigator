import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { 
  StationSearchRequestSchema,
  StationInfoRequestSchema,
  DeparturesRequestSchema,
  ArrivalsRequestSchema,
  FacilityStatusRequestSchema,
  JourneyPlanRequestSchema,
} from '../types/index.js';

export const DEUTSCHBAHN_TOOLS: Tool[] = [
  {
    name: 'deutschbahn.searchStations',
    description: 'Search for Deutsche Bahn stations by name, location, or coordinates. Returns station details including IDs, names, locations, and coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for station name or location',
          minLength: 1,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          minimum: 1,
          maximum: 50,
          default: 10,
        },
        offset: {
          type: 'number',
          description: 'Number of results to skip (for pagination)',
          minimum: 0,
          default: 0,
        },
        coordinates: {
          type: 'object',
          description: 'Search near specific coordinates',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
              minimum: -90,
              maximum: 90,
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
              minimum: -180,
              maximum: 180,
            },
          },
          required: ['latitude', 'longitude'],
        },
        radius: {
          type: 'number',
          description: 'Search radius in meters (when using coordinates)',
          minimum: 100,
          maximum: 10000,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'deutschbahn.stationInfo',
    description: 'Get detailed information about a specific Deutsche Bahn station including facilities, address, coordinates, and accessibility features.',
    inputSchema: {
      type: 'object',
      properties: {
        stationId: {
          type: 'string',
          description: 'Deutsche Bahn station ID (EVA number)',
          minLength: 1,
        },
      },
      required: ['stationId'],
    },
  },
  {
    name: 'deutschbahn.departures',
    description: 'Get real-time departure information for a specific station. Includes train types, destinations, platforms, delays, and cancellations.',
    inputSchema: {
      type: 'object',
      properties: {
        stationId: {
          type: 'string',
          description: 'Deutsche Bahn station ID (EVA number)',
          minLength: 1,
        },
        dateTime: {
          type: 'string',
          description: 'Date and time for departures (ISO format). Defaults to current time.',
          format: 'date-time',
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes to look ahead for departures',
          minimum: 15,
          maximum: 480,
          default: 60,
        },
      },
      required: ['stationId'],
    },
  },
  {
    name: 'deutschbahn.arrivals',
    description: 'Get real-time arrival information for a specific station. Includes train types, origins, platforms, delays, and cancellations.',
    inputSchema: {
      type: 'object',
      properties: {
        stationId: {
          type: 'string',
          description: 'Deutsche Bahn station ID (EVA number)',
          minLength: 1,
        },
        dateTime: {
          type: 'string',
          description: 'Date and time for arrivals (ISO format). Defaults to current time.',
          format: 'date-time',
        },
        duration: {
          type: 'number',
          description: 'Duration in minutes to look ahead for arrivals',
          minimum: 15,
          maximum: 480,
          default: 60,
        },
      },
      required: ['stationId'],
    },
  },
  {
    name: 'deutschbahn.facilityStatus',
    description: 'Check the current operational status of facilities at Deutsche Bahn stations (elevators, escalators, accessibility features).',
    inputSchema: {
      type: 'object',
      properties: {
        stationId: {
          type: 'string',
          description: 'Deutsche Bahn station ID (EVA number)',
          minLength: 1,
        },
        facilityTypes: {
          type: 'array',
          description: 'Filter by specific facility types',
          items: {
            type: 'string',
            enum: [
              'ELEVATOR',
              'ESCALATOR', 
              'TOILET',
              'PARKING',
              'WIFI',
              'LOCKERS',
              'TRAVEL_CENTER',
              'DB_LOUNGE',
              'ACCESSIBILITY',
              'TAXI',
              'CAR_RENTAL',
              'BICYCLE_PARKING'
            ],
          },
        },
      },
      required: ['stationId'],
    },
  },
  {
    name: 'deutschbahn.planJourney',
    description: 'Plan a journey between two stations with comprehensive route options, including connections, durations, prices, and real-time information.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'Origin station name or ID',
          minLength: 1,
        },
        destination: {
          type: 'string',
          description: 'Destination station name or ID',
          minLength: 1,
        },
        dateTime: {
          type: 'string',
          description: 'Preferred departure/arrival time (ISO format). Defaults to current time.',
          format: 'date-time',
        },
        searchMode: {
          type: 'string',
          description: 'Whether dateTime refers to departure or arrival',
          enum: ['DEPARTURE', 'ARRIVAL'],
          default: 'DEPARTURE',
        },
        transportModes: {
          type: 'array',
          description: 'Allowed transport modes',
          items: {
            type: 'string',
            enum: ['WALK', 'TRAIN', 'BUS', 'TRAM', 'SUBWAY', 'FERRY', 'TAXI'],
          },
        },
        maxChanges: {
          type: 'number',
          description: 'Maximum number of transfers/changes',
          minimum: 0,
          maximum: 10,
        },
        maxDuration: {
          type: 'number',
          description: 'Maximum journey duration in minutes',
          minimum: 60,
          maximum: 1440,
        },
        walkSpeed: {
          type: 'string',
          description: 'Walking speed for transfers',
          enum: ['SLOW', 'NORMAL', 'FAST'],
          default: 'NORMAL',
        },
        wheelchair: {
          type: 'boolean',
          description: 'Require wheelchair accessibility',
          default: false,
        },
        bike: {
          type: 'boolean',
          description: 'Allow bicycle transport',
          default: false,
        },
      },
      required: ['origin', 'destination'],
    },
  },
];
