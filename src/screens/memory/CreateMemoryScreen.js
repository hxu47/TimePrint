import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView
} from 'react-native';
import { createMemory } from '../../firebaseConfig';
import { Feather } from '@expo/vector-icons';
import { getWeatherData } from '../../services/weatherService';
import WeatherIcon from '../../components/weather/WeatherIcon';
import { getCurrentLocation } from '../../services/locationService';
import { pickImageFromGallery, takePhotoWithCamera } from '../../services/imagePickerService';
import ImageViewerModal from '../../components/images/ImageViewerModal';
import { useNavigation } from '@react-navigation/native';
import MapPickerModal from '../../components/maps/MapPickerModal';


const CreateMemoryScreen = () => {
  const navigation = useNavigation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationInfo, setLocationInfo] = useState(null);
  const [weather, setWeather] = useState("");
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  // State for image viewer
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State for map picker
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);

  const contentInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Using the shared location service instead of a local function

  const getWeather = async (latitude, longitude) => {
    try {
      const weatherData = await getWeatherData(latitude, longitude);
      return weatherData;
    } catch (error) {
      console.error('Error getting weather:', error);
      Alert.alert('Error', 'Failed to fetch weather data');
      return {
        temperature: null,
        condition: 'Unknown',
      };
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
    // Update weather based on the new location
    if (location && location.coords) {
      getWeather(location.coords.latitude, location.coords.longitude)
        .then(weatherData => {
          if (weatherData) {
            setWeather(weatherData);
          }
        });
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

  useEffect(() => {
    const initializeLocationAndWeather = async () => {
      try {
        setLoading(true);
        try {
          const locationData = await getCurrentLocation();
          if (locationData && locationData.coords) {
            setLocationInfo(locationData);
            const weatherData = await getWeather(
              locationData.coords.latitude,
              locationData.coords.longitude
            );
            if (weatherData) {
              setWeather(weatherData)
            }
          } else {
            // Handle case where location couldn't be determined
            Alert.alert(
              "Location Unavailable", 
              "Could not determine your current location. You can set location manually.",
              [{ text: "OK" }]
            );
          }
        } catch (error) {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Failed to fetch location data');
        }
      } finally {
        setLoading(false);
      }
    }
    initializeLocationAndWeather();
  }, [])


  const handleCreateMemory = async () => {
    if (!title || !content ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const memory = {
      title: title,
      content: content,
      location: locationInfo.coords,
      locationName: locationInfo.address,
      weather: {
        temperature: weather.temperature,
        condition: weather.condition,
      },
      photos: photos.map(photo => photo.uri),
      tags: tags,
      createdAt: new Date().toISOString(),
    };

    try {
      const id = await createMemory(memory);
      // Reset all form fields
      setTitle("");
      setContent("");
      setPhotos([]);
      setTags([]);
      setTagInput("");

      Alert.alert(
        'Success', 
        'Memory created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Replace the current screen with MemoryDetail instead of pushing a new one
              navigation.reset({
                index: 0,
                routes: [
                    { name: 'MainTabs' },
                    { name: 'MemoryDetail', params: { memory }}
                ]
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to create memory');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Getting location and weather...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>

    
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
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

          {/* Title Input Section */}
          <TextInput
            style={styles.input}
            placeholder="title"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.infoSection}>
            {/* Location Info Item - Now touchable to open map picker */}
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={handleOpenMapPicker}
            >
              <Feather name="map-pin" size={20} color="#666" />
              <Text style={styles.infoText}>
                {locationInfo ? locationInfo.address : 'Tap to select location'}
              </Text>
              <Feather name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <View style={[styles.infoItem, { marginBottom: 0 }]}>
              {weather && (
                <>
                  <WeatherIcon condition={weather.condition} />
                  <Text style={styles.infoText}>
                    {weather.temperature}°C, {weather.condition}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Content Input Section */}
          <TextInput
            ref={contentInputRef}
            style={[styles.input, styles.contentInput]}
            placeholder="Write your memory..."
            value={content}
            onChangeText={setContent}
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

          {/* Tag Input Section */}
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

          {/* Create Memory Button */}
          <TouchableOpacity 
            style={styles.button}
            onPress={handleCreateMemory}
          >
            <Text style={styles.buttonText}>Create Memory</Text>
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
          initialLocation={locationInfo?.coords} // The map displays starting at initialLocation
          onLocationSelected={handleLocationSelected} // When user taps "Confirm"
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
    paddingBottom: 50,
    backgroundColor: '#fff'
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
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10, 
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  lastInfoItem: {
    marginBottom: 0,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0, 
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  iconContainer: {
    width: 20,
    height: 20,
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
  addTagButtonDisabled: {
    backgroundColor: '#b0d3ff',
  },
});

export default CreateMemoryScreen;