export const FLOOD_SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const INCIDENT_TYPES = {
  FLOOD: 'flood',
  WATERLOGGING: 'waterlogging',
  INFRASTRUCTURE_DAMAGE: 'infrastructure_damage',
  ROAD_CLOSURE: 'road_closure',
  POWER_OUTAGE: 'power_outage',
  OTHER: 'other',
} as const;

export const REPORT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const USER_ROLES = {
  USER: 'user',
  CITIZEN: 'citizen',
  VOLUNTEER: 'volunteer',
  NGO: 'ngo',
  DMA: 'dma',
  ADMIN: 'admin',
} as const;

export const SHELTER_TYPES = {
  GOVERNMENT: 'government',
  NGO: 'ngo',
  COMMUNITY: 'community',
  SCHOOL: 'school',
} as const;

export const SHELTER_STATUS = {
  AVAILABLE: 'available',
  FULL: 'full',
  CLOSED: 'closed',
} as const;

export const NOTIFICATION_TYPES = {
  ALERT: 'alert',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
} as const;

export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const API_ENDPOINTS = {
  WINDY_FORECAST: 'https://api.windy.com/api/point-forecast/v2',
  OPENSTREETMAP_NOMINATIM: 'https://nominatim.openstreetmap.org',
  GRAPHHOPPER_ROUTING: 'https://graphhopper.com/api/1',
} as const;

export const APP_CONFIG = {
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGES_PER_REPORT: 5,
  DEFAULT_CACHE_TTL_SECONDS: 300,
  NEARBY_RADIUS_KM: 50,
  PREDICTION_DAYS: 10,
  MAX_ROUTE_WAYPOINTS: 10,
} as const;

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const EMERGENCY_NUMBERS = {
  DISASTER_MANAGEMENT: '1078',
  NDRF: '011-24363260',
  FIRE: '101',
  POLICE: '100',
  AMBULANCE: '102',
} as const;
