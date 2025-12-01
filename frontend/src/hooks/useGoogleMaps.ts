import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDUrOVk--hReqOCMjP_saikhCLoYukc_kU';
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

export interface UseGoogleMapsResult {
  isLoaded: boolean;
  loadError: Error | null;
}

/**
 * Custom hook to dynamically load the Google Maps JavaScript API
 * Returns loading state and any errors that occurred during loading
 */
export const useGoogleMaps = (): UseGoogleMapsResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      // Wait for existing script to load
      existingScript.addEventListener('load', () => setIsLoaded(true));
      existingScript.addEventListener('error', () =>
        setLoadError(new Error('Failed to load Google Maps script'))
      );
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError(new Error('Google Maps API loaded but not available'));
      }
    });

    script.addEventListener('error', () => {
      setLoadError(new Error('Failed to load Google Maps script'));
    });

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Note: We don't remove the script on cleanup as it may be used by other components
      script.removeEventListener('load', () => setIsLoaded(true));
      script.removeEventListener('error', () =>
        setLoadError(new Error('Failed to load Google Maps script'))
      );
    };
  }, []);

  return { isLoaded, loadError };
};

// Type augmentation for Google Maps global object
declare global {
  interface Window {
    google: typeof google;
  }
}
