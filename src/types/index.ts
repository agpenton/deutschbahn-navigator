import { z } from 'zod';

// Base coordinate schema
export const CoordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Station schemas
export const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.number().optional(),
  address: z.object({
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
  }).optional(),
  coordinates: CoordinateSchema.optional(),
  hasWiFi: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasLocalPublicTransport: z.boolean().optional(),
  hasPublicFacilities: z.boolean().optional(),
  hasLockerSystem: z.boolean().optional(),
  hasTaxiRank: z.boolean().optional(),
  hasTravelNecessities: z.boolean().optional(),
  hasSteplessAccess: z.string().optional(),
  hasMobilityService: z.string().optional(),
  federalState: z.string().optional(),
  regionalbereich: z.object({
    number: z.number(),
    name: z.string(),
    shortName: z.string(),
  }).optional(),
  aufgabentraeger: z.object({
    shortName: z.string(),
    name: z.string(),
  }).optional(),
  timeTableOffice: z.object({
    email: z.string(),
    name: z.string(),
  }).optional(),
  szentrale: z.object({
    number: z.string(),
    publicPhoneNumber: z.string(),
    name: z.string(),
  }).optional(),
  stationManagement: z.object({
    number: z.string(),
    name: z.string(),
  }).optional(),
});

// Station search result
export const StationSearchResultSchema = z.object({
  stations: z.array(StationSchema),
  total: z.number(),
  offset: z.number(),
  limit: z.number(),
});

// Train/Service schemas
export const TrainTypeSchema = z.enum([
  'ICE', 'IC', 'EC', 'RE', 'RB', 'S', 'U', 'TRAM', 'BUS', 'FERRY', 'SUBWAY', 'OTHER'
]);

export const PlatformSchema = z.object({
  platform: z.string(),
  sector: z.string().optional(),
});

export const DelaySchema = z.object({
  delay: z.number(), // in minutes
  delayText: z.string().optional(),
});

export const DepartureArrivalSchema = z.object({
  id: z.string(),
  type: TrainTypeSchema,
  trainNumber: z.string(),
  line: z.string().optional(),
  destination: z.string(), // For departures
  origin: z.string().optional(), // For arrivals
  scheduledTime: z.string(), // ISO datetime
  actualTime: z.string().optional(), // ISO datetime
  platform: PlatformSchema.optional(),
  delay: DelaySchema.optional(),
  cancelled: z.boolean().default(false),
  messages: z.array(z.string()).default([]),
  intermediate: z.array(z.string()).default([]),
});

export const DepartureBoardSchema = z.object({
  departures: z.array(DepartureArrivalSchema),
  station: StationSchema,
  timestamp: z.string(), // ISO datetime
});

export const ArrivalBoardSchema = z.object({
  arrivals: z.array(DepartureArrivalSchema),
  station: StationSchema,
  timestamp: z.string(), // ISO datetime
});

// Facility schemas
export const FacilityTypeSchema = z.enum([
  'ELEVATOR', 'ESCALATOR', 'TOILET', 'PARKING', 'WIFI', 'LOCKERS', 'TRAVEL_CENTER',
  'DB_LOUNGE', 'ACCESSIBILITY', 'TAXI', 'CAR_RENTAL', 'BICYCLE_PARKING'
]);

export const FacilityStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'UNKNOWN']);

export const FacilitySchema = z.object({
  equipmentNumber: z.string(),
  type: FacilityTypeSchema,
  description: z.string(),
  status: FacilityStatusSchema,
  station: z.object({
    id: z.string(),
    name: z.string(),
  }),
  lastUpdate: z.string(), // ISO datetime
  outOfServiceText: z.string().optional(),
  geocoordX: z.number().optional(),
  geocoordY: z.number().optional(),
});

export const FacilityStatusResponseSchema = z.object({
  facilities: z.array(FacilitySchema),
  station: StationSchema,
  timestamp: z.string(), // ISO datetime
});

// Journey planning schemas
export const TransportModeSchema = z.enum([
  'WALK', 'TRAIN', 'BUS', 'TRAM', 'SUBWAY', 'FERRY', 'TAXI'
]);

export const JourneyLegSchema = z.object({
  origin: z.object({
    station: StationSchema.optional(),
    name: z.string(),
    coordinates: CoordinateSchema.optional(),
    plannedDeparture: z.string(), // ISO datetime
    actualDeparture: z.string().optional(), // ISO datetime
    platform: z.string().optional(),
  }),
  destination: z.object({
    station: StationSchema.optional(),
    name: z.string(),
    coordinates: CoordinateSchema.optional(),
    plannedArrival: z.string(), // ISO datetime
    actualArrival: z.string().optional(), // ISO datetime
    platform: z.string().optional(),
  }),
  mode: TransportModeSchema,
  line: z.string().optional(),
  direction: z.string().optional(),
  duration: z.number(), // in minutes
  distance: z.number().optional(), // in meters
  delay: DelaySchema.optional(),
  cancelled: z.boolean().default(false),
  messages: z.array(z.string()).default([]),
  polyline: z.string().optional(), // Encoded polyline for route visualization
});

export const FareSchema = z.object({
  price: z.number(),
  currency: z.string().default('EUR'),
  fareType: z.string(), // e.g., 'NORMAL', 'SUPER_SPARPREIS', 'SPARPREIS'
  travelClass: z.enum(['1', '2']),
  discounts: z.array(z.string()).default([]),
});

export const JourneySchema = z.object({
  id: z.string(),
  legs: z.array(JourneyLegSchema),
  origin: z.object({
    name: z.string(),
    coordinates: CoordinateSchema.optional(),
  }),
  destination: z.object({
    name: z.string(), 
    coordinates: CoordinateSchema.optional(),
  }),
  plannedDeparture: z.string(), // ISO datetime
  actualDeparture: z.string().optional(), // ISO datetime
  plannedArrival: z.string(), // ISO datetime
  actualArrival: z.string().optional(), // ISO datetime
  duration: z.number(), // in minutes
  changes: z.number(),
  products: z.array(TrainTypeSchema),
  fares: z.array(FareSchema).optional(),
  delay: DelaySchema.optional(),
  cancelled: z.boolean().default(false),
  messages: z.array(z.string()).default([]),
});

export const JourneyPlanSchema = z.object({
  journeys: z.array(JourneySchema),
  origin: z.object({
    name: z.string(),
    coordinates: CoordinateSchema.optional(),
  }),
  destination: z.object({
    name: z.string(),
    coordinates: CoordinateSchema.optional(),
  }),
  timestamp: z.string(), // ISO datetime
});

// Request/Response DTOs
export const StationSearchRequestSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
  coordinates: CoordinateSchema.optional(),
  radius: z.number().min(100).max(10000).optional(), // in meters
});

export const StationInfoRequestSchema = z.object({
  stationId: z.string().min(1),
});

export const DeparturesRequestSchema = z.object({
  stationId: z.string().min(1),
  dateTime: z.string().optional(), // ISO datetime, defaults to now
  duration: z.number().min(15).max(480).default(60), // in minutes
});

export const ArrivalsRequestSchema = z.object({
  stationId: z.string().min(1),
  dateTime: z.string().optional(), // ISO datetime, defaults to now
  duration: z.number().min(15).max(480).default(60), // in minutes
});

export const FacilityStatusRequestSchema = z.object({
  stationId: z.string().min(1),
  facilityTypes: z.array(FacilityTypeSchema).optional(),
});

export const JourneyPlanRequestSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
  dateTime: z.string().optional(), // ISO datetime, defaults to now
  searchMode: z.enum(['DEPARTURE', 'ARRIVAL']).default('DEPARTURE'),
  transportModes: z.array(TransportModeSchema).optional(),
  maxChanges: z.number().min(0).max(10).optional(),
  maxDuration: z.number().min(60).max(1440).optional(), // in minutes
  walkSpeed: z.enum(['SLOW', 'NORMAL', 'FAST']).default('NORMAL'),
  wheelchair: z.boolean().default(false),
  bike: z.boolean().default(false),
});

// Type exports
export type Coordinate = z.infer<typeof CoordinateSchema>;
export type Station = z.infer<typeof StationSchema>;
export type StationSearchResult = z.infer<typeof StationSearchResultSchema>;
export type TrainType = z.infer<typeof TrainTypeSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Delay = z.infer<typeof DelaySchema>;
export type DepartureArrival = z.infer<typeof DepartureArrivalSchema>;
export type DepartureBoard = z.infer<typeof DepartureBoardSchema>;
export type ArrivalBoard = z.infer<typeof ArrivalBoardSchema>;
export type FacilityType = z.infer<typeof FacilityTypeSchema>;
export type FacilityStatus = z.infer<typeof FacilityStatusSchema>;
export type Facility = z.infer<typeof FacilitySchema>;
export type FacilityStatusResponse = z.infer<typeof FacilityStatusResponseSchema>;
export type TransportMode = z.infer<typeof TransportModeSchema>;
export type JourneyLeg = z.infer<typeof JourneyLegSchema>;
export type Fare = z.infer<typeof FareSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type JourneyPlan = z.infer<typeof JourneyPlanSchema>;

// Request types
export type StationSearchRequest = z.infer<typeof StationSearchRequestSchema>;
export type StationInfoRequest = z.infer<typeof StationInfoRequestSchema>;
export type DeparturesRequest = z.infer<typeof DeparturesRequestSchema>;
export type ArrivalsRequest = z.infer<typeof ArrivalsRequestSchema>;
export type FacilityStatusRequest = z.infer<typeof FacilityStatusRequestSchema>;
export type JourneyPlanRequest = z.infer<typeof JourneyPlanRequestSchema>;
