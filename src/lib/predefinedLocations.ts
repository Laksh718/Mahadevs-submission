// Predefined locations for consistent data processing
export interface PredefinedLocation {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  type: 'city' | 'district' | 'area' | 'landmark';
}

export const PREDEFINED_LOCATIONS: PredefinedLocation[] = [
  // Punjab
  { id: 'punjab-ludhiana', name: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573, type: 'city' },
  { id: 'punjab-chandigarh', name: 'Chandigarh', state: 'Punjab', district: 'Chandigarh', lat: 30.7333, lng: 76.7794, type: 'city' },
  { id: 'punjab-amritsar', name: 'Amritsar', state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723, type: 'city' },
  { id: 'punjab-jalandhar', name: 'Jalandhar', state: 'Punjab', district: 'Jalandhar', lat: 31.3260, lng: 75.5762, type: 'city' },
  { id: 'punjab-patiala', name: 'Patiala', state: 'Punjab', district: 'Patiala', lat: 30.3398, lng: 76.3869, type: 'city' },
  { id: 'punjab-bathinda', name: 'Bathinda', state: 'Punjab', district: 'Bathinda', lat: 30.2070, lng: 74.9489, type: 'city' },
  { id: 'punjab-firozpur', name: 'Firozpur', state: 'Punjab', district: 'Firozpur', lat: 30.9200, lng: 74.6100, type: 'city' },
  { id: 'punjab-moga', name: 'Moga', state: 'Punjab', district: 'Moga', lat: 30.8167, lng: 75.1667, type: 'city' },
  { id: 'punjab-sangrur', name: 'Sangrur', state: 'Punjab', district: 'Sangrur', lat: 30.2500, lng: 75.8500, type: 'city' },
  { id: 'punjab-mohali', name: 'Mohali', state: 'Punjab', district: 'Mohali', lat: 30.7046, lng: 76.7179, type: 'city' },

  // Tamil Nadu
  { id: 'tn-chennai', name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'city' },
  { id: 'tn-coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558, type: 'city' },
  { id: 'tn-madurai', name: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198, type: 'city' },
  { id: 'tn-trichy', name: 'Trichy', state: 'Tamil Nadu', district: 'Trichy', lat: 10.7905, lng: 78.7047, type: 'city' },
  { id: 'tn-salem', name: 'Salem', state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460, type: 'city' },
  { id: 'tn-tirunelveli', name: 'Tirunelveli', state: 'Tamil Nadu', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567, type: 'city' },
  { id: 'tn-erode', name: 'Erode', state: 'Tamil Nadu', district: 'Erode', lat: 11.3410, lng: 77.7172, type: 'city' },
  { id: 'tn-vellore', name: 'Vellore', state: 'Tamil Nadu', district: 'Vellore', lat: 12.9202, lng: 79.1500, type: 'city' },

  // Maharashtra
  { id: 'mh-mumbai', name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'city' },
  { id: 'mh-pune', name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, type: 'city' },
  { id: 'mh-nashik', name: 'Nashik', state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898, type: 'city' },
  { id: 'mh-nagpur', name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, type: 'city' },
  { id: 'mh-kolhapur', name: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur', lat: 16.7050, lng: 74.2433, type: 'city' },
  { id: 'mh-sangli', name: 'Sangli', state: 'Maharashtra', district: 'Sangli', lat: 16.8524, lng: 74.5815, type: 'city' },
  { id: 'mh-satara', name: 'Satara', state: 'Maharashtra', district: 'Satara', lat: 17.6805, lng: 74.0183, type: 'city' },
  { id: 'mh-solapur', name: 'Solapur', state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064, type: 'city' },

  // Kerala
  { id: 'kl-thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, type: 'city' },
  { id: 'kl-kochi', name: 'Kochi', state: 'Kerala', district: 'Kochi', lat: 9.9312, lng: 76.2673, type: 'city' },
  { id: 'kl-kozhikode', name: 'Kozhikode', state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804, type: 'city' },
  { id: 'kl-thrissur', name: 'Thrissur', state: 'Kerala', district: 'Thrissur', lat: 10.5276, lng: 76.2144, type: 'city' },
  { id: 'kl-wayanad', name: 'Wayanad', state: 'Kerala', district: 'Wayanad', lat: 11.6854, lng: 76.1320, type: 'district' },
  { id: 'kl-idukki', name: 'Idukki', state: 'Kerala', district: 'Idukki', lat: 9.8497, lng: 76.9681, type: 'district' },
  { id: 'kl-kannur', name: 'Kannur', state: 'Kerala', district: 'Kannur', lat: 11.8745, lng: 75.3704, type: 'city' },
  { id: 'kl-kollam', name: 'Kollam', state: 'Kerala', district: 'Kollam', lat: 8.8932, lng: 76.6141, type: 'city' },

  // Telangana
  { id: 'tg-hyderabad', name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'city' },
  { id: 'tg-warangal', name: 'Warangal', state: 'Telangana', district: 'Warangal', lat: 17.9689, lng: 79.5941, type: 'city' },
  { id: 'tg-karimnagar', name: 'Karimnagar', state: 'Telangana', district: 'Karimnagar', lat: 18.4386, lng: 79.1288, type: 'city' },
  { id: 'tg-nizamabad', name: 'Nizamabad', state: 'Telangana', district: 'Nizamabad', lat: 18.6715, lng: 78.0948, type: 'city' },
  { id: 'tg-khammam', name: 'Khammam', state: 'Telangana', district: 'Khammam', lat: 17.2473, lng: 80.1514, type: 'city' },

  // West Bengal
  { id: 'wb-kolkata', name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'city' },
  { id: 'wb-asansol', name: 'Asansol', state: 'West Bengal', district: 'Asansol', lat: 23.6739, lng: 86.9524, type: 'city' },
  { id: 'wb-siliguri', name: 'Siliguri', state: 'West Bengal', district: 'Siliguri', lat: 26.7271, lng: 88.3953, type: 'city' },
  { id: 'wb-durgapur', name: 'Durgapur', state: 'West Bengal', district: 'Durgapur', lat: 23.5204, lng: 87.3119, type: 'city' },
  { id: 'wb-bardhaman', name: 'Bardhaman', state: 'West Bengal', district: 'Bardhaman', lat: 23.2400, lng: 87.8700, type: 'city' },

  // Common landmarks and areas
  { id: 'landmark-golden-temple', name: 'Golden Temple', state: 'Punjab', district: 'Amritsar', lat: 31.6200, lng: 74.8765, type: 'landmark' },
  { id: 'landmark-marina-beach', name: 'Marina Beach', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0418, lng: 80.2862, type: 'landmark' },
  { id: 'landmark-gateway-india', name: 'Gateway of India', state: 'Maharashtra', district: 'Mumbai', lat: 18.9220, lng: 72.8347, type: 'landmark' },
  { id: 'landmark-charminar', name: 'Charminar', state: 'Telangana', district: 'Hyderabad', lat: 17.3616, lng: 78.4747, type: 'landmark' },
  { id: 'landmark-victoria-memorial', name: 'Victoria Memorial', state: 'West Bengal', district: 'Kolkata', lat: 22.5448, lng: 88.3426, type: 'landmark' },
];

// Search function for predefined locations
export const searchPredefinedLocations = (query: string): PredefinedLocation[] => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return PREDEFINED_LOCATIONS.filter(location => 
    location.name.toLowerCase().includes(lowercaseQuery) ||
    location.state.toLowerCase().includes(lowercaseQuery) ||
    location.district.toLowerCase().includes(lowercaseQuery) ||
    location.type.toLowerCase().includes(lowercaseQuery)
  ).slice(0, 10); // Limit to 10 results
};

// Get locations by state
export const getLocationsByState = (state: string): PredefinedLocation[] => {
  return PREDEFINED_LOCATIONS.filter(location => 
    location.state.toLowerCase() === state.toLowerCase()
  );
};

// Get all states
export const getAllStates = (): string[] => {
  const states = new Set(PREDEFINED_LOCATIONS.map(location => location.state));
  return Array.from(states).sort();
};

// Get location by ID
export const getLocationById = (id: string): PredefinedLocation | null => {
  return PREDEFINED_LOCATIONS.find(location => location.id === id) || null;
};

// Convert predefined location to location info format
export const convertToLocationInfo = (location: PredefinedLocation) => {
  return {
    coords: { lat: location.lat, lng: location.lng },
    address: `${location.name}, ${location.district}, ${location.state}`,
    state: location.state,
    district: location.district,
    country: 'India'
  };
};