import { toast } from 'sonner';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  coords: LocationCoords;
  address: string;
  state: string;
  district: string;
  country: string;
}

export const getCurrentLocation = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<LocationInfo> => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    const address = data.display_name || 'Unknown location';
    const state = data.address?.state || data.address?.region || '';
    const district = data.address?.county || data.address?.city_district || data.address?.city || '';
    const country = data.address?.country || '';

    return {
      coords: { lat, lng },
      address,
      state,
      district,
      country,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      coords: { lat, lng },
      address: 'Unknown location',
      state: '',
      district: '',
      country: '',
    };
  }
};

export const getLocationWithDetails = async (): Promise<LocationInfo> => {
  try {
    const coords = await getCurrentLocation();
    const locationInfo = await reverseGeocode(coords.lat, coords.lng);
    return locationInfo;
  } catch (error) {
    toast.error('Unable to get your location. Please enable location access.');
    throw error;
  }
};

export const searchLocation = async (query: string): Promise<LocationInfo[]> => {
  try {
    // Using OpenStreetMap Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      coords: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
      address: item.display_name || 'Unknown location',
      state: item.address?.state || item.address?.region || '',
      district: item.address?.county || item.address?.city_district || item.address?.city || '',
      country: item.address?.country || '',
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};

// Indian states and districts mapping
export const indianStatesDistricts = {
  'Punjab': [
    'Amritsar', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Ferozepur',
    'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana',
    'Mansa', 'Moga', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur',
    'SAS Nagar', 'Shaheed Bhagat Singh Nagar', 'Sri Muktsar Sahib', 'Tarn Taran'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad',
    'Gurgaon', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal',
    'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula',
    'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha',
    'Auraiya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur',
    'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor',
    'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria',
    'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Firozabad',
    'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur',
    'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur',
    'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj',
    'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow',
    'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut',
    'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
    'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur',
    'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ]
};

export const getDistrictsForState = (state: string): string[] => {
  return indianStatesDistricts[state as keyof typeof indianStatesDistricts] || [];
};