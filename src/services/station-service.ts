import { HttpClient } from './http-client.js';
import {
  Station,
  StationSearchResult,
  StationSearchRequest,
  StationInfoRequest,
  StationSchema,
  StationSearchResultSchema,
} from '../types/index.js';

export class StationService {
  constructor(private readonly httpClient: HttpClient) {}

  async searchStations(request: StationSearchRequest): Promise<StationSearchResult> {
    const params = new URLSearchParams();
    params.append('searchstring', request.query);
    params.append('limit', request.limit.toString());
    params.append('offset', request.offset.toString());

    if (request.coordinates) {
      params.append('lat', request.coordinates.latitude.toString());
      params.append('lon', request.coordinates.longitude.toString());
      if (request.radius) {
        params.append('radius', request.radius.toString());
      }
    }

    try {
      const response = await this.httpClient.get<any>(`/stations?${params.toString()}`);
      
      // Transform DB API response to our schema
      const stations: Station[] = (response.result || []).map((station: any) => ({
        id: station.number || station.eva || station.id,
        name: station.name,
        category: station.category,
        address: station.mailingAddress ? {
          street: station.mailingAddress.street,
          houseNumber: station.mailingAddress.houseNumber,
          postalCode: station.mailingAddress.zipcode,
          city: station.mailingAddress.city,
          state: station.mailingAddress.state,
          country: station.mailingAddress.country || 'DE',
        } : undefined,
        coordinates: station.evaNumbers?.[0]?.geographicCoordinates ? {
          latitude: station.evaNumbers[0].geographicCoordinates.coordinates[1],
          longitude: station.evaNumbers[0].geographicCoordinates.coordinates[0],
        } : undefined,
        hasWiFi: station.hasWiFi,
        hasParking: station.hasParking,
        hasLocalPublicTransport: station.hasLocalPublicTransport,
        hasPublicFacilities: station.hasPublicFacilities,
        hasLockerSystem: station.hasLockerSystem,
        hasTaxiRank: station.hasTaxiRank,
        hasTravelNecessities: station.hasTravelNecessities,
        hasSteplessAccess: station.hasSteplessAccess,
        hasMobilityService: station.hasMobilityService,
        federalState: station.federalState,
        regionalbereich: station.regionalbereich,
        aufgabentraeger: station.aufgabentraeger,
        timeTableOffice: station.timeTableOffice,
        szentrale: station.szentrale,
        stationManagement: station.stationManagement,
      }));

      const result = {
        stations,
        total: response.total || stations.length,
        offset: request.offset,
        limit: request.limit,
      };

      return StationSearchResultSchema.parse(result);
    } catch (error) {
      console.error('Error searching stations:', error);
      throw new Error(`Failed to search stations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStationInfo(request: StationInfoRequest): Promise<Station> {
    try {
      const response = await this.httpClient.get<any>(`/stations/${request.stationId}`);
      
      const station: Station = {
        id: response.number || response.eva || response.id,
        name: response.name,
        category: response.category,
        address: response.mailingAddress ? {
          street: response.mailingAddress.street,
          houseNumber: response.mailingAddress.houseNumber,
          postalCode: response.mailingAddress.zipcode,
          city: response.mailingAddress.city,
          state: response.mailingAddress.state,
          country: response.mailingAddress.country || 'DE',
        } : undefined,
        coordinates: response.evaNumbers?.[0]?.geographicCoordinates ? {
          latitude: response.evaNumbers[0].geographicCoordinates.coordinates[1],
          longitude: response.evaNumbers[0].geographicCoordinates.coordinates[0],
        } : undefined,
        hasWiFi: response.hasWiFi,
        hasParking: response.hasParking,
        hasLocalPublicTransport: response.hasLocalPublicTransport,
        hasPublicFacilities: response.hasPublicFacilities,
        hasLockerSystem: response.hasLockerSystem,
        hasTaxiRank: response.hasTaxiRank,
        hasTravelNecessities: response.hasTravelNecessities,
        hasSteplessAccess: response.hasSteplessAccess,
        hasMobilityService: response.hasMobilityService,
        federalState: response.federalState,
        regionalbereich: response.regionalbereich,
        aufgabentraeger: response.aufgabentraeger,
        timeTableOffice: response.timeTableOffice,
        szentrale: response.szentrale,
        stationManagement: response.stationManagement,
      };

      return StationSchema.parse(station);
    } catch (error) {
      console.error('Error getting station info:', error);
      throw new Error(`Failed to get station info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
