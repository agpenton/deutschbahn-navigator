import { MAJOR_STATIONS, TRAIN_TYPES, POPULAR_ROUTES, DB_INFO, Station, TrainType, Route } from '../data/db-static-data';

/**
 * Deutsche Bahn tools that work without external APIs
 * All information is provided from static data
 */

/**
 * Find stations by name or city
 */
export function findStations(query: string): Station[] {
  const searchTerm = query.toLowerCase();
  return MAJOR_STATIONS.filter(station => 
    station.name.toLowerCase().includes(searchTerm) ||
    station.city.toLowerCase().includes(searchTerm) ||
    station.code.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get all available train types
 */
export function getTrainTypes(): TrainType[] {
  return TRAIN_TYPES;
}

/**
 * Find train type by code
 */
export function findTrainType(code: string): TrainType | undefined {
  return TRAIN_TYPES.find(type => type.code.toLowerCase() === code.toLowerCase());
}

/**
 * Get popular routes
 */
export function getPopularRoutes(): Route[] {
  return POPULAR_ROUTES;
}

/**
 * Find routes that include a specific station
 */
export function findRoutesWithStation(stationName: string): Route[] {
  const searchTerm = stationName.toLowerCase();
  return POPULAR_ROUTES.filter(route =>
    route.majorStations.some(station => station.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get Deutsche Bahn general information
 */
export function getDBInfo() {
  return DB_INFO;
}

/**
 * Calculate estimated travel time between stations (simplified calculation)
 */
export function estimateTravelTime(from: string, to: string, trainType: string = 'ICE'): string {
  const fromStation = findStations(from)[0];
  const toStation = findStations(to)[0];
  const train = findTrainType(trainType);
  
  if (!fromStation || !toStation) {
    return "Station not found in our database";
  }
  
  if (!train) {
    return "Train type not found";
  }
  
  // Simple distance calculation using coordinates
  if (fromStation.coordinates && toStation.coordinates) {
    const distance = calculateDistance(
      fromStation.coordinates.lat,
      fromStation.coordinates.lng,
      toStation.coordinates.lat,
      toStation.coordinates.lng
    );
    
    // Estimate time based on average speed (considering stops)
    const averageSpeed = train.maxSpeed * 0.7; // Account for stops and acceleration
    const timeHours = distance / averageSpeed;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    
    return `Approximately ${hours}h ${minutes}min with ${train.name} (${distance.toFixed(0)}km)`;
  }
  
  return "Unable to calculate - coordinates not available";
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
