import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeutscheBahnMcpServer } from '../src/mcp/server.js';
import { MockDbApi, sampleStation, sampleTimetableItem, sampleFacility, sampleJourney } from './utils/mock-api.js';

describe('DeutscheBahnMcpServer', () => {
  let server: DeutscheBahnMcpServer;
  let mockApi: MockDbApi;

  beforeEach(() => {
    mockApi = new MockDbApi();
    server = new DeutscheBahnMcpServer({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
  });

  afterEach(() => {
    mockApi.cleanup();
  });

  describe('station_search tool', () => {
    it('should search stations successfully', async () => {
      const query = 'Frankfurt';
      const stations = [sampleStation];
      
      mockApi.mockStationSearch(query, stations);

      const result = await server.handleToolCall({
        name: 'station_search',
        arguments: {
          query,
          limit: 10,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Frankfurt(Main)Hbf'),
      });
    });

    it('should validate required parameters', async () => {
      await expect(
        server.handleToolCall({
          name: 'station_search',
          arguments: {},
        })
      ).rejects.toThrow();
    });

    it('should handle search errors gracefully', async () => {
      mockApi.mockError('/stations', 500, 'Service unavailable');

      const result = await server.handleToolCall({
        name: 'station_search',
        arguments: {
          query: 'Frankfurt',
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Error'),
      });
    });
  });

  describe('station_info tool', () => {
    it('should get station info successfully', async () => {
      const stationId = '8000105';
      
      mockApi.mockStationInfo(stationId, sampleStation);

      const result = await server.handleToolCall({
        name: 'station_info',
        arguments: {
          stationId,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Frankfurt(Main)Hbf'),
      });
    });

    it('should handle station not found', async () => {
      const stationId = '9999999';
      
      mockApi.mockError(`/stations/${stationId}`, 404, 'Station not found');

      const result = await server.handleToolCall({
        name: 'station_info',
        arguments: {
          stationId,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Error'),
      });
    });
  });

  describe('departures tool', () => {
    it('should get departures successfully', async () => {
      const stationId = '8000105';
      const timetable = [sampleTimetableItem];
      
      mockApi.mockTimetable(stationId, timetable);

      const result = await server.handleToolCall({
        name: 'departures',
        arguments: {
          stationId,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('ICE 123'),
      });
    });

    it('should handle date parameter', async () => {
      const stationId = '8000105';
      const timetable = [sampleTimetableItem];
      
      mockApi.mockTimetable(stationId, timetable);

      const result = await server.handleToolCall({
        name: 'departures',
        arguments: {
          stationId,
          date: '2024-01-15',
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('ICE 123'),
      });
    });
  });

  describe('arrivals tool', () => {
    it('should get arrivals successfully', async () => {
      const stationId = '8000105';
      const arrivalItem = {
        ...sampleTimetableItem,
        origin: 'Hamburg Hbf',
        destination: 'Frankfurt(Main)Hbf',
      };
      const timetable = [arrivalItem];
      
      mockApi.mockTimetable(stationId, timetable);

      const result = await server.handleToolCall({
        name: 'arrivals',
        arguments: {
          stationId,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('ICE 123'),
      });
    });

    it('should handle hour parameter', async () => {
      const stationId = '8000105';
      const timetable = [sampleTimetableItem];
      
      mockApi.mockTimetable(stationId, timetable);

      const result = await server.handleToolCall({
        name: 'arrivals',
        arguments: {
          stationId,
          hour: 14,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('ICE 123'),
      });
    });
  });

  describe('facility_status tool', () => {
    it('should get facility status successfully', async () => {
      const stationId = '8000105';
      const facilities = [sampleFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await server.handleToolCall({
        name: 'facility_status',
        arguments: {
          stationId,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('elevator'),
      });
    });

    it('should filter by facility type', async () => {
      const stationId = '8000105';
      const facilities = [sampleFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await server.handleToolCall({
        name: 'facility_status',
        arguments: {
          stationId,
          type: 'elevator',
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('elevator'),
      });
    });
  });

  describe('journey_plan tool', () => {
    it('should plan journey successfully', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(journeys);

      const result = await server.handleToolCall({
        name: 'journey_plan',
        arguments: {
          origin,
          destination,
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Frankfurt(Main)Hbf'),
      });
    });

    it('should handle departure time parameter', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(journeys);

      const result = await server.handleToolCall({
        name: 'journey_plan',
        arguments: {
          origin,
          destination,
          departureTime: '2024-01-15T14:30:00',
        },
      });

      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('Frankfurt(Main)Hbf'),
      });
    });
  });

  describe('error handling', () => {
    it('should handle unknown tool calls', async () => {
      await expect(
        server.handleToolCall({
          name: 'unknown_tool',
          arguments: {},
        })
      ).rejects.toThrow('Unknown tool');
    });

    it('should validate tool arguments', async () => {
      await expect(
        server.handleToolCall({
          name: 'station_search',
          arguments: {
            query: 123, // Invalid type
          },
        })
      ).rejects.toThrow();
    });

    it('should handle network errors gracefully', async () => {
      mockApi.mockNetworkError();

      const result = await server.handleToolCall({
        name: 'station_search',
        arguments: {
          query: 'Frankfurt',
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toContainEqual({
        type: 'text',
        text: expect.stringContaining('network'),
      });
    });
  });

  describe('configuration', () => {
    it('should respect timeout configuration', async () => {
      const fastServer = new DeutscheBahnMcpServer({
        baseURL: 'https://apis.deutschebahn.com',
        timeout: 100, // Very short timeout
        maxRetries: 0,
        retryDelay: 0,
      });

      mockApi.mockSlowResponse('/stations', 200, [sampleStation], 1000);

      const result = await fastServer.handleToolCall({
        name: 'station_search',
        arguments: {
          query: 'Frankfurt',
        },
      });

      expect(result.isError).toBe(true);
    });

    it('should respect retry configuration', async () => {
      const retryServer = new DeutscheBahnMcpServer({
        baseURL: 'https://apis.deutschebahn.com',
        timeout: 5000,
        maxRetries: 2,
        retryDelay: 100,
      });

      let callCount = 0;
      mockApi.mockConditionalResponse('/stations', () => {
        callCount++;
        if (callCount < 3) {
          return { status: 500, body: 'Server error' };
        }
        return { status: 200, body: [sampleStation] };
      });

      const result = await retryServer.handleToolCall({
        name: 'station_search',
        arguments: {
          query: 'Frankfurt',
        },
      });

      expect(callCount).toBe(3);
      expect(result.isError).toBe(false);
    });
  });
});
