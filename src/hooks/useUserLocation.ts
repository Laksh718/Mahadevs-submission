import { useState, useEffect } from 'react';
import { getCurrentLocation, reverseGeocode, type LocationInfo } from '@/lib/locationService';

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const coords = await getCurrentLocation();
        const locationInfo = await reverseGeocode(coords.lat, coords.lng);
        setLocation(locationInfo);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      const locationInfo = await reverseGeocode(coords.lat, coords.lng);
      setLocation(locationInfo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refreshLocation };
};
