import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getCurrentLocation, getAddressFromCoordinates } from '../../services/locationService';

const { width, height } = Dimensions.get('window');

// Default region (San Francisco) as a fallback
const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapPickerModal = ({ 
  visible, 
  onClose, 
  initialLocation, 
  onLocationSelected 
}) => {
  // Reference to the map
  const mapRef = useRef(null);
  
  // State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);

  // When the modal becomes visible, initialize with the initial location or fetch current location
  useEffect(() => {
    if (visible) {
      initializeLocation();
    }
  }, [visible, initialLocation]);

  // Initialize location when modal opens
  const initializeLocation = async () => {
    // If initialLocation is provided and valid, use it
    if (initialLocation && 
        typeof initialLocation === 'object' && 
        typeof initialLocation.latitude === 'number' && 
        typeof initialLocation.longitude === 'number') {
      
      setSelectedLocation(initialLocation);
      setMapRegion({
        ...DEFAULT_REGION,
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
      });
      
      try {
        const address = await getAddressFromCoordinates(initialLocation.latitude, initialLocation.longitude);
        setLocationName(address);
      } catch (error) {
        console.error('Error getting address:', error);
        setLocationName('Unknown location');
      }
    } else {
      // Otherwise, try to get current location
      handleGetCurrentLocation();
    }
  };

  // Function to fetch the location name from coordinates
  const fetchLocationName = async (latitude, longitude) => {
    if (!latitude || !longitude) return;
    
    try {
      const address = await getAddressFromCoordinates(latitude, longitude);
      setLocationName(address);
    } catch (error) {
      console.error('Error fetching location name:', error);
      setLocationName('Unknown location');
    }
  };

  // Handle map press to update marker position
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    if (coordinate && coordinate.latitude && coordinate.longitude) {
      setSelectedLocation(coordinate);
      fetchLocationName(coordinate.latitude, coordinate.longitude);
    }
  };

  // Function to get current location
  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData && locationData.coords) {
        const { latitude, longitude } = locationData.coords;
        
        // Update selected location
        setSelectedLocation({
          latitude,
          longitude
        });
        
        // Update map region
        if (mapRef.current) {
          setMapRegion({
            ...DEFAULT_REGION,
            latitude,
            longitude
          });
        }
        
        // Update location name
        setLocationName(locationData.address || 'Current Location');
      } else {
        Alert.alert(
          'Location Unavailable',
          'Could not determine your current location. Please select a location on the map.'
        );
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location. Please select a location on the map.');
    } finally {
      setLoading(false);
    }
  };

  // Save selected location and close modal
  const confirmLocation = () => {
    if (selectedLocation && 
        typeof selectedLocation.latitude === 'number' && 
        typeof selectedLocation.longitude === 'number') {
      
      onLocationSelected({
        coords: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        },
        address: locationName || 'Selected Location'
      });
      onClose();
    } else {
      Alert.alert('No Location Selected', 'Please select a location on the map first.');
    }
  };

  // Handle map ready event
  const handleMapReady = () => {
    setMapReady(true);
    
    // If we already have a selected location, animate to it
    if (selectedLocation && 
        typeof selectedLocation.latitude === 'number' && 
        typeof selectedLocation.longitude === 'number' && 
        mapRef.current) {
      
      mapRef.current.animateToRegion({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 300);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Location</Text>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={confirmLocation}
            >
              <Text style={styles.saveButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            {!mapReady && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
            )}
            
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={mapRegion}
              onPress={handleMapPress}
              onMapReady={handleMapReady}
            >
              {selectedLocation && 
               typeof selectedLocation.latitude === 'number' && 
               typeof selectedLocation.longitude === 'number' && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude
                  }}
                  draggable
                  onDragEnd={(e) => {
                    const { coordinate } = e.nativeEvent;
                    if (coordinate && coordinate.latitude && coordinate.longitude) {
                      setSelectedLocation(coordinate);
                      fetchLocationName(coordinate.latitude, coordinate.longitude);
                    }
                  }}
                />
              )}
            </MapView>

            {/* Current Location Button */}
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={handleGetCurrentLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="navigation" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Location Details */}
          <View style={styles.locationDetails}>
            <Feather name="map-pin" size={20} color="#666" style={styles.locationIcon} />
            <Text style={styles.locationText}>{locationName || 'Move the marker to select a location'}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 10,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationIcon: {
    marginRight: 10,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default MapPickerModal;