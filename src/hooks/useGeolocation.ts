import { useState, useCallback } from 'react';
import type { GeoLocation } from '@/types';

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  isLoading: boolean;
  getCurrentLocation: () => Promise<GeoLocation | null>;
  clearLocation: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = useCallback(async (): Promise<GeoLocation | null> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          setIsLoading(false);
          resolve(loc);
        },
        (err) => {
          let errorMessage = 'Failed to get location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      accuracy: 0, // Manual entry has no accuracy metric
    });
    setError(null);
  }, []);

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
    clearLocation,
    setManualLocation,
  };
}
