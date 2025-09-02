import nock from 'nock';

export class MockDbApi {
  private readonly baseUrl = 'https://apis.deutschebahn.com';

  constructor() {
    // Disable real HTTP requests
    nock.disableNetConnect();
  }

  cleanup(): void {
    nock.cleanAll();
    nock.enableNetConnect();
  }

  mockStationSearch(query: string, stations: any[]): void {
    nock(this.baseUrl)
      .get('/stations')
      .query(true)
      .reply(200, {
        result: stations,
        total: stations.length,
      });
  }

  mockStationInfo(stationId: string, station: any): void {
    nock(this.baseUrl)
      .get(`/stations/${stationId}`)
      .reply(200, station);
  }

  mockTimetable(stationId: string, timetableData: any[]): void {
    nock(this.baseUrl)
      .get(`/timetables/v1/station/${stationId}`)
      .query(true)
      .reply(200, timetableData);
  }

  mockFacilities(stationId: string, facilities: any[]): void {
    nock(this.baseUrl)
      .get('/fasta/v2/facilities')
      .query(true)
      .reply(200, facilities);
  }

  mockJourneys(journeyData: any): void {
    nock(this.baseUrl)
      .get('/reiseauskunft/v1/journeys')
      .query(true)
      .reply(200, journeyData);
  }

  mockError(path: string, statusCode: number = 500, message: string = 'Internal Server Error'): void {
    nock(this.baseUrl)
      .get(path)
      .query(true)
      .reply(statusCode, { error: message });
  }
}

// Sample test data
export const sampleStation = {
  number: '8000105',
  name: 'Frankfurt(Main)Hbf',
  category: 1,
  mailingAddress: {
    city: 'Frankfurt am Main',
    zipcode: '60329',
    street: 'Am Hauptbahnhof',
    state: 'Hessen',
    country: 'DE',
  },
  evaNumbers: [
    {
      geographicCoordinates: {
        type: 'Point',
        coordinates: [8.663785, 50.107149],
      },
    },
  ],
  hasWiFi: true,
  hasParking: true,
  hasLocalPublicTransport: true,
  hasPublicFacilities: true,
  hasLockerSystem: true,
  hasTaxiRank: true,
  hasTravelNecessities: true,
  hasSteplessAccess: 'yes',
  hasMobilityService: 'yes',
  federalState: 'Hessen',
};

export const sampleTimetableItem = {
  id: 'ICE123',
  tl: {
    c: 'ICE',
    n: '123',
    o: 'ICE 123',
  },
  dp: {
    pt: '2401011425', // 2024-01-01 14:25
    pp: '7',
    ppth: 'Frankfurt(Main)Hbf|Mannheim Hbf|Stuttgart Hbf|München Hbf',
  },
};

export const sampleFacility = {
  equipmentnumber: 10546,
  type: 'ELEVATOR',
  description: 'Aufzug zu Gleis 1-3',
  state: 'ACTIVE',
  stationnumber: 8000105,
  geocoordX: 8.663785,
  geocoordY: 50.107149,
  lastUpdate: '2024-01-01T10:00:00Z',
};

export const sampleJourney = {
  journeys: [
    {
      id: 'journey1',
      legs: [
        {
          origin: {
            name: 'Frankfurt(Main)Hbf',
            station: { id: '8000105', name: 'Frankfurt(Main)Hbf' },
          },
          destination: {
            name: 'München Hbf',
            station: { id: '8000261', name: 'München Hbf' },
          },
          mode: 'train',
          line: 'ICE 123',
          plannedDeparture: '2024-01-01T14:25:00Z',
          plannedArrival: '2024-01-01T18:45:00Z',
          duration: 260,
        },
      ],
    },
  ],
};
