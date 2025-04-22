import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { updateMemory } from '../../firebaseConfig';
import { getWeatherData } from '../../services/weatherService';
import { pickImageFromGallery, takePhotoWithCamera } from '../../services/imagePickerService';
import WeatherIcon from '../../components/weather/WeatherIcon';
import ImageViewerModal from '../../components/images/ImageViewerModal';
import MapPickerModal from '../../components/maps/MapPickerModal';


const EditMemoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const memory = route.params?.memory;
  const contentInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  
  // States for form fields
  const [title, setTitle] = useState(memory?.title || '');
  const [content, setContent] = useState(memory?.content || '');
  const [photos, setPhotos] = useState(memory?.photos ? memory.photos.map(uri => ({ uri })) : []);
  const [locationInfo, setLocationInfo] = useState({
    coords: memory?.location || null,
    address: memory?.locationName || ''
  });
  const [weather, setWeather] = useState(memory?.weather || null);
  const [tags, setTags] = useState(memory?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  // States for UI
  const [loading, setLoading] = useState(false);
  const [refreshingWeather, setRefreshingWeather] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);

  if (!memory) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Memory not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  
  
  const refreshWeather = async (latitude, longitude) => {
    try {
      setRefreshingWeather(true);
      
      // Use coordinates from params if provided, otherwise use current location
      const lat = latitude || locationInfo.coords?.latitude;
      const lon = longitude || locationInfo.coords?.longitude;
      
      if (lat && lon) {
        const weatherData = await getWeatherData(lat, lon);
        setWeather(weatherData);
      } else {
        Alert.alert('Error', 'Location coordinates required to fetch weather');
      }
    } catch (error) {
      console.error('Error getting weather:', error);
      Alert.alert('Error', 'Failed to fetch weather data');
    } finally {
      setRefreshingWeather(false);
    }
  };
  
  const handlePickImage = async () => {
    pickImageFromGallery(setPhotos);
  };

  const handleTakePhoto = async () => {
    takePhotoWithCamera(setPhotos);
  };
  
  // Function to handle opening the map picker
  const handleOpenMapPicker = () => {
    setIsMapPickerVisible(true);
  };

  // Function to handle location selection from the map picker
  const handleLocationSelected = (location) => {
    setLocationInfo(location);
    
    // No automatic weather update here
    // Weather will only update when the refresh button is clicked
  };

  
  const handleUpdateMemory = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create GeoPoint structure for Firestore
      const geoPoint = locationInfo.coords ? {
        latitude: locationInfo.coords.latitude,
        longitude: locationInfo.coords.longitude
      } : null;
      
      const updatedData = {
        title,
        content,
        photos: photos.map(photo => photo.uri),
        location: geoPoint,
        locationName: locationInfo.address,
        weather,
        tags,
        updatedAt: new Date().toISOString(),
      };
      
      await updateMemory(memory.id, updatedData);
      
      Alert.alert(
        'Success', 
        'Memory updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Replace the current screen with MemoryDetail instead of pushing a new one
              // This removes EditMemory from the stack
              navigation.reset({
                index: 0,
                routes: [
                    { name: 'MainTabs' },
                    { name: 'MemoryDetail', 
                      params: { memory: { ...memory, ...updatedData }}
                    }
                ]
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating memory:', error);
      Alert.alert('Error', 'Failed to update memory');
    } finally {
      setLoading(false);
    }
  };

  
  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    } else if (tags.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 tags allowed per memory');
    }
  };

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.container} 
            onPress={Keyboard.dismiss}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Edit Memory</Text>
              <View style={{width: 44}} />
            </View>
            
            {/* Photo Section */}
            <View style={styles.photoSection}>
              <View style={styles.photoHeader}> 
                <Text style={styles.label}>Photos ({photos.length}/5)</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity 
                    style={[styles.iconButton, photos.length >= 5 && styles.iconButtonDisabled]} 
                    onPress={handleTakePhoto}
                    disabled={photos.length >= 5}
                  >
                    <Feather 
                      name="camera" 
                      size={24} 
                      color={photos.length >= 5 ? '#999' : '#007AFF'} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.iconButton, photos.length >= 5 && styles.iconButtonDisabled]} 
                    onPress={handlePickImage}
                    disabled={photos.length >= 5}
                  >
                    <Feather 
                      name="image" 
                      size={24} 
                      color={photos.length >= 5 ? '#999' : '#007AFF'} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Photo Preview Section */}
              <ScrollView 
                horizontal 
                style={styles.photoPreviewContainer}
                showsHorizontalScrollIndicator={false}
              >
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoPreview}>
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentImageIndex(index);
                        setIsImageViewerVisible(true);
                      }}
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.previewImage}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        const newPhotos = photos.filter((_, i) => i !== index);
                        setPhotos(newPhotos);
                      }}
                    >
                      <Text style={styles.removePhotoText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            
            {/* Title Input */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Memory title"
            />
            
            {/* Location and Weather Section */}
            <View style={styles.infoSection}>
              {/* Location Card - touchable to open map picker */}
              <TouchableOpacity 
                style={styles.infoItem}
                onPress={handleOpenMapPicker}
              >
                <Feather name="map-pin" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {locationInfo.address || 'Tap to select location'}
                </Text>
                <Feather name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>

              {/* Weather Card */}
              <View style={[styles.infoItem, { marginBottom: 0 }]}>
                {weather ? (
                  <>
                    <WeatherIcon condition={weather.condition} />
                    <Text style={styles.infoText}>
                      {weather.temperature}°C, {weather.condition}
                    </Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={() => {
                        if (locationInfo.coords) {
                          refreshWeather();
                        } else {
                          Alert.alert('Error', 'Location needed to update weather');
                        }
                      }}
                      disabled={refreshingWeather}
                    >
                      {refreshingWeather ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Feather name="refresh-cw" size={16} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.infoText}>Weather data not available</Text>
                )}
              </View>
            </View>
            
            {/* Content Input */}
            <Text style={styles.label}>Content</Text>
            <TextInput
              ref={contentInputRef}
              style={[styles.input, styles.contentInput]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your memory..."
              multiline
              onFocus={() => {
                // Add a slight delay to ensure the keyboard is fully visible
                setTimeout(() => {
                  contentInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                    // Scroll to the input's position plus some extra space
                    scrollViewRef.current?.scrollTo({
                      y: pageY - 100,
                      animated: true
                    });
                  });
                }, 300);
              }}
            />
            
            {/* Tags Input */}
            <View style={styles.tagSection}>
              <Text style={styles.label}>Tags ({tags.length}/5)</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  ref={tagInputRef}
                  style={styles.tagInput}
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                  editable={tags.length < 5}
                  onFocus={() => {
                    // When tag input is focused, scroll to make it fully visible
                    setTimeout(() => {
                      tagInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                        scrollViewRef.current?.scrollTo({
                          y: pageY - 100, // Scroll the input closer to the top
                          animated: true
                        });
                      });
                    }, 300);
                  }}
                />
                <TouchableOpacity 
                  style={[
                    styles.addTagButton,
                    tags.length >= 5 && styles.addTagButtonDisabled
                  ]}
                  onPress={handleAddTag}
                  disabled={tags.length >= 5}
                >
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {/* Display Tags */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.tagsContainer}
              >
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newTags = [...tags];
                        newTags.splice(index, 1);
                        setTags(newTags);
                      }}
                    >
                      <Text style={styles.removeTagText}> ×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            
            {/* Update Button */}
            <TouchableOpacity 
              style={styles.button}
              onPress={handleUpdateMemory}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Memory</Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Full Screen Image Viewer Modal */}
          <ImageViewerModal
            visible={isImageViewerVisible}
            onClose={() => setIsImageViewerVisible(false)}
            images={photos.map(photo => photo.uri)}
            initialIndex={currentImageIndex}
          />

          {/* Map Picker Modal */}
          <MapPickerModal
            visible={isMapPickerVisible}
            onClose={() => setIsMapPickerVisible(false)}
            initialLocation={locationInfo?.coords}
            onLocationSelected={handleLocationSelected}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { 
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 10,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  goBackText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  iconButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  photoSection: {
    marginBottom: 20, 
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 100,
  },
  photoPreview: {
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    right: -4, 
    top: -4,
    backgroundColor: '#ff3b30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20, 
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagSection: {
    marginBottom: 20,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  addTagButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: '#b0d3ff',
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    minHeight: 40,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  tagText: {
    color: '#0277bd',
    fontSize: 14,
  },
  removeTagText: {
    color: '#0277bd',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditMemoryScreen;