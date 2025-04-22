import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  FlatList
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { getUserMemories } from '../../firebaseConfig';
import { Feather } from '@expo/vector-icons';
import { getCurrentLocation, searchAddressSuggestions, calculateDistance } from '../../services/locationService';

const CALLOUT_WIDTH = 220;
const CALLOUT_IMAGE_HEIGHT = 140;

const MapScreen = ({ navigation }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearbyMemories, setNearbyMemories] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5); // 5km radius by default
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Fetch memories and user location when the component mounts
    const fetchData = async () => {
      try {
        // Get user location
        const location = await getCurrentLocation();
        if (location && location.coords) {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
        
        // Get user memories
        const userMemories = await getUserMemories();
        setMemories(userMemories.filter(memory => 
          memory.location && memory.location.latitude && memory.location.longitude
        ));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to go to user's current location
  const goToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 1000);
    }
  };
  
  // Function to handle search query changes
  const handleSearchQueryChange = async (text) => {
    console.log('calling handleSearchQueryChange()');
    setSearchQuery(text);
    
    if (text.length > 2) { // Only search when user has typed at least 3 characters
      setShowSuggestions(true);
      if (userLocation) {
        console.log('calling searchAddressSuggestions()');
        console.log(text, userLocation.latitude, userLocation.longitude);
        const suggestions = await searchAddressSuggestions(
          text, 
          userLocation.latitude,
          userLocation.longitude
        );
        setAddressSuggestions(suggestions);

        console.log('addressSuggestions: ', addressSuggestions);
      }
    } else {
      setShowSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  // Function to handle selecting an address suggestion
  const handleSelectAddress = (address) => {
    setSearchQuery(address.name);
    setShowSuggestions(false);
    
    // Animate map to the selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: address.coordinates.latitude,
        longitude: address.coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }, 1000);
    }
    
    // Find memories within the search radius
    findNearbyMemories(address.coordinates, searchRadius);
  };

  // Function to find memories near a location
  const findNearbyMemories = (location, radiusInKm) => {
    const { latitude, longitude } = location;
    
    // Filter memories based on distance
    const nearby = memories.filter(memory => {
      if (!memory.location || !memory.location.latitude || !memory.location.longitude) {
        return false;
      }
      
      const distance = calculateDistance(
        latitude,
        longitude,
        memory.location.latitude,
        memory.location.longitude
      );
      
      return distance <= radiusInKm;
    });
    
    setNearbyMemories(nearby);
  };

  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for locations..."
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setShowSuggestions(false);
                setNearbyMemories([]);
              }}
            >
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Address Suggestions */}
      {showSuggestions && addressSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={addressSuggestions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSelectAddress(item)}
              >
                <Feather name="map-pin" size={16} color="#666" style={styles.suggestionIcon} />
                <Text style={styles.suggestionText} numberOfLines={2}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={
          userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          } : {
            latitude: 44.6488, // Default to Halifax coordinates if user location not available
            longitude: -63.5752,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          }
        }
      >
        {/* Show user's current location */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }}
            title="Your Location"
            pinColor="#4285F4" // Blue pin for user location
          />
        )}
        
        {/* Show memory markers - if we're searching, only show nearby memories */}
        {(nearbyMemories.length > 0 ? nearbyMemories : memories).map((memory) => (
          <Marker
            key={memory.id}
            coordinate={{
              latitude: memory.location.latitude,
              longitude: memory.location.longitude
            }}
            pinColor="#FF9500" // Orange pin for memories
          >
            <Callout
              tooltip
              onPress={() => navigation.navigate('MemoryDetail', { memory })}
            >
              <View style={styles.calloutContainer}>
                {memory.photos && memory.photos.length > 0 ? (
                  <Image 
                    source={{ uri: memory.photos[0] }} 
                    style={styles.calloutImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.calloutImagePlaceholder}>
                    <Feather name="image" size={24} color="#ccc" />
                  </View>
                )}
                <View style={styles.calloutTextContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>{memory.title}</Text>
                  <Text style={styles.calloutSubtitle} numberOfLines={1}>
                    {memory.locationName || 'Memory location'}
                  </Text>
                  <Text style={styles.calloutDate}>
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.calloutArrow} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      {/* Current location button */}
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={goToUserLocation}
      >
        <Feather name="navigation" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Horizontal list of nearby memories */}
      {nearbyMemories.length > 0 && (
        <View style={styles.memoryListContainer}>
          <View style={styles.memoryListHeader}>
            <Text style={styles.memoryListTitle}>
              {nearbyMemories.length} {nearbyMemories.length === 1 ? 'memory' : 'memories'} found
            </Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setNearbyMemories([]);
                setSearchQuery('');
              }}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            horizontal
            data={nearbyMemories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.memoryCard}
                onPress={() => navigation.navigate("MemoryDetail", { memory: item })}
                activeOpacity={0.8}
              >
                {/* Memory Image */}
                <View style={styles.memoryImageContainer}>
                  {item.photos && item.photos.length > 0 ? (
                    <Image 
                      source={{ uri: item.photos[0] }} 
                      style={styles.memoryThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderThumbnail}>
                      <Feather name="image" size={24} color="#ccc" />
                    </View>
                  )}
                </View>
                
                {/* Memory Info */}
                <View style={styles.memoryInfo}>
                  <Text style={styles.memoryTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.memoryLocation} numberOfLines={1}>
                    {item.locationName || 'Unknown location'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.memoryListContent}
          />
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    zIndex: 10, // to ensure the button stays above the memory list
  },
  calloutContainer: {
    width: CALLOUT_WIDTH,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  calloutImage: {
    width: CALLOUT_WIDTH,
    height: CALLOUT_IMAGE_HEIGHT,
  },
  calloutImagePlaceholder: {
    width: CALLOUT_WIDTH,
    height: CALLOUT_IMAGE_HEIGHT,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutTextContainer: {
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  calloutDate: {
    fontSize: 12,
    color: '#999',
  },
  calloutArrow: {
    width: 16,
    height: 8,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    alignSelf: 'center',
    marginTop: -1,
    marginBottom: -8,
    transform: [{ rotate: '180deg' }],
  },
  searchBarContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    right: 10,
    zIndex: 5,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 8,
    paddingTop: 8, 
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  clearSearchButton: {
    backgroundColor: '#FF3B30',
    padding: 6,
    borderRadius: 4,
  },
  clearSearchText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  memoryListContainer: {
    position: 'absolute',
    bottom: 90, // Position above the current location button
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    maxHeight: 220, // Limit the height so it doesn't take too much space
  },
  memoryListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  memoryListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 6,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  memoryListContent: {
    paddingHorizontal: 12,
  },
  memoryCard: {
    width: 160,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  memoryImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  memoryThumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  memoryInfo: {
    padding: 10,
  },
  memoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memoryLocation: {
    fontSize: 12,
    color: '#666',
  },
});

export default MapScreen;