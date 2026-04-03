import { useState, useCallback } from 'react';

// Define a more specific type for the coordinates for clarity
type GeolocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

// Define a more specific type for the error for clarity
type GeolocationError = {
  code: number;
  message: string;
};

export const useGeolocation = () => {
  // Separate states can sometimes be easier to manage than a single state object
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [data, setData] = useState<GeolocationData | null>(null);

  // useCallback prevents the function from being recreated on every render,
  // which is a good practice for functions passed to other components or used in effects.
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError({ code: err.code, message: err.message });
        setIsLoading(false);
      }
    );
  }, []); // The dependency array is empty, so the function is created only once.

  return { isLoading, error, data, getLocation };
};