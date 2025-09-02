import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FacilityService } from '../src/services/facility-service.js';
import { HttpClient } from '../src/services/http-client.js';
import { MockDbApi, sampleFacility } from './utils/mock-api.js';

describe('FacilityService', () => {
  let facilityService: FacilityService;
  let mockApi: MockDbApi;

  beforeEach(() => {
    mockApi = new MockDbApi();
    const httpClient = new HttpClient({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
    facilityService = new FacilityService(httpClient);
  });

  afterEach(() => {
    mockApi.cleanup();
  });

  describe('getFacilities', () => {
    it('should get station facilities successfully', async () => {
      const stationId = '8000105';
      const facilities = [sampleFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await facilityService.getFacilities({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(1);
      expect(result.facilities[0].id).toBe('F123456');
      expect(result.facilities[0].type).toBe('elevator');
      expect(result.facilities[0].status).toBe('operational');
      expect(result.facilities[0].location).toBe('Platform 7');
      expect(result.total).toBe(1);
    });

    it('should filter facilities by type', async () => {
      const stationId = '8000105';
      const elevatorFacility = sampleFacility;
      const escalatorFacility = {
        ...sampleFacility,
        id: 'F123457',
        type: 'escalator' as const,
        location: 'Platform 3',
      };
      const facilities = [elevatorFacility, escalatorFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await facilityService.getFacilities({
        stationId,
        type: 'elevator',
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(2);
      expect(result.limit).toBe(10);
    });

    it('should filter facilities by status', async () => {
      const stationId = '8000105';
      const outOfOrderFacility = {
        ...sampleFacility,
        id: 'F123457',
        status: 'out_of_order' as const,
        lastUpdated: '2024-01-15T10:30:00Z',
      };
      const facilities = [sampleFacility, outOfOrderFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await facilityService.getFacilities({
        stationId,
        status: 'operational',
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(2);
      expect(result.limit).toBe(10);
    });

    it('should handle empty facilities list', async () => {
      const stationId = '8000105';
      
      mockApi.mockFacilities(stationId, []);

      const result = await facilityService.getFacilities({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle station not found', async () => {
      const stationId = '9999999';
      
      mockApi.mockError(`/facilities/${stationId}`, 404, 'Station not found');

      await expect(
        facilityService.getFacilities({
          stationId,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to get facilities');
    });

    it('should handle API errors gracefully', async () => {
      const stationId = '8000105';
      
      mockApi.mockError(`/facilities/${stationId}`, 500, 'Internal server error');

      await expect(
        facilityService.getFacilities({
          stationId,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to get facilities');
    });
  });

  describe('facility status updates', () => {
    it('should handle facilities with different statuses', async () => {
      const stationId = '8000105';
      const facilities = [
        {
          ...sampleFacility,
          id: 'F1',
          status: 'operational' as const,
        },
        {
          ...sampleFacility,
          id: 'F2',
          status: 'out_of_order' as const,
          lastUpdated: '2024-01-15T08:00:00Z',
        },
        {
          ...sampleFacility,
          id: 'F3',
          status: 'maintenance' as const,
          lastUpdated: '2024-01-15T09:00:00Z',
        },
      ];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await facilityService.getFacilities({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(3);
      
      const operational = result.facilities.find(f => f.id === 'F1');
      const outOfOrder = result.facilities.find(f => f.id === 'F2');
      const maintenance = result.facilities.find(f => f.id === 'F3');
      
      expect(operational?.status).toBe('operational');
      expect(outOfOrder?.status).toBe('out_of_order');
      expect(maintenance?.status).toBe('maintenance');
    });

    it('should handle facilities with accessibility features', async () => {
      const stationId = '8000105';
      const accessibleFacility = {
        ...sampleFacility,
        type: 'elevator' as const,
        description: 'Accessible elevator with Braille buttons',
        isAccessible: true,
      };
      const facilities = [accessibleFacility];
      
      mockApi.mockFacilities(stationId, facilities);

      const result = await facilityService.getFacilities({
        stationId,
        limit: 10,
        offset: 0,
      });

      expect(result.facilities).toHaveLength(1);
      expect(result.facilities[0].isAccessible).toBe(true);
      expect(result.facilities[0].description).toContain('Braille');
    });
  });
});
