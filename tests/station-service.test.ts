import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StationService } from '../src/services/station-service.js';
import { HttpClient } from '../src/services/http-client.js';
import { MockDbApi, sampleStation } from './utils/mock-api.js';

describe('StationService', () => {
  let stationService: StationService;
  let mockApi: MockDbApi;

  beforeEach(() => {
    mockApi = new MockDbApi();
    const httpClient = new HttpClient({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
    stationService = new StationService(httpClient);
  });

  afterEach(() => {
    mockApi.cleanup();
  });

  describe('searchStations', () => {
    it('should search stations successfully', async () => {
      const query = 'Frankfurt';
      const stations = [sampleStation];
      
      mockApi.mockStationSearch(query, stations);

      const result = await stationService.searchStations({
        query,
        limit: 10,
        offset: 0,
      });

      expect(result.stations).toHaveLength(1);
      expect(result.stations[0].name).toBe('Frankfurt(Main)Hbf');
      expect(result.stations[0].id).toBe('8000105');
      expect(result.total).toBe(1);
    });

    it('should handle station search with coordinates', async () => {
      const query = 'Frankfurt';
      const stations = [sampleStation];
      
      mockApi.mockStationSearch(query, stations);

      const result = await stationService.searchStations({
        query,
        limit: 5,
        offset: 0,
        coordinates: {
          latitude: 50.107149,
          longitude: 8.663785,
        },
        radius: 1000,
      });

      expect(result.stations).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should handle empty search results', async () => {
      const query = 'NonexistentStation';
      
      mockApi.mockStationSearch(query, []);

      const result = await stationService.searchStations({
        query,
        limit: 10,
        offset: 0,
      });

      expect(result.stations).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API errors', async () => {
      const query = 'Frankfurt';
      
      mockApi.mockError('/stations', 500, 'Service unavailable');

      await expect(
        stationService.searchStations({
          query,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to search stations');
    });
  });

  describe('getStationInfo', () => {
    it('should get station info successfully', async () => {
      const stationId = '8000105';
      
      mockApi.mockStationInfo(stationId, sampleStation);

      const result = await stationService.getStationInfo({ stationId });

      expect(result.id).toBe('8000105');
      expect(result.name).toBe('Frankfurt(Main)Hbf');
      expect(result.category).toBe(1);
      expect(result.coordinates?.latitude).toBe(50.107149);
      expect(result.coordinates?.longitude).toBe(8.663785);
      expect(result.hasWiFi).toBe(true);
    });

    it('should handle station not found', async () => {
      const stationId = '9999999';
      
      mockApi.mockError(`/stations/${stationId}`, 404, 'Station not found');

      await expect(
        stationService.getStationInfo({ stationId })
      ).rejects.toThrow('Failed to get station info');
    });

    it('should handle malformed station data', async () => {
      const stationId = '8000105';
      const malformedStation = {
        // Missing required fields
        name: 'Frankfurt(Main)Hbf',
      };
      
      mockApi.mockStationInfo(stationId, malformedStation);

      const result = await stationService.getStationInfo({ stationId });

      expect(result.name).toBe('Frankfurt(Main)Hbf');
      expect(result.id).toBeTruthy(); // Should have some ID even if malformed
    });
  });
});
