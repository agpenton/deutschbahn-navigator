import { HttpClient } from './http-client.js';
import {
  JourneyPlan,
  JourneyPlanRequest,
  Journey,
  JourneyLeg,
  TransportMode,
  TrainType,
  JourneyPlanSchema,
} from '../types/index.js';

export class JourneyService {
  constructor(private readonly httpClient: HttpClient) {}

  async planJourney(request: JourneyPlanRequest): Promise<JourneyPlan> {
    const params = new URLSearchParams();
    params.append('originId', request.origin);
    params.append('destId', request.destination);
    
    if (request.dateTime) {
      const date = new Date(request.dateTime);
      if (!isNaN(date.getTime())) {
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().slice(0, 5);
        if (dateStr && timeStr) {
          params.append('date', dateStr);
          params.append('time', timeStr);
        }
      }
    }
    
    params.append('searchForArrival', (request.searchMode === 'ARRIVAL').toString());
    
    if (request.maxChanges !== undefined) {
      params.append('maxChanges', request.maxChanges.toString());
    }
    
    if (request.transportModes) {
      const products = this.mapTransportModesToProducts(request.transportModes);
      params.append('products', products.join(','));
    }
    
    if (request.wheelchair) {
      params.append('wheelchair', 'true');
    }
    
    if (request.bike) {
      params.append('bike', 'true');
    }

    try {
      const response = await this.httpClient.get<any>(`/reiseauskunft/v1/journeys?${params.toString()}`);
      
      const journeys: Journey[] = (response.journeys || []).map((journey: any) => 
        this.mapJourney(journey)
      );

      const result = {
        journeys,
        origin: {
          name: request.origin,
        },
        destination: {
          name: request.destination,
        },
        timestamp: new Date().toISOString(),
      };

      return JourneyPlanSchema.parse(result);
    } catch (error) {
      console.error('Error planning journey:', error);
      throw new Error(`Failed to plan journey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapJourney(journey: any): Journey {
    const legs: JourneyLeg[] = (journey.legs || []).map((leg: any) => this.mapJourneyLeg(leg));
    
    const plannedDeparture = legs[0]?.origin?.plannedDeparture || new Date().toISOString();
    const plannedArrival = legs[legs.length - 1]?.destination?.plannedArrival || new Date().toISOString();
    
    const actualDeparture = legs[0]?.origin?.actualDeparture;
    const actualArrival = legs[legs.length - 1]?.destination?.actualArrival;
    
    const duration = this.calculateDuration(plannedDeparture, plannedArrival);
    const changes = Math.max(0, legs.length - 1);
    
    const products = [...new Set(legs
      .filter(leg => leg.mode === 'TRAIN')
      .map(leg => this.mapLineToTrainType(leg.line || ''))
    )];

    return {
      id: journey.id || this.generateJourneyId(legs),
      legs,
      origin: {
        name: legs[0]?.origin?.name || '',
        coordinates: legs[0]?.origin?.coordinates,
      },
      destination: {
        name: legs[legs.length - 1]?.destination?.name || '',
        coordinates: legs[legs.length - 1]?.destination?.coordinates,
      },
      plannedDeparture,
      actualDeparture,
      plannedArrival,
      actualArrival,
      duration,
      changes,
      products,
      fares: journey.fares ? journey.fares.map((fare: any) => ({
        price: fare.price / 100, // Convert from cents
        currency: fare.currency || 'EUR',
        fareType: fare.model || 'NORMAL',
        travelClass: fare.class || '2',
        discounts: fare.discounts || [],
      })) : undefined,
      delay: this.calculateJourneyDelay(plannedArrival, actualArrival),
      cancelled: journey.cancelled || false,
      messages: journey.messages || [],
    };
  }

  private mapJourneyLeg(leg: any): JourneyLeg {
    return {
      origin: {
        station: leg.origin?.station ? {
          id: leg.origin.station.id,
          name: leg.origin.station.name,
        } : undefined,
        name: leg.origin?.name || '',
        coordinates: leg.origin?.location ? {
          latitude: leg.origin.location.latitude,
          longitude: leg.origin.location.longitude,
        } : undefined,
        plannedDeparture: this.parseDateTime(leg.plannedDeparture || leg.departure?.planned),
        actualDeparture: leg.departure?.actual ? this.parseDateTime(leg.departure.actual) : undefined,
        platform: leg.departurePlatform,
      },
      destination: {
        station: leg.destination?.station ? {
          id: leg.destination.station.id,
          name: leg.destination.station.name,
        } : undefined,
        name: leg.destination?.name || '',
        coordinates: leg.destination?.location ? {
          latitude: leg.destination.location.latitude,
          longitude: leg.destination.location.longitude,
        } : undefined,
        plannedArrival: this.parseDateTime(leg.plannedArrival || leg.arrival?.planned),
        actualArrival: leg.arrival?.actual ? this.parseDateTime(leg.arrival.actual) : undefined,
        platform: leg.arrivalPlatform,
      },
      mode: this.mapLegMode(leg.mode),
      line: leg.line?.name || leg.line || leg.product?.name,
      direction: leg.direction,
      duration: leg.duration || this.calculateDuration(
        leg.plannedDeparture || leg.departure?.planned,
        leg.plannedArrival || leg.arrival?.planned
      ),
      distance: leg.distance,
      delay: this.calculateLegDelay(leg),
      cancelled: leg.cancelled || false,
      messages: leg.messages || [],
      polyline: leg.polyline,
    };
  }

  private mapTransportModesToProducts(modes: TransportMode[]): string[] {
    const productMap: Record<TransportMode, string[]> = {
      'WALK': [],
      'TRAIN': ['nationalExpress', 'national', 'regionalExpress', 'regional'],
      'BUS': ['bus'],
      'TRAM': ['tram'],
      'SUBWAY': ['subway'],
      'FERRY': ['ferry'],
      'TAXI': ['taxi'],
    };

    return modes.flatMap(mode => productMap[mode] || []);
  }

  private mapLegMode(mode?: string): TransportMode {
    if (!mode) return 'WALK';
    
    const modeMap: Record<string, TransportMode> = {
      'walking': 'WALK',
      'train': 'TRAIN',
      'bus': 'BUS',
      'tram': 'TRAM',
      'subway': 'SUBWAY',
      'ferry': 'FERRY',
      'taxi': 'TAXI',
    };
    
    return modeMap[mode.toLowerCase()] || 'WALK';
  }

  private mapLineToTrainType(line: string): TrainType {
    const upperLine = line.toUpperCase();
    if (upperLine.includes('ICE')) return 'ICE';
    if (upperLine.includes('IC')) return 'IC';
    if (upperLine.includes('EC')) return 'EC';
    if (upperLine.includes('RE')) return 'RE';
    if (upperLine.includes('RB')) return 'RB';
    if (upperLine.includes('S')) return 'S';
    if (upperLine.includes('U')) return 'U';
    if (upperLine.includes('TRAM') || upperLine.includes('STR')) return 'TRAM';
    if (upperLine.includes('BUS')) return 'BUS';
    if (upperLine.includes('FERRY') || upperLine.includes('F ')) return 'FERRY';
    return 'OTHER';
  }

  private parseDateTime(timeString?: string): string {
    if (!timeString) {
      return new Date().toISOString();
    }
    
    // Try to parse ISO format first
    try {
      return new Date(timeString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  private calculateJourneyDelay(plannedArrival: string, actualArrival?: string): { delay: number; delayText?: string } | undefined {
    if (!actualArrival) return undefined;
    
    const planned = new Date(plannedArrival);
    const actual = new Date(actualArrival);
    const delayMinutes = Math.round((actual.getTime() - planned.getTime()) / (1000 * 60));
    
    if (delayMinutes === 0) return undefined;
    
    return {
      delay: delayMinutes,
      delayText: delayMinutes > 0 ? `+${delayMinutes} min` : `${delayMinutes} min`,
    };
  }

  private calculateLegDelay(leg: any): { delay: number; delayText?: string } | undefined {
    const plannedDeparture = leg.plannedDeparture || leg.departure?.planned;
    const actualDeparture = leg.departure?.actual;
    
    if (!plannedDeparture || !actualDeparture) return undefined;
    
    const planned = new Date(plannedDeparture);
    const actual = new Date(actualDeparture);
    const delayMinutes = Math.round((actual.getTime() - planned.getTime()) / (1000 * 60));
    
    if (delayMinutes === 0) return undefined;
    
    return {
      delay: delayMinutes,
      delayText: delayMinutes > 0 ? `+${delayMinutes} min` : `${delayMinutes} min`,
    };
  }

  private generateJourneyId(legs: JourneyLeg[]): string {
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    const timestamp = Date.now();
    
    return `journey_${firstLeg?.origin?.name}_${lastLeg?.destination?.name}_${timestamp}`;
  }
}
