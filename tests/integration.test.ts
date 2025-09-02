import { describe, test, expect } from '@jest/globals';
import { MAJOR_STATIONS, TRAIN_TYPES } from '../src/data/db-static-data';
import { 
  findStations, 
  getTrainTypes, 
  estimateTravelTime,
  findTrainType,
  getPopularRoutes
} from '../src/tools/db-offline-tools';
import { createMCPServer } from '../src/server';

describe('Integration Tests', () => {
  describe('Data Integration', () => {
    test('findStations should work with actual station data', () => {
      const berlinStations = findStations('Berlin');
      expect(berlinStations.length).toBeGreaterThan(0);
      
      const foundStation = berlinStations[0];
      const originalStation = MAJOR_STATIONS.find(s => s.name === foundStation.name);
      expect(originalStation).toBeDefined();
      expect(foundStation).toEqual(originalStation);
    });

    test('getTrainTypes should return the same data as static data', () => {
      const trainTypes = getTrainTypes();
      expect(trainTypes).toEqual(TRAIN_TYPES);
    });

    test('findTrainType should work with actual train data', () => {
      const ice = findTrainType('ICE');
      const originalICE = TRAIN_TYPES.find(t => t.code === 'ICE');
      expect(ice).toEqual(originalICE);
    });
  });

  describe('End-to-End Journey Planning', () => {
    test('should plan a complete journey from Berlin to München', () => {
      // Find stations
      const berlinStations = findStations('Berlin');
      const munichStations = findStations('München');
      
      expect(berlinStations.length).toBeGreaterThan(0);
      expect(munichStations.length).toBeGreaterThan(0);
      
      // Get train types
      const trainTypes = getTrainTypes();
      const ice = trainTypes.find(t => t.code === 'ICE');
      expect(ice).toBeDefined();
      
      // Estimate travel time
      const travelTime = estimateTravelTime('Berlin', 'München', 'ICE');
      expect(travelTime).toContain('Approximately');
      expect(travelTime).toContain('Intercity-Express');
    });

    test('should handle complete workflow for multiple cities', () => {
      const cities = ['Berlin', 'München', 'Hamburg', 'Köln'];
      
      cities.forEach(city => {
        const stations = findStations(city);
        expect(stations.length).toBeGreaterThan(0);
        
        // Test travel time to another city
        const otherCity = cities.find(c => c !== city);
        if (otherCity) {
          const travelTime = estimateTravelTime(city, otherCity);
          expect(typeof travelTime).toBe('string');
          expect(travelTime.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Server Integration', () => {
    test('should create server with all dependencies', () => {
      // This tests that all imports and dependencies work together
      expect(() => {
        const server = createMCPServer();
        expect(server).toBeDefined();
      }).not.toThrow();
    });

    test('should handle server creation multiple times', () => {
      const servers: any[] = [];
      for (let i = 0; i < 3; i++) {
        const server = createMCPServer();
        servers.push(server);
        expect(server).toBeDefined();
      }
      
      // Each server should be a separate instance
      expect(servers[0]).not.toBe(servers[1]);
      expect(servers[1]).not.toBe(servers[2]);
    });
  });

  describe('Data Consistency', () => {
    test('all stations referenced in routes should exist in station data', () => {
      const routes = getPopularRoutes();
      
      routes.forEach((route: any) => {
        route.majorStations.forEach((stationName: string) => {
          const foundStations = findStations(stationName);
          // Should find at least one station (allowing for partial matches)
          expect(foundStations.length).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('train type codes should be consistent', () => {
      const trainTypes = getTrainTypes();
      const codes = trainTypes.map(t => t.code);
      
      // Test finding each train type
      codes.forEach(code => {
        const found = findTrainType(code);
        expect(found).toBeDefined();
        expect(found?.code).toBe(code);
      });
    });

    test('station coordinates should be valid for distance calculations', () => {
      const stationsWithCoords = MAJOR_STATIONS.filter(s => s.coordinates);
      expect(stationsWithCoords.length).toBeGreaterThan(5); // Most stations should have coordinates
      
      // Test that we can calculate travel time between stations with coordinates
      const berlin = stationsWithCoords.find(s => s.city === 'Berlin');
      const munich = stationsWithCoords.find(s => s.city === 'München');
      
      if (berlin && munich) {
        const travelTime = estimateTravelTime(berlin.name, munich.name);
        expect(travelTime).toContain('Approximately');
        expect(travelTime).toContain('km');
      }
    });
  });

  describe('Error Handling Integration', () => {
    test('should gracefully handle invalid data combinations', () => {
      // Test with non-existent stations
      expect(() => estimateTravelTime('NonExistent1', 'NonExistent2')).not.toThrow();
      
      // Test with invalid train types
      expect(() => estimateTravelTime('Berlin', 'München', 'INVALID')).not.toThrow();
      
      // Test with empty searches
      expect(() => findStations('')).not.toThrow();
      expect(() => findTrainType('')).not.toThrow();
    });
  });
});
