// src/services/locationService.ts

// Temporarily hardcoded for testing
const BACKEND_API_URL = 'https://janrakshak-pre-alert-model.onrender.com';

export const getCityFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
    try {
        const response = await fetch(
            `${BACKEND_API_URL}/reverse-geocode?lat=${lat}&lon=${lon}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch address from coordinates');
        }
        
        const data = await response.json();
        return data.display_name || null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

export const getCoordinatesFromCity = async (placeName: string): Promise<{lat: number, lon: number} | null> => {
    try {
        const response = await fetch(
            `${BACKEND_API_URL}/geocode?q=${encodeURIComponent(placeName + ', India')}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch coordinates from place name');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return { 
                lat: parseFloat(data[0].lat), 
                lon: parseFloat(data[0].lon) 
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};