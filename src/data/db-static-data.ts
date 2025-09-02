/**
 * Static Deutsche Bahn data for offline functionality
 * This provides basic information without requiring external API calls
 */

export interface Station {
  name: string;
  code: string;
  city: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TrainType {
  code: string;
  name: string;
  description: string;
  maxSpeed: number;
}

export interface Route {
  name: string;
  description: string;
  majorStations: string[];
  distance: number;
}

// Major Deutsche Bahn stations
export const MAJOR_STATIONS: Station[] = [
  {
    name: "Berlin Hauptbahnhof",
    code: "BLS",
    city: "Berlin",
    region: "Berlin",
    coordinates: { lat: 52.5251, lng: 13.3694 }
  },
  {
    name: "München Hauptbahnhof",
    code: "MH",
    city: "München",
    region: "Bayern",
    coordinates: { lat: 48.1402, lng: 11.5581 }
  },
  {
    name: "Hamburg Hauptbahnhof",
    code: "AH",
    city: "Hamburg",
    region: "Hamburg",
    coordinates: { lat: 53.5527, lng: 10.0067 }
  },
  {
    name: "Köln Hauptbahnhof",
    code: "KK",
    city: "Köln",
    region: "Nordrhein-Westfalen",
    coordinates: { lat: 50.9430, lng: 6.9589 }
  },
  {
    name: "Frankfurt am Main Hauptbahnhof",
    code: "FF",
    city: "Frankfurt am Main",
    region: "Hessen",
    coordinates: { lat: 50.1070, lng: 8.6632 }
  },
  {
    name: "Stuttgart Hauptbahnhof",
    code: "S",
    city: "Stuttgart",
    region: "Baden-Württemberg",
    coordinates: { lat: 48.7838, lng: 9.1832 }
  },
  {
    name: "Düsseldorf Hauptbahnhof",
    code: "KD",
    city: "Düsseldorf",
    region: "Nordrhein-Westfalen",
    coordinates: { lat: 51.2202, lng: 6.7935 }
  },
  {
    name: "Leipzig Hauptbahnhof",
    code: "LL",
    city: "Leipzig",
    region: "Sachsen",
    coordinates: { lat: 51.3456, lng: 12.3823 }
  },
  {
    name: "Dresden Hauptbahnhof",
    code: "DD",
    city: "Dresden",
    region: "Sachsen",
    coordinates: { lat: 51.0404, lng: 13.7320 }
  },
  {
    name: "Hannover Hauptbahnhof",
    code: "HH",
    city: "Hannover",
    region: "Niedersachsen",
    coordinates: { lat: 52.3759, lng: 9.7417 }
  }
];

// Deutsche Bahn train types
export const TRAIN_TYPES: TrainType[] = [
  {
    code: "ICE",
    name: "Intercity-Express",
    description: "High-speed long-distance trains connecting major cities",
    maxSpeed: 320
  },
  {
    code: "IC",
    name: "Intercity",
    description: "Long-distance trains connecting major cities and regions",
    maxSpeed: 200
  },
  {
    code: "EC",
    name: "Eurocity",
    description: "International long-distance trains connecting European cities",
    maxSpeed: 200
  },
  {
    code: "IRE",
    name: "Interregio-Express",
    description: "Regional express trains for medium-distance travel",
    maxSpeed: 160
  },
  {
    code: "RE",
    name: "Regional-Express",
    description: "Regional trains with limited stops",
    maxSpeed: 160
  },
  {
    code: "RB",
    name: "Regionalbahn",
    description: "Local trains serving all stations",
    maxSpeed: 120
  },
  {
    code: "S",
    name: "S-Bahn",
    description: "Urban and suburban rail services",
    maxSpeed: 100
  }
];

// Popular routes
export const POPULAR_ROUTES: Route[] = [
  {
    name: "Berlin - München",
    description: "High-speed connection between Germany's capital and Bavaria",
    majorStations: ["Berlin Hauptbahnhof", "Leipzig Hauptbahnhof", "Nürnberg Hauptbahnhof", "München Hauptbahnhof"],
    distance: 623
  },
  {
    name: "Hamburg - München",
    description: "North-South connection through central Germany",
    majorStations: ["Hamburg Hauptbahnhof", "Hannover Hauptbahnhof", "Göttingen", "Würzburg Hauptbahnhof", "München Hauptbahnhof"],
    distance: 776
  },
  {
    name: "Köln - Frankfurt",
    description: "Major business route in western Germany",
    majorStations: ["Köln Hauptbahnhof", "Bonn Hauptbahnhof", "Koblenz Hauptbahnhof", "Mainz Hauptbahnhof", "Frankfurt am Main Hauptbahnhof"],
    distance: 177
  },
  {
    name: "Berlin - Hamburg",
    description: "Fast connection between capital and northern port city",
    majorStations: ["Berlin Hauptbahnhof", "Stendal", "Uelzen", "Hamburg Hauptbahnhof"],
    distance: 289
  }
];

// Helpful Deutsche Bahn information
export const DB_INFO = {
  customerService: {
    phone: "030 2970",
    international: "+49 30 2970",
    hours: "24/7 for travel information"
  },
  ticketTypes: [
    {
      name: "Flexpreis",
      description: "Fully flexible ticket, can be used on any train"
    },
    {
      name: "Sparpreis",
      description: "Discounted ticket for specific trains"
    },
    {
      name: "Super Sparpreis",
      description: "Heavily discounted ticket for specific trains, limited availability"
    },
    {
      name: "BahnCard 25",
      description: "25% discount on all tickets for one year"
    },
    {
      name: "BahnCard 50",
      description: "50% discount on all tickets for one year"
    },
    {
      name: "BahnCard 100",
      description: "Unlimited travel for one year"
    }
  ],
  apps: [
    {
      name: "DB Navigator",
      description: "Official Deutsche Bahn app for tickets and travel information"
    },
    {
      name: "DB Streckenagent",
      description: "Real-time information about train delays and disruptions"
    }
  ]
};
