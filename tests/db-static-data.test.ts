import { describe, test, expect } from '@jest/globals';
import { 
  MAJOR_STATIONS, 
  TRAIN_TYPES, 
  POPULAR_ROUTES, 
  DB_INFO,
  Station,
  TrainType,
  Route
} from '../src/data/db-static-data';

describe('DB Static Data', () => {
  describe('MAJOR_STATIONS', () => {
    test('should contain expected number of stations', () => {
      expect(MAJOR_STATIONS).toHaveLength(10);
    });

    test('should have all required properties for each station', () => {
      MAJOR_STATIONS.forEach((station: Station) => {
        expect(station).toHaveProperty('name');
        expect(station).toHaveProperty('code');
        expect(station).toHaveProperty('city');
        expect(station).toHaveProperty('region');
        expect(typeof station.name).toBe('string');
        expect(typeof station.code).toBe('string');
        expect(typeof station.city).toBe('string');
        expect(typeof station.region).toBe('string');
      });
    });

    test('should include major German cities', () => {
      const stationNames = MAJOR_STATIONS.map(s => s.name);
      expect(stationNames).toContain('Berlin Hauptbahnhof');
      expect(stationNames).toContain('München Hauptbahnhof');
      expect(stationNames).toContain('Hamburg Hauptbahnhof');
      expect(stationNames).toContain('Köln Hauptbahnhof');
      expect(stationNames).toContain('Frankfurt am Main Hauptbahnhof');
    });

    test('should have valid coordinates when present', () => {
      MAJOR_STATIONS.forEach((station: Station) => {
        if (station.coordinates) {
          expect(typeof station.coordinates.lat).toBe('number');
          expect(typeof station.coordinates.lng).toBe('number');
          expect(station.coordinates.lat).toBeGreaterThan(47); // Southern Germany
          expect(station.coordinates.lat).toBeLessThan(56); // Northern Germany
          expect(station.coordinates.lng).toBeGreaterThan(5); // Western Germany
          expect(station.coordinates.lng).toBeLessThan(16); // Eastern Germany
        }
      });
    });

    test('should have unique station codes', () => {
      const codes = MAJOR_STATIONS.map(s => s.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });
  });

  describe('TRAIN_TYPES', () => {
    test('should contain expected train types', () => {
      expect(TRAIN_TYPES.length).toBeGreaterThan(5);
    });

    test('should have all required properties for each train type', () => {
      TRAIN_TYPES.forEach((trainType: TrainType) => {
        expect(trainType).toHaveProperty('code');
        expect(trainType).toHaveProperty('name');
        expect(trainType).toHaveProperty('description');
        expect(trainType).toHaveProperty('maxSpeed');
        expect(typeof trainType.code).toBe('string');
        expect(typeof trainType.name).toBe('string');
        expect(typeof trainType.description).toBe('string');
        expect(typeof trainType.maxSpeed).toBe('number');
        expect(trainType.maxSpeed).toBeGreaterThan(0);
      });
    });

    test('should include major train types', () => {
      const trainCodes = TRAIN_TYPES.map(t => t.code);
      expect(trainCodes).toContain('ICE');
      expect(trainCodes).toContain('IC');
      expect(trainCodes).toContain('RE');
      expect(trainCodes).toContain('RB');
      expect(trainCodes).toContain('S');
    });

    test('should have reasonable speed limits', () => {
      TRAIN_TYPES.forEach((trainType: TrainType) => {
        expect(trainType.maxSpeed).toBeGreaterThan(50);
        expect(trainType.maxSpeed).toBeLessThan(400);
      });
    });

    test('ICE should be the fastest train type', () => {
      const ice = TRAIN_TYPES.find(t => t.code === 'ICE');
      expect(ice).toBeDefined();
      if (ice) {
        const otherTrains = TRAIN_TYPES.filter(t => t.code !== 'ICE');
        otherTrains.forEach(train => {
          expect(ice.maxSpeed).toBeGreaterThanOrEqual(train.maxSpeed);
        });
      }
    });
  });

  describe('POPULAR_ROUTES', () => {
    test('should contain popular routes', () => {
      expect(POPULAR_ROUTES.length).toBeGreaterThan(2);
    });

    test('should have all required properties for each route', () => {
      POPULAR_ROUTES.forEach((route: Route) => {
        expect(route).toHaveProperty('name');
        expect(route).toHaveProperty('description');
        expect(route).toHaveProperty('majorStations');
        expect(route).toHaveProperty('distance');
        expect(typeof route.name).toBe('string');
        expect(typeof route.description).toBe('string');
        expect(Array.isArray(route.majorStations)).toBe(true);
        expect(typeof route.distance).toBe('number');
        expect(route.distance).toBeGreaterThan(0);
      });
    });

    test('should include Berlin-München route', () => {
      const berlinMunich = POPULAR_ROUTES.find(r => r.name.includes('Berlin') && r.name.includes('München'));
      expect(berlinMunich).toBeDefined();
    });

    test('should have at least 2 stations per route', () => {
      POPULAR_ROUTES.forEach((route: Route) => {
        expect(route.majorStations.length).toBeGreaterThanOrEqual(2);
      });
    });

    test('should have reasonable distances', () => {
      POPULAR_ROUTES.forEach((route: Route) => {
        expect(route.distance).toBeGreaterThan(50); // Minimum reasonable distance
        expect(route.distance).toBeLessThan(1000); // Maximum reasonable distance in Germany
      });
    });
  });

  describe('DB_INFO', () => {
    test('should have customer service information', () => {
      expect(DB_INFO).toHaveProperty('customerService');
      expect(DB_INFO.customerService).toHaveProperty('phone');
      expect(DB_INFO.customerService).toHaveProperty('international');
      expect(DB_INFO.customerService).toHaveProperty('hours');
      expect(typeof DB_INFO.customerService.phone).toBe('string');
      expect(typeof DB_INFO.customerService.international).toBe('string');
      expect(typeof DB_INFO.customerService.hours).toBe('string');
    });

    test('should have ticket types', () => {
      expect(DB_INFO).toHaveProperty('ticketTypes');
      expect(Array.isArray(DB_INFO.ticketTypes)).toBe(true);
      expect(DB_INFO.ticketTypes.length).toBeGreaterThan(0);
      
      DB_INFO.ticketTypes.forEach(ticket => {
        expect(ticket).toHaveProperty('name');
        expect(ticket).toHaveProperty('description');
        expect(typeof ticket.name).toBe('string');
        expect(typeof ticket.description).toBe('string');
      });
    });

    test('should include BahnCard options', () => {
      const ticketNames = DB_INFO.ticketTypes.map(t => t.name);
      expect(ticketNames).toContain('BahnCard 25');
      expect(ticketNames).toContain('BahnCard 50');
      expect(ticketNames).toContain('BahnCard 100');
    });

    test('should have apps information', () => {
      expect(DB_INFO).toHaveProperty('apps');
      expect(Array.isArray(DB_INFO.apps)).toBe(true);
      expect(DB_INFO.apps.length).toBeGreaterThan(0);
      
      DB_INFO.apps.forEach(app => {
        expect(app).toHaveProperty('name');
        expect(app).toHaveProperty('description');
        expect(typeof app.name).toBe('string');
        expect(typeof app.description).toBe('string');
      });
    });

    test('should include DB Navigator app', () => {
      const appNames = DB_INFO.apps.map(a => a.name);
      expect(appNames).toContain('DB Navigator');
    });
  });
});
