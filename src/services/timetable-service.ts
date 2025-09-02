import { HttpClient } from './http-client.js';
import {
  DepartureBoard,
  ArrivalBoard,
  DeparturesRequest,
  ArrivalsRequest,
  DepartureArrival,
  TrainType,
  DepartureBoardSchema,
  ArrivalBoardSchema,
} from '../types/index.js';
import { StationService } from './station-service.js';

export class TimetableService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly stationService: StationService
  ) {}

  async getDepartures(request: DeparturesRequest): Promise<DepartureBoard> {
    const params = new URLSearchParams();
    if (request.dateTime) {
      params.append('date', request.dateTime);
    }
    params.append('hour', request.duration.toString());

    try {
      const response = await this.httpClient.get<any>(`/timetables/v1/station/${request.stationId}?${params.toString()}`);
      const station = await this.stationService.getStationInfo({ stationId: request.stationId });
      
      const departures: DepartureArrival[] = (response || [])
        .filter((item: any) => item.dp) // Only departures
        .map((item: any) => this.mapTimetableItem(item, 'departure'));

      const result = {
        departures,
        station,
        timestamp: new Date().toISOString(),
      };

      return DepartureBoardSchema.parse(result);
    } catch (error) {
      console.error('Error getting departures:', error);
      throw new Error(`Failed to get departures: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getArrivals(request: ArrivalsRequest): Promise<ArrivalBoard> {
    const params = new URLSearchParams();
    if (request.dateTime) {
      params.append('date', request.dateTime);
    }
    params.append('hour', request.duration.toString());

    try {
      const response = await this.httpClient.get<any>(`/timetables/v1/station/${request.stationId}?${params.toString()}`);
      const station = await this.stationService.getStationInfo({ stationId: request.stationId });
      
      const arrivals: DepartureArrival[] = (response || [])
        .filter((item: any) => item.ar) // Only arrivals
        .map((item: any) => this.mapTimetableItem(item, 'arrival'));

      const result = {
        arrivals,
        station,
        timestamp: new Date().toISOString(),
      };

      return ArrivalBoardSchema.parse(result);
    } catch (error) {
      console.error('Error getting arrivals:', error);
      throw new Error(`Failed to get arrivals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapTimetableItem(item: any, type: 'departure' | 'arrival'): DepartureArrival {
    const movementData = type === 'departure' ? item.dp : item.ar;
    const trainCategory = item.tl?.c || 'OTHER';
    const trainNumber = item.tl?.n || '';
    
    return {
      id: item.id || `${trainCategory}${trainNumber}`,
      type: this.mapTrainCategory(trainCategory),
      trainNumber,
      line: item.tl?.o || trainNumber,
      destination: type === 'departure' ? (movementData?.ppth?.split('|').pop() || '') : '',
      origin: type === 'arrival' ? (movementData?.ppth?.split('|')[0] || '') : undefined,
      scheduledTime: this.parseDateTime(movementData?.pt),
      actualTime: movementData?.ct ? this.parseDateTime(movementData.ct) : undefined,
      platform: movementData?.pp ? {
        platform: movementData.pp,
        sector: movementData?.ps,
      } : undefined,
      delay: this.calculateDelay(movementData?.pt, movementData?.ct),
      cancelled: movementData?.clt === 'c' || false,
      messages: this.extractMessages(item),
      intermediate: movementData?.ppth ? movementData.ppth.split('|').slice(1, -1) : [],
    };
  }

  private mapTrainCategory(category: string): TrainType {
    const categoryMap: Record<string, TrainType> = {
      'ICE': 'ICE',
      'IC': 'IC', 
      'EC': 'EC',
      'RE': 'RE',
      'RB': 'RB',
      'S': 'S',
      'U': 'U',
      'STR': 'TRAM',
      'BUS': 'BUS',
      'F': 'FERRY',
    };
    return categoryMap[category] || 'OTHER';
  }

  private parseDateTime(timeString?: string): string {
    if (!timeString) {
      return new Date().toISOString();
    }
    
    // DB API returns time in format "YYMMDDhhmm"
    if (timeString.length === 10) {
      const year = 2000 + parseInt(timeString.substr(0, 2), 10);
      const month = parseInt(timeString.substr(2, 2), 10) - 1;
      const day = parseInt(timeString.substr(4, 2), 10);
      const hour = parseInt(timeString.substr(6, 2), 10);
      const minute = parseInt(timeString.substr(8, 2), 10);
      
      return new Date(year, month, day, hour, minute).toISOString();
    }
    
    return new Date().toISOString();
  }

  private calculateDelay(scheduledTime?: string, actualTime?: string): { delay: number; delayText?: string } | undefined {
    if (!scheduledTime || !actualTime) {
      return undefined;
    }

    const scheduled = new Date(this.parseDateTime(scheduledTime));
    const actual = new Date(this.parseDateTime(actualTime));
    const delayMinutes = Math.round((actual.getTime() - scheduled.getTime()) / (1000 * 60));

    if (delayMinutes === 0) {
      return undefined;
    }

    return {
      delay: delayMinutes,
      delayText: delayMinutes > 0 ? `+${delayMinutes} min` : `${delayMinutes} min`,
    };
  }

  private extractMessages(item: any): string[] {
    const messages: string[] = [];
    
    if (item.m) {
      item.m.forEach((message: any) => {
        if (message.t) {
          messages.push(message.t);
        }
      });
    }
    
    if (item.clt === 'c') {
      messages.push('Train cancelled');
    }
    
    return messages;
  }
}
