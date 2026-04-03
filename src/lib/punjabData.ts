// Punjab-specific data for JanRakshak Flood Warning System
export interface PunjabShelter {
  shelter_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  available: number;
  status: "operational" | "closed" | "maintenance" | "unknown";
  district: string;
  amenities: string[];
  contact: string;
}

export interface FloodZone {
  id: string;
  name: string;
  district: string;
  severity: "low" | "moderate" | "high" | "critical";
  coordinates: [number, number][];
  affected_roads: string[];
}

// Realistic Punjab shelter data based on major cities and flood-prone areas
export const PUNJAB_SHELTERS: PunjabShelter[] = [
  // Amritsar District
  {
    shelter_id: "AMR_001",
    name: "Golden Temple Community Center",
    lat: 31.6200,
    lon: 74.8765,
    capacity: 500,
    available: 320,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43210"
  },
  {
    shelter_id: "AMR_002", 
    name: "Amritsar Government School",
    lat: 31.6340,
    lon: 74.8720,
    capacity: 300,
    available: 180,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Restrooms", "Medical"],
    contact: "+91-98765-43211"
  },
  {
    shelter_id: "AMR_003",
    name: "Jallianwala Bagh Memorial Hall",
    lat: 31.6200,
    lon: 74.8800,
    capacity: 200,
    available: 150,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43212"
  },

  // Ludhiana District
  {
    shelter_id: "LUD_001",
    name: "Ludhiana Sports Complex",
    lat: 30.9010,
    lon: 75.8573,
    capacity: 800,
    available: 450,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43220"
  },
  {
    shelter_id: "LUD_002",
    name: "Guru Nanak Dev Engineering College",
    lat: 30.9200,
    lon: 75.8500,
    capacity: 400,
    available: 280,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43221"
  },
  {
    shelter_id: "LUD_003",
    name: "Ludhiana Railway Station Shelter",
    lat: 30.9000,
    lon: 75.8600,
    capacity: 150,
    available: 90,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43222"
  },

  // Jalandhar District
  {
    shelter_id: "JAL_001",
    name: "Jalandhar City Center",
    lat: 31.3260,
    lon: 75.5762,
    capacity: 600,
    available: 380,
    status: "operational",
    district: "Jalandhar",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43230"
  },
  {
    shelter_id: "JAL_002",
    name: "Punjab Agricultural University",
    lat: 31.3400,
    lon: 75.5700,
    capacity: 500,
    available: 320,
    status: "operational",
    district: "Jalandhar",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43231"
  },

  // Patiala District
  {
    shelter_id: "PAT_001",
    name: "Patiala Palace Grounds",
    lat: 30.3398,
    lon: 76.3869,
    capacity: 700,
    available: 420,
    status: "operational",
    district: "Patiala",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43240"
  },
  {
    shelter_id: "PAT_002",
    name: "Thapar Institute of Engineering",
    lat: 30.3500,
    lon: 76.3800,
    capacity: 400,
    available: 250,
    status: "operational",
    district: "Patiala",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43241"
  },

  // Bathinda District
  {
    shelter_id: "BAT_001",
    name: "Bathinda Fort Community Center",
    lat: 30.2110,
    lon: 74.9455,
    capacity: 350,
    available: 200,
    status: "operational",
    district: "Bathinda",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43250"
  },

  // Firozpur District
  {
    shelter_id: "FIR_001",
    name: "Firozpur Cantonment Area",
    lat: 30.9167,
    lon: 74.6000,
    capacity: 450,
    available: 280,
    status: "operational",
    district: "Firozpur",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43260"
  },

  // Gurdaspur District
  {
    shelter_id: "GUR_001",
    name: "Gurdaspur Government College",
    lat: 32.0400,
    lon: 75.4000,
    capacity: 300,
    available: 180,
    status: "operational",
    district: "Gurdaspur",
    amenities: ["Food", "Restrooms", "Medical"],
    contact: "+91-98765-43270"
  },

  // Hoshiarpur District
  {
    shelter_id: "HOS_001",
    name: "Hoshiarpur Sports Stadium",
    lat: 31.5300,
    lon: 75.9200,
    capacity: 400,
    available: 250,
    status: "operational",
    district: "Hoshiarpur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43280"
  },

  // Moga District
  {
    shelter_id: "MOG_001",
    name: "Moga City Hall",
    lat: 30.8100,
    lon: 75.1700,
    capacity: 250,
    available: 150,
    status: "operational",
    district: "Moga",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43290"
  },

  // Sangrur District
  {
    shelter_id: "SAN_001",
    name: "Sangrur District Hospital",
    lat: 30.2500,
    lon: 75.8400,
    capacity: 200,
    available: 120,
    status: "operational",
    district: "Sangrur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43300"
  }
];

// Simulated flood zones based on historical flood patterns in Punjab
export const FLOOD_ZONES: FloodZone[] = [
  {
    id: "FZ_001",
    name: "Sutlej River Flood Zone",
    district: "Ludhiana",
    severity: "high",
    coordinates: [
      [30.85, 75.80],
      [30.90, 75.85],
      [30.95, 75.90],
      [30.85, 75.95],
      [30.80, 75.90],
      [30.85, 75.80]
    ],
    affected_roads: ["NH-1", "State Highway 15", "Local Road 23"]
  },
  {
    id: "FZ_002", 
    name: "Beas River Flood Zone",
    district: "Amritsar",
    severity: "moderate",
    coordinates: [
      [31.60, 74.85],
      [31.65, 74.90],
      [31.70, 74.85],
      [31.65, 74.80],
      [31.60, 74.85]
    ],
    affected_roads: ["NH-15", "Local Road 45", "Village Road 12"]
  },
  {
    id: "FZ_003",
    name: "Ravi River Flood Zone", 
    district: "Gurdaspur",
    severity: "critical",
    coordinates: [
      [32.00, 75.35],
      [32.05, 75.40],
      [32.10, 75.45],
      [32.05, 75.50],
      [32.00, 75.45],
      [32.00, 75.35]
    ],
    affected_roads: ["NH-15", "State Highway 20", "Local Road 67"]
  },
  {
    id: "FZ_004",
    name: "Ghaggar River Flood Zone",
    district: "Patiala", 
    severity: "moderate",
    coordinates: [
      [30.30, 76.35],
      [30.35, 76.40],
      [30.40, 76.35],
      [30.35, 76.30],
      [30.30, 76.35]
    ],
    affected_roads: ["NH-64", "Local Road 89", "Village Road 34"]
  }
];

// Simulated blocked roads based on flood zones
export const BLOCKED_ROADS = [
  {
    road_id: "ROAD_001",
    name: "NH-1 Ludhiana Section",
    status: "blocked" as const,
    reason: "Sutlej River flooding",
    coordinates: [
      [30.85, 75.80],
      [30.87, 75.82],
      [30.89, 75.84]
    ]
  },
  {
    road_id: "ROAD_002", 
    name: "State Highway 15 Amritsar",
    status: "risky" as const,
    reason: "Beas River high water level",
    coordinates: [
      [31.60, 74.85],
      [31.62, 74.87],
      [31.64, 74.89]
    ]
  },
  {
    road_id: "ROAD_003",
    name: "Local Road 23 Ludhiana",
    status: "blocked" as const,
    reason: "Complete submersion",
    coordinates: [
      [30.90, 75.85],
      [30.92, 75.87],
      [30.94, 75.89]
    ]
  }
];

// Helper functions
export const getSheltersByDistrict = (district: string): PunjabShelter[] => {
  return PUNJAB_SHELTERS.filter(shelter => shelter.district === district);
};

export const getSheltersWithinRadius = (lat: number, lon: number, radiusKm: number = 20): PunjabShelter[] => {
  return PUNJAB_SHELTERS.filter(shelter => {
    const distance = calculateDistance(lat, lon, shelter.lat, shelter.lon);
    return distance <= radiusKm && shelter.status === "operational";
  });
};

export const getFloodZonesByDistrict = (district: string): FloodZone[] => {
  return FLOOD_ZONES.filter(zone => zone.district === district);
};

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
