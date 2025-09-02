import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JourneyService } from '../src/services/journey-service.js';
import { HttpClient } from '../src/services/http-client.js';
import { MockDbApi, sampleJourney } from './utils/mock-api.js';

describe('JourneyService', () => {
  let journeyService: JourneyService;
  let mockApi: MockDbApi;

  beforeEach(() => {
    mockApi = new MockDbApi();
    const httpClient = new HttpClient({
      baseURL: 'https://apis.deutschebahn.com',
      timeout: 5000,
      maxRetries: 1,
      retryDelay: 100,
    });
    journeyService = new JourneyService(httpClient);
  });

  afterEach(() => {
    mockApi.cleanup();
  });

  describe('planJourney', () => {
    it('should plan journey successfully', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].id).toBe('J123456');
      expect(result.journeys[0].origin).toBe('Frankfurt(Main)Hbf');
      expect(result.journeys[0].destination).toBe('Berlin Hbf');
      expect(result.journeys[0].legs).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should plan journey with departure time', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const departureTime = '2024-01-15T14:30:00';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        departureTime,
        limit: 5,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should plan journey with arrival time', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const arrivalTime = '2024-01-15T18:00:00';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        arrivalTime,
        limit: 5,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.limit).toBe(5);
    });

    it('should filter by transport types', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const journeys = [sampleJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        transportTypes: ['ice', 'ic'],
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].legs[0].line).toBe('ICE 123');
    });

    it('should handle accessible journey planning', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const accessibleJourney = {
        ...sampleJourney,
        isAccessible: true,
        legs: [
          {
            ...sampleJourney.legs[0],
            isAccessible: true,
          },
        ],
      };
      const journeys = [accessibleJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        accessibleOnly: true,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].isAccessible).toBe(true);
      expect(result.journeys[0].legs[0].isAccessible).toBe(true);
    });

    it('should handle empty journey results', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'NonexistentStation';
      
      mockApi.mockJourneys(origin, destination, []);

      const result = await journeyService.planJourney({
        origin,
        destination,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle API errors', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      
      mockApi.mockError('/journeys', 500, 'Service unavailable');

      await expect(
        journeyService.planJourney({
          origin,
          destination,
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Failed to plan journey');
    });
  });

  describe('journey details', () => {
    it('should handle complex journeys with multiple legs', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'München Hbf';
      const complexJourney = {
        ...sampleJourney,
        id: 'J789012',
        destination: 'München Hbf',
        duration: 240, // 4 hours
        legs: [
          {
            ...sampleJourney.legs[0],
            destination: 'Nürnberg Hbf',
            duration: 120,
          },
          {
            id: 'L789013',
            origin: 'Nürnberg Hbf',
            destination: 'München Hbf',
            departureTime: '2024-01-15T16:30:00',
            arrivalTime: '2024-01-15T18:30:00',
            duration: 120,
            line: 'ICE 789',
            platform: '12',
            delay: 0,
            status: 'on_time' as const,
            isAccessible: true,
          },
        ],
      };
      const journeys = [complexJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].legs).toHaveLength(2);
      expect(result.journeys[0].duration).toBe(240);
      expect(result.journeys[0].legs[1].line).toBe('ICE 789');
    });

    it('should handle delayed journeys', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const delayedJourney = {
        ...sampleJourney,
        legs: [
          {
            ...sampleJourney.legs[0],
            delay: 20,
            status: 'delayed' as const,
          },
        ],
      };
      const journeys = [delayedJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].legs[0].delay).toBe(20);
      expect(result.journeys[0].legs[0].status).toBe('delayed');
    });

    it('should handle journey pricing', async () => {
      const origin = 'Frankfurt(Main)Hbf';
      const destination = 'Berlin Hbf';
      const pricedJourney = {
        ...sampleJourney,
        price: {
          amount: 89.90,
          currency: 'EUR',
          fareType: 'standard',
        },
      };
      const journeys = [pricedJourney];
      
      mockApi.mockJourneys(origin, destination, journeys);

      const result = await journeyService.planJourney({
        origin,
        destination,
        limit: 10,
        offset: 0,
      });

      expect(result.journeys).toHaveLength(1);
      expect(result.journeys[0].price?.amount).toBe(89.90);
      expect(result.journeys[0].price?.currency).toBe('EUR');
    });
  });
});
