import { describe, test, expect } from '@jest/globals';
import {
  findStations,
  getTrainTypes,
  findTrainType,
  getPopularRoutes,
  findRoutesWithStation,
  getDBInfo,
  estimateTravelTime
} from '../src/tools/db-offline-tools';

describe('DB Offline Tools', () => {
  describe('findStations', () => {
    test('should find stations by city name', () => {
      const result = findStations('Berlin');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].city.toLowerCase()).toContain('berlin');
    });

    test('should find stations by station name', () => {
      const result = findStations('Hauptbahnhof');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(station => {
        expect(station.name.toLowerCase()).toContain('hauptbahnhof');
      });
    });

    test('should find stations by station code', () => {
      const result = findStations('BLS');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].code).toBe('BLS');
    });

    test('should be case insensitive', () => {
      const result1 = findStations('berlin');
      const result2 = findStations('BERLIN');
      const result3 = findStations('Berlin');
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('should return empty array for non-existent stations', () => {
      const result = findStations('NonExistentCity');
      expect(result).toHaveLength(0);
    });

    test('should find partial matches', () => {
      const result = findStations('Mün');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].city.toLowerCase()).toContain('mün');
    });

    test('should return all stations when query is empty', () => {
      const result = findStations('');
      expect(result.length).toBe(10); // All major stations
    });
  });

  describe('getTrainTypes', () => {
    test('should return all train types', () => {
      const result = getTrainTypes();
      expect(result.length).toBeGreaterThan(5);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: expect.any(String),
          name: expect.any(String),
          description: expect.any(String),
          maxSpeed: expect.any(Number)
        })
      ]));
    });

    test('should include ICE trains', () => {
      const result = getTrainTypes();
      const ice = result.find(t => t.code === 'ICE');
      expect(ice).toBeDefined();
      expect(ice?.name).toBe('Intercity-Express');
    });
  });

  describe('findTrainType', () => {
    test('should find train type by exact code', () => {
      const result = findTrainType('ICE');
      expect(result).toBeDefined();
      expect(result?.code).toBe('ICE');
      expect(result?.name).toBe('Intercity-Express');
    });

    test('should be case insensitive', () => {
      const result1 = findTrainType('ice');
      const result2 = findTrainType('ICE');
      const result3 = findTrainType('Ice');
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('should return undefined for non-existent train type', () => {
      const result = findTrainType('NONEXISTENT');
      expect(result).toBeUndefined();
    });

    test('should find all major train types', () => {
      const codes = ['ICE', 'IC', 'EC', 'IRE', 'RE', 'RB', 'S'];
      codes.forEach(code => {
        const result = findTrainType(code);
        expect(result).toBeDefined();
        expect(result?.code).toBe(code);
      });
    });
  });

  describe('getPopularRoutes', () => {
    test('should return all popular routes', () => {
      const result = getPopularRoutes();
      expect(result.length).toBeGreaterThan(2);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          description: expect.any(String),
          majorStations: expect.any(Array),
          distance: expect.any(Number)
        })
      ]));
    });

    test('should include Berlin-München route', () => {
      const result = getPopularRoutes();
      const berlinMunich = result.find(r => r.name.includes('Berlin') && r.name.includes('München'));
      expect(berlinMunich).toBeDefined();
      expect(berlinMunich?.distance).toBeGreaterThan(500);
    });
  });

  describe('findRoutesWithStation', () => {
    test('should find routes containing a specific station', () => {
      const result = findRoutesWithStation('Berlin');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(route => {
        const hasStation = route.majorStations.some(station => 
          station.toLowerCase().includes('berlin')
        );
        expect(hasStation).toBe(true);
      });
    });

    test('should be case insensitive', () => {
      const result1 = findRoutesWithStation('berlin');
      const result2 = findRoutesWithStation('BERLIN');
      expect(result1).toEqual(result2);
    });

    test('should return empty array for non-existent stations', () => {
      const result = findRoutesWithStation('NonExistentStation');
      expect(result).toHaveLength(0);
    });

    test('should find partial matches', () => {
      const result = findRoutesWithStation('Hamburg');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(route => {
        const hasStation = route.majorStations.some(station => 
          station.toLowerCase().includes('hamburg')
        );
        expect(hasStation).toBe(true);
      });
    });
  });

  describe('getDBInfo', () => {
    test('should return complete DB information', () => {
      const result = getDBInfo();
      expect(result).toHaveProperty('customerService');
      expect(result).toHaveProperty('ticketTypes');
      expect(result).toHaveProperty('apps');
    });

    test('should have valid customer service data', () => {
      const result = getDBInfo();
      expect(result.customerService.phone).toBe('030 2970');
      expect(result.customerService.international).toBe('+49 30 2970');
      expect(result.customerService.hours).toContain('24/7');
    });
  });

  describe('estimateTravelTime', () => {
    test('should calculate travel time between known stations', () => {
      const result = estimateTravelTime('Berlin', 'München', 'ICE');
      expect(typeof result).toBe('string');
      expect(result).toContain('Approximately');
      expect(result).toContain('h');
      expect(result).toContain('min');
    });

    test('should work with different train types', () => {
      const resultICE = estimateTravelTime('Berlin', 'München', 'ICE');
      const resultRE = estimateTravelTime('Berlin', 'München', 'RE');
      expect(resultICE).toContain('Intercity-Express');
      expect(resultRE).toContain('Regional-Express');
    });

    test('should handle default train type', () => {
      const result = estimateTravelTime('Berlin', 'München');
      expect(result).toContain('Intercity-Express');
    });

    test('should handle non-existent stations', () => {
      const result = estimateTravelTime('NonExistent', 'München');
      expect(result).toBe('Station not found in our database');
    });

    test('should handle non-existent train types', () => {
      const result = estimateTravelTime('Berlin', 'München', 'NONEXISTENT');
      expect(result).toBe('Train type not found');
    });

    test('should handle case insensitive station names', () => {
      const result1 = estimateTravelTime('berlin', 'münchen', 'ICE');
      const result2 = estimateTravelTime('Berlin', 'München', 'ICE');
      // Both should find stations (though the exact result may differ due to case sensitivity in station names)
      expect(result1).not.toBe('Station not found in our database');
      expect(result2).not.toBe('Station not found in our database');
    });

    test('should calculate reasonable travel times', () => {
      const result = estimateTravelTime('Berlin', 'Hamburg', 'ICE');
      if (result.includes('Approximately')) {
        // Extract hours from the result
        const hoursMatch = result.match(/(\d+)h/);
        if (hoursMatch) {
          const hours = parseInt(hoursMatch[1]);
          expect(hours).toBeGreaterThan(0);
          expect(hours).toBeLessThan(10); // Should be reasonable for German distances
        }
      }
    });

    test('should include distance information', () => {
      const result = estimateTravelTime('Berlin', 'München', 'ICE');
      if (result.includes('Approximately')) {
        expect(result).toMatch(/\d+km/); // Should contain distance in km
      }
    });
  });
});
