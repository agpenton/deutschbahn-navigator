import { HttpClient } from './http-client.js';
import {
  FacilityStatusResponse,
  FacilityStatusRequest,
  Facility,
  FacilityType,
  FacilityStatus,
  FacilityStatusResponseSchema,
} from '../types/index.js';
import { StationService } from './station-service.js';

export class FacilityService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly stationService: StationService
  ) {}

  async getFacilityStatus(request: FacilityStatusRequest): Promise<FacilityStatusResponse> {
    try {
      const station = await this.stationService.getStationInfo({ stationId: request.stationId });
      
      const params = new URLSearchParams();
      params.append('stationnumber', request.stationId);
      
      if (request.facilityTypes && request.facilityTypes.length > 0) {
        // Map our facility types to DB API types
        const dbFacilityTypes = request.facilityTypes.map(type => this.mapFacilityTypeToDb(type));
        params.append('type', dbFacilityTypes.join(','));
      }

      const response = await this.httpClient.get<any>(`/fasta/v2/facilities?${params.toString()}`);
      
      const facilities: Facility[] = (response || []).map((facility: any) => ({
        equipmentNumber: facility.equipmentnumber?.toString() || '',
        type: this.mapDbFacilityType(facility.type),
        description: facility.description || '',
        status: this.mapDbFacilityStatus(facility.state),
        station: {
          id: facility.stationnumber?.toString() || request.stationId,
          name: station.name,
        },
        lastUpdate: facility.lastUpdate ? new Date(facility.lastUpdate).toISOString() : new Date().toISOString(),
        outOfServiceText: facility.outOfServiceText,
        geocoordX: facility.geocoordX,
        geocoordY: facility.geocoordY,
      }));

      const result = {
        facilities,
        station,
        timestamp: new Date().toISOString(),
      };

      return FacilityStatusResponseSchema.parse(result);
    } catch (error) {
      console.error('Error getting facility status:', error);
      throw new Error(`Failed to get facility status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapFacilityTypeToDb(type: FacilityType): string {
    const typeMap: Record<FacilityType, string> = {
      'ELEVATOR': 'ELEVATOR',
      'ESCALATOR': 'ESCALATOR', 
      'TOILET': 'TOILET',
      'PARKING': 'PARKING',
      'WIFI': 'WIFI',
      'LOCKERS': 'LOCKERS',
      'TRAVEL_CENTER': 'TRAVEL_CENTER',
      'DB_LOUNGE': 'DB_LOUNGE',
      'ACCESSIBILITY': 'ACCESSIBILITY',
      'TAXI': 'TAXI',
      'CAR_RENTAL': 'CAR_RENTAL',
      'BICYCLE_PARKING': 'BICYCLE_PARKING',
    };
    return typeMap[type] || type;
  }

  private mapDbFacilityType(dbType?: string): FacilityType {
    if (!dbType) return 'ACCESSIBILITY';
    
    const typeMap: Record<string, FacilityType> = {
      'ELEVATOR': 'ELEVATOR',
      'ESCALATOR': 'ESCALATOR',
      'TOILET': 'TOILET', 
      'PARKING': 'PARKING',
      'WIFI': 'WIFI',
      'LOCKERS': 'LOCKERS',
      'TRAVEL_CENTER': 'TRAVEL_CENTER',
      'DB_LOUNGE': 'DB_LOUNGE',
      'ACCESSIBILITY': 'ACCESSIBILITY',
      'TAXI': 'TAXI',
      'CAR_RENTAL': 'CAR_RENTAL',
      'BICYCLE_PARKING': 'BICYCLE_PARKING',
    };
    return typeMap[dbType.toUpperCase()] || 'ACCESSIBILITY';
  }

  private mapDbFacilityStatus(dbState?: string): FacilityStatus {
    if (!dbState) return 'UNKNOWN';
    
    switch (dbState.toLowerCase()) {
      case 'active':
      case 'available':
      case 'operational':
        return 'ACTIVE';
      case 'inactive':
      case 'unavailable':
      case 'out_of_service':
      case 'defect':
        return 'INACTIVE';
      default:
        return 'UNKNOWN';
    }
  }
}
