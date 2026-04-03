// Comprehensive shelter data for all Indian states
export interface IndianShelter {
  shelter_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  available: number;
  status: "operational" | "closed" | "maintenance" | "unknown";
  state: string;
  district: string;
  amenities: string[];
  contact: string;
}

export interface FloodZone {
  id: string;
  name: string;
  state: string;
  district: string;
  severity: "low" | "moderate" | "high" | "critical";
  coordinates: [number, number][];
  affected_roads: string[];
}

// Comprehensive shelter data for all Indian states
export const INDIAN_SHELTERS: IndianShelter[] = [
  // Andhra Pradesh
  {
    shelter_id: "AP_VSK_001",
    name: "Visakhapatnam Port Trust Community Center",
    lat: 17.6868,
    lon: 83.2185,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-44001"
  },
  {
    shelter_id: "AP_VJW_001",
    name: "Vijayawada Railway Station Shelter",
    lat: 16.5062,
    lon: 80.6480,
    capacity: 600,
    available: 320,
    status: "operational",
    state: "Andhra Pradesh",
    district: "Vijayawada",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-44002"
  },

  // Assam
  {
    shelter_id: "AS_GUW_001",
    name: "Guwahati Sports Complex",
    lat: 26.1445,
    lon: 91.7362,
    capacity: 1000,
    available: 650,
    status: "operational",
    state: "Assam",
    district: "Guwahati",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-45001"
  },
  {
    shelter_id: "AS_SIL_001",
    name: "Silchar District Hospital",
    lat: 24.8163,
    lon: 92.7974,
    capacity: 400,
    available: 200,
    status: "operational",
    state: "Assam",
    district: "Silchar",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-45002"
  },

  // Bihar
  {
    shelter_id: "BH_PAT_001",
    name: "Patna Gandhi Maidan",
    lat: 25.5941,
    lon: 85.1376,
    capacity: 1200,
    available: 800,
    status: "operational",
    state: "Bihar",
    district: "Patna",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-46001"
  },
  {
    shelter_id: "BH_GAY_001",
    name: "Gaya Railway Station Shelter",
    lat: 24.7955,
    lon: 85.0000,
    capacity: 300,
    available: 180,
    status: "operational",
    state: "Bihar",
    district: "Gaya",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-46002"
  },

  // Gujarat
  {
    shelter_id: "GJ_AHM_001",
    name: "Ahmedabad Sabarmati Riverfront",
    lat: 23.0225,
    lon: 72.5714,
    capacity: 1500,
    available: 900,
    status: "operational",
    state: "Gujarat",
    district: "Ahmedabad",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-47001"
  },
  {
    shelter_id: "GJ_SUR_001",
    name: "Surat Diamond City Center",
    lat: 21.1702,
    lon: 72.8311,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Gujarat",
    district: "Surat",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-47002"
  },

  // Haryana
  {
    shelter_id: "HR_GUR_001",
    name: "Gurgaon Cyber City Complex",
    lat: 28.4595,
    lon: 77.0266,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Haryana",
    district: "Gurgaon",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-48001"
  },
  {
    shelter_id: "HR_FAR_001",
    name: "Faridabad Industrial Area",
    lat: 28.4089,
    lon: 77.3178,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Haryana",
    district: "Faridabad",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-48002"
  },

  // Himachal Pradesh
  {
    shelter_id: "HP_SHI_001",
    name: "Shimla Ridge Ground",
    lat: 31.1048,
    lon: 77.1734,
    capacity: 500,
    available: 300,
    status: "operational",
    state: "Himachal Pradesh",
    district: "Shimla",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-49001"
  },
  {
    shelter_id: "HP_DHA_001",
    name: "Dharamshala Cricket Stadium",
    lat: 32.2190,
    lon: 76.3234,
    capacity: 400,
    available: 250,
    status: "operational",
    state: "Himachal Pradesh",
    district: "Dharamshala",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-49002"
  },

  // Jammu and Kashmir
  {
    shelter_id: "JK_SRI_001",
    name: "Srinagar Dal Lake Complex",
    lat: 34.0837,
    lon: 74.7973,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Jammu and Kashmir",
    district: "Srinagar",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-50001"
  },
  {
    shelter_id: "JK_JAM_001",
    name: "Jammu Railway Station",
    lat: 32.7266,
    lon: 74.8570,
    capacity: 400,
    available: 200,
    status: "operational",
    state: "Jammu and Kashmir",
    district: "Jammu",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-50002"
  },

  // Jharkhand
  {
    shelter_id: "JH_RAN_001",
    name: "Ranchi Birsa Munda Airport",
    lat: 23.3441,
    lon: 85.3096,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Jharkhand",
    district: "Ranchi",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-51001"
  },
  {
    shelter_id: "JH_JAM_001",
    name: "Jamshedpur Tata Steel Complex",
    lat: 22.8046,
    lon: 86.2029,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Jharkhand",
    district: "Jamshedpur",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-51002"
  },

  // Karnataka
  {
    shelter_id: "KA_BLR_001",
    name: "Bangalore Palace Grounds",
    lat: 12.9716,
    lon: 77.5946,
    capacity: 2000,
    available: 1200,
    status: "operational",
    state: "Karnataka",
    district: "Bangalore",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-52001"
  },
  {
    shelter_id: "KA_MYS_001",
    name: "Mysore Palace Complex",
    lat: 12.2958,
    lon: 76.6394,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Karnataka",
    district: "Mysore",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-52002"
  },

  // Kerala
  {
    shelter_id: "KL_TVM_001",
    name: "Thiruvananthapuram Central Station",
    lat: 8.5241,
    lon: 76.9366,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Kerala",
    district: "Thiruvananthapuram",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-53001"
  },
  {
    shelter_id: "KL_KOCH_001",
    name: "Kochi Port Trust Complex",
    lat: 9.9312,
    lon: 76.2673,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Kerala",
    district: "Kochi",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-53002"
  },

  // Madhya Pradesh
  {
    shelter_id: "MP_BHO_001",
    name: "Bhopal Lake View Complex",
    lat: 23.2599,
    lon: 77.4126,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Madhya Pradesh",
    district: "Bhopal",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-54001"
  },
  {
    shelter_id: "MP_IND_001",
    name: "Indore Rajwada Palace",
    lat: 22.7196,
    lon: 75.8577,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Madhya Pradesh",
    district: "Indore",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-54002"
  },

  // Maharashtra
  {
    shelter_id: "MH_MUM_001",
    name: "Mumbai Gateway of India Complex",
    lat: 19.0760,
    lon: 72.8777,
    capacity: 2500,
    available: 1500,
    status: "operational",
    state: "Maharashtra",
    district: "Mumbai",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-55001"
  },
  {
    shelter_id: "MH_PUN_001",
    name: "Pune Shivajinagar Station",
    lat: 18.5204,
    lon: 73.8567,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Maharashtra",
    district: "Pune",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-55002"
  },

  // Odisha
  {
    shelter_id: "OR_BHU_001",
    name: "Bhubaneswar Temple Complex",
    lat: 20.2961,
    lon: 85.8245,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Odisha",
    district: "Bhubaneswar",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-56001"
  },
  {
    shelter_id: "OR_CUT_001",
    name: "Cuttack Railway Station",
    lat: 20.4625,
    lon: 85.8830,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Odisha",
    district: "Cuttack",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-56002"
  },

  // Punjab (keeping existing data)
  {
    shelter_id: "PB_LUD_001",
    name: "Ludhiana Sports Complex",
    lat: 30.9010,
    lon: 75.8573,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Punjab",
    district: "Ludhiana",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-57001"
  },
  {
    shelter_id: "PB_AMR_001",
    name: "Amritsar Golden Temple Complex",
    lat: 31.6340,
    lon: 74.8720,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Punjab",
    district: "Amritsar",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-57002"
  },

  // Rajasthan
  {
    shelter_id: "RJ_JAI_001",
    name: "Jaipur City Palace Complex",
    lat: 26.9124,
    lon: 75.7873,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Rajasthan",
    district: "Jaipur",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-58001"
  },
  {
    shelter_id: "RJ_JOD_001",
    name: "Jodhpur Mehrangarh Fort",
    lat: 26.2389,
    lon: 73.0243,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Rajasthan",
    district: "Jodhpur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-58002"
  },

  // Tamil Nadu
  {
    shelter_id: "TN_CHE_001",
    name: "Chennai Marina Beach Complex",
    lat: 13.0827,
    lon: 80.2707,
    capacity: 1500,
    available: 900,
    status: "operational",
    state: "Tamil Nadu",
    district: "Chennai",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-59001"
  },
  {
    shelter_id: "TN_COI_001",
    name: "Coimbatore Railway Station",
    lat: 11.0168,
    lon: 76.9558,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Tamil Nadu",
    district: "Coimbatore",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-59002"
  },

  // Telangana
  {
    shelter_id: "TG_HYD_001",
    name: "Hyderabad Charminar Complex",
    lat: 17.3850,
    lon: 78.4867,
    capacity: 1200,
    available: 700,
    status: "operational",
    state: "Telangana",
    district: "Hyderabad",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-60001"
  },
  {
    shelter_id: "TG_WAR_001",
    name: "Warangal Fort Complex",
    lat: 17.9689,
    lon: 79.5941,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Telangana",
    district: "Warangal",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-60002"
  },

  // Uttar Pradesh
  {
    shelter_id: "UP_LUC_001",
    name: "Lucknow Bara Imambara Complex",
    lat: 26.8467,
    lon: 80.9462,
    capacity: 1000,
    available: 600,
    status: "operational",
    state: "Uttar Pradesh",
    district: "Lucknow",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-61001"
  },
  {
    shelter_id: "UP_KAN_001",
    name: "Kanpur Railway Station",
    lat: 26.4499,
    lon: 80.3319,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Uttar Pradesh",
    district: "Kanpur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-61002"
  },

  // Uttarakhand
  {
    shelter_id: "UK_DEH_001",
    name: "Dehradun Railway Station",
    lat: 30.3165,
    lon: 78.0322,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "Uttarakhand",
    district: "Dehradun",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-62001"
  },
  {
    shelter_id: "UK_HAR_001",
    name: "Haridwar Ganga Ghat Complex",
    lat: 29.9457,
    lon: 78.1642,
    capacity: 800,
    available: 450,
    status: "operational",
    state: "Uttarakhand",
    district: "Haridwar",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-62002"
  },

  // West Bengal
  {
    shelter_id: "WB_KOL_001",
    name: "Kolkata Howrah Station Complex",
    lat: 22.5726,
    lon: 88.3639,
    capacity: 2000,
    available: 1200,
    status: "operational",
    state: "West Bengal",
    district: "Kolkata",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-63001"
  },
  {
    shelter_id: "WB_ASA_001",
    name: "Asansol Railway Station",
    lat: 23.6739,
    lon: 86.9524,
    capacity: 600,
    available: 350,
    status: "operational",
    state: "West Bengal",
    district: "Asansol",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-63002"
  }
];

// Comprehensive flood zones for all Indian states
export const INDIAN_FLOOD_ZONES: FloodZone[] = [
  // Andhra Pradesh - Krishna River Basin
  {
    id: "FZ_AP_001",
    name: "Krishna River Flood Zone",
    state: "Andhra Pradesh",
    district: "Vijayawada",
    severity: "high",
    coordinates: [
      [16.4, 80.5],
      [16.6, 80.7],
      [16.8, 80.6],
      [16.6, 80.4],
      [16.4, 80.5]
    ],
    affected_roads: ["NH-16", "State Highway 45", "Local Road 12"]
  },

  // Assam - Brahmaputra River Basin
  {
    id: "FZ_AS_001",
    name: "Brahmaputra River Flood Zone",
    state: "Assam",
    district: "Guwahati",
    severity: "critical",
    coordinates: [
      [26.0, 91.6],
      [26.2, 91.8],
      [26.4, 91.7],
      [26.2, 91.5],
      [26.0, 91.6]
    ],
    affected_roads: ["NH-27", "State Highway 31", "Local Road 8"]
  },

  // Bihar - Ganga River Basin
  {
    id: "FZ_BH_001",
    name: "Ganga River Flood Zone",
    state: "Bihar",
    district: "Patna",
    severity: "critical",
    coordinates: [
      [25.4, 85.0],
      [25.6, 85.2],
      [25.8, 85.1],
      [25.6, 84.9],
      [25.4, 85.0]
    ],
    affected_roads: ["NH-19", "State Highway 20", "Local Road 15"]
  },

  // Gujarat - Sabarmati River Basin
  {
    id: "FZ_GJ_001",
    name: "Sabarmati River Flood Zone",
    state: "Gujarat",
    district: "Ahmedabad",
    severity: "moderate",
    coordinates: [
      [23.0, 72.5],
      [23.2, 72.7],
      [23.4, 72.6],
      [23.2, 72.4],
      [23.0, 72.5]
    ],
    affected_roads: ["NH-8", "State Highway 41", "Local Road 23"]
  },

  // Karnataka - Cauvery River Basin
  {
    id: "FZ_KA_001",
    name: "Cauvery River Flood Zone",
    state: "Karnataka",
    district: "Bangalore",
    severity: "moderate",
    coordinates: [
      [12.8, 77.5],
      [13.0, 77.7],
      [13.2, 77.6],
      [13.0, 77.4],
      [12.8, 77.5]
    ],
    affected_roads: ["NH-44", "State Highway 17", "Local Road 9"]
  },

  // Kerala - Periyar River Basin
  {
    id: "FZ_KL_001",
    name: "Periyar River Flood Zone",
    state: "Kerala",
    district: "Kochi",
    severity: "high",
    coordinates: [
      [9.8, 76.2],
      [10.0, 76.4],
      [10.2, 76.3],
      [10.0, 76.1],
      [9.8, 76.2]
    ],
    affected_roads: ["NH-66", "State Highway 49", "Local Road 7"]
  },

  // Maharashtra - Godavari River Basin
  {
    id: "FZ_MH_001",
    name: "Godavari River Flood Zone",
    state: "Maharashtra",
    district: "Pune",
    severity: "moderate",
    coordinates: [
      [18.4, 73.8],
      [18.6, 74.0],
      [18.8, 73.9],
      [18.6, 73.7],
      [18.4, 73.8]
    ],
    affected_roads: ["NH-48", "State Highway 4", "Local Road 11"]
  },

  // Odisha - Mahanadi River Basin
  {
    id: "FZ_OR_001",
    name: "Mahanadi River Flood Zone",
    state: "Odisha",
    district: "Cuttack",
    severity: "high",
    coordinates: [
      [20.4, 85.8],
      [20.6, 86.0],
      [20.8, 85.9],
      [20.6, 85.7],
      [20.4, 85.8]
    ],
    affected_roads: ["NH-16", "State Highway 26", "Local Road 14"]
  },

  // Punjab - Sutlej River Basin (keeping existing)
  {
    id: "FZ_PB_001",
    name: "Sutlej River Flood Zone",
    state: "Punjab",
    district: "Ludhiana",
    severity: "high",
    coordinates: [
      [30.8, 75.8],
      [31.0, 76.0],
      [31.2, 75.9],
      [31.0, 75.7],
      [30.8, 75.8]
    ],
    affected_roads: ["NH-1", "State Highway 15", "Local Road 23"]
  },

  // Tamil Nadu - Vaigai River Basin
  {
    id: "FZ_TN_001",
    name: "Vaigai River Flood Zone",
    state: "Tamil Nadu",
    district: "Madurai",
    severity: "moderate",
    coordinates: [
      [9.8, 78.0],
      [10.0, 78.2],
      [10.2, 78.1],
      [10.0, 77.9],
      [9.8, 78.0]
    ],
    affected_roads: ["NH-44", "State Highway 37", "Local Road 6"]
  },

  // Uttar Pradesh - Yamuna River Basin
  {
    id: "FZ_UP_001",
    name: "Yamuna River Flood Zone",
    state: "Uttar Pradesh",
    district: "Agra",
    severity: "high",
    coordinates: [
      [27.0, 78.0],
      [27.2, 78.2],
      [27.4, 78.1],
      [27.2, 77.9],
      [27.0, 78.0]
    ],
    affected_roads: ["NH-19", "State Highway 62", "Local Road 18"]
  },

  // West Bengal - Hooghly River Basin
  {
    id: "FZ_WB_001",
    name: "Hooghly River Flood Zone",
    state: "West Bengal",
    district: "Kolkata",
    severity: "critical",
    coordinates: [
      [22.4, 88.3],
      [22.6, 88.5],
      [22.8, 88.4],
      [22.6, 88.2],
      [22.4, 88.3]
    ],
    affected_roads: ["NH-12", "State Highway 1", "Local Road 25"]
  }
];

// Helper functions
export const getSheltersByState = (state: string): IndianShelter[] => {
  return INDIAN_SHELTERS.filter(shelter => shelter.state === state);
};

export const getSheltersByDistrict = (district: string): IndianShelter[] => {
  return INDIAN_SHELTERS.filter(shelter => shelter.district === district);
};

export const getSheltersWithinRadius = (lat: number, lon: number, radiusKm: number = 20): IndianShelter[] => {
  return INDIAN_SHELTERS.filter(shelter => {
    const distance = calculateDistance(lat, lon, shelter.lat, shelter.lon);
    return distance <= radiusKm && shelter.status === "operational";
  });
};

export const getFloodZonesByState = (state: string): FloodZone[] => {
  return INDIAN_FLOOD_ZONES.filter(zone => zone.state === state);
};

export const getFloodZonesByDistrict = (district: string): FloodZone[] => {
  return INDIAN_FLOOD_ZONES.filter(zone => zone.district === district);
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