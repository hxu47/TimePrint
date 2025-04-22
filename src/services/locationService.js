import * as Location from 'expo-location';
import { MAPBOX_ACCESS_TOKEN } from '../config';

// Get current location with address
export const getCurrentLocation = async () => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission to access location was denied');
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        const addressData = await getAddressFromCoordinates(latitude, longitude);
        
        return {
          coords: { latitude, longitude },
          address: addressData
        };
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
};

// Get address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const [addressResponse] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
  
      const formattedAddress = `${addressResponse.street || ''}, ${addressResponse.city || ''}, ${addressResponse.region || ''}`;
      return formattedAddress;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
};


// Search location by name
export const searchLocationByName = async (locationName) => {
  try {
    const result = await Location.geocodeAsync(locationName);
    
    if (result && result.length > 0) {
      const { latitude, longitude } = result[0];
      
      // Get the address details for the coordinates
      const addressData = await getAddressFromCoordinates(latitude, longitude);
      
      return {
        coords: { latitude, longitude },
        address: addressData || locationName,
        searchTerm: locationName
      };
    }
    return null;
  } catch (error) {
    console.error('Error searching location:', error);
    return null;
  }
};

// Search addresses with Suggestions
export const searchAddressSuggestions = async (query, latitude, longitude) => {
  try {
    // Base URL for Mapbox Geocoding API 
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=${longitude},${latitude}&access_token=${MAPBOX_ACCESS_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address suggestions');
    }
    
    const data = await response.json();
    
    // Format the results
    return data.features.map(feature => ({
      id: feature.id,
      name: feature.place_name,
      coordinates: {
        latitude: feature.center[1],
        longitude: feature.center[0]
      }
    }));
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
};

// Helper function: Calculate distance between two coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

// Helper function: Convert degrees to radians
const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

