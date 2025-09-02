import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TimetableService } from '../src/services/timetable-service.js';
import { HttpClient } from '../src/services/http-client.js';
import { MockDbApi, sampleTimetableItem } from './utils/mock-api.js';

describe('TimetableService', () => {
  let timetableService: TimetableService;
  let mockApi: MockDbApi;

  beforeEach(() => {
    mockApi = new MockDbApi();
    const httpClient = new HttpClient({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
    timetableService = new TimetableService(httpClient);
  });

  afterEach(() => {
    mockApi.cleanup();
  });

  describe('getDepartures', () => {
    it('should get departures successfully', async () => {
      const stationId = '8000105';
      const timetable = [sampleTimetableItem];
      
      mockApi.mockTimetable(stationId, 'departures', timetable);

      const result = await timetableService.getDepartures({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.departures).toHaveLength(1);
      expect(result.departures[0].journeyId).toBe('J123456');
      expect(result.departures[0].line).toBe('ICE 123');
      expect(result.departures[0].destination).toBe('Berlin Hbf');
      expect(result.departures[0].platform).toBe('7');
      expect(result.total).toBe(1);
    });

    it('should get departures with date filter', async () => {
      const stationId = '8000105';
      const date = '2024-01-15';
      const timetable = [sampleTimetableItem];
      
      mockApi.mockTimetable(stationId, 'departures', timetable);

      const result = await timetableService.getDepartures({
        stationId,
        date,
        limit: 5,
        offset: 0,
      });

      expect(result.departures).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should handle empty departures', async () => {
      const stationId = '8000105';
      
      mockApi.mockTimetable(stationId, 'departures', []);

      const result = await timetableService.getDepartures({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.departures).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API errors', async () => {
      const stationId = '8000105';
      
      mockApi.mockError(`/timetables/${stationId}/departures`, 500, 'Service unavailable');

      await expect(
        timetableService.getDepartures({
          stationId,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to get departures');
    });
  });

  describe('getArrivals', () => {
    it('should get arrivals successfully', async () => {
      const stationId = '8000105';
      const arrivalItem = {
        ...sampleTimetableItem,
        origin: 'Hamburg Hbf',
        destination: 'Frankfurt(Main)Hbf',
      };
      const timetable = [arrivalItem];
      
      mockApi.mockTimetable(stationId, 'arrivals', timetable);

      const result = await timetableService.getArrivals({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.arrivals).toHaveLength(1);
      expect(result.arrivals[0].journeyId).toBe('J123456');
      expect(result.arrivals[0].line).toBe('ICE 123');
      expect(result.arrivals[0].origin).toBe('Hamburg Hbf');
      expect(result.arrivals[0].platform).toBe('7');
      expect(result.total).toBe(1);
    });

    it('should get arrivals with time filter', async () => {
      const stationId = '8000105';
      const hour = 14;
      const arrivalItem = {
        ...sampleTimetableItem,
        origin: 'Hamburg Hbf',
        destination: 'Frankfurt(Main)Hbf',
      };
      const timetable = [arrivalItem];
      
      mockApi.mockTimetable(stationId, 'arrivals', timetable);

      const result = await timetableService.getArrivals({
        stationId,
        hour,
        limit: 5,
        offset: 0,
      });

      expect(result.arrivals).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should handle delayed arrivals', async () => {
      const stationId = '8000105';
      const delayedArrival = {
        ...sampleTimetableItem,
        origin: 'Hamburg Hbf',
        destination: 'Frankfurt(Main)Hbf',
        delay: 15,
        status: 'delayed' as const,
      };
      const timetable = [delayedArrival];
      
      mockApi.mockTimetable(stationId, 'arrivals', timetable);

      const result = await timetableService.getArrivals({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.arrivals).toHaveLength(1);
      expect(result.arrivals[0].delay).toBe(15);
      expect(result.arrivals[0].status).toBe('delayed');
    });

    it('should handle station not found', async () => {
      const stationId = '9999999';
      
      mockApi.mockError(`/timetables/${stationId}/arrivals`, 404, 'Station not found');

      await expect(
        timetableService.getArrivals({
          stationId,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to get arrivals');
    });
  });
});
