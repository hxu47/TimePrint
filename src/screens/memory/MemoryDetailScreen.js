import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    ScrollView, 
    SafeAreaView, 
    Dimensions,
    Modal,
    StatusBar,
    Alert
  } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import ImageViewerModal from '../../components/images/ImageViewerModal';
import SwipeableGallery from '../../components/images/SwipeableGallery';
import LocationViewModal from '../../components/maps/LocationViewModal';
import { getWeatherEmoji } from '../../services/weatherService';
import { saveRecentMemory } from '../../services/recentMemoryService';
import { deleteMemory } from '../../firebaseConfig'; 


const MemoryDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const memory = route.params?.memory;
    const scrollViewRef = useRef(null);
    const windowWidth = Dimensions.get('window').width;
    // State for image viewer
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    // State for location modal
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

    
    // If no memory is passed, show an error message
    if (!memory) {
        return (
        <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>Memory not found</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
        );
    }

    // the recent memory tracker
    useEffect(() => {
        if (memory && memory.id) {
          saveRecentMemory(memory.id);
        }
      }, [memory?.id]);

    // Format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        
        // Format date as YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFormatted = `${year}-${month}-${day}`;
        
        // Format time as h:mm AM/PM
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hoursFormatted = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const timeFormatted = `${hoursFormatted}:${minutes} ${ampm}`;
        
        // Combine date and time
        return `${dateFormatted} ${timeFormatted}`;
      };

    // Get weather icon based on condition
    const getWeatherIcon = (condition) => {
        return getWeatherEmoji(condition);
    };

    const handleDeletePress = () => {
        Alert.alert(
            "Delete Memory",
            "Are you sure you want to delete this memory? This action cannot be undone.",
            [
                { 
                    text: "Cancel", 
                    style: "cancel" 
                },
                {
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMemory(memory.id);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting memory:', error);
                            Alert.alert('Error', 'Failed to delete the memory.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header with back button and title */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => {
                            console.log('Back button pressed');
                            navigation.goBack();
                        }}
                        activeOpacity={0.7}
                        testID="back-button"
                    >
                        <Feather name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>Memory Details</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.iconButton} 
                            onPress={() => navigation.navigate('EditMemory', { memory })}
                            activeOpacity={0.7}
                        >
                            <Feather name="edit-2" size={22} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.iconButton} 
                            onPress={handleDeletePress}
                            activeOpacity={0.7}
                        >
                            <Feather name="trash-2" size={22} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Memory Image Gallery (Swipeable) */}
                <SwipeableGallery 
                    images={memory.photos || []}
                    onImagePress={(index) => {
                        setCurrentImageIndex(index);
                        setIsImageViewerVisible(true);
                    }}
                    height={250}
                />

                {/* Memory Title */}
                <Text style={styles.title}>{memory.title}</Text>
                
                {/* Info Cards */}
                <View style={styles.infoCardsContainer}>
                    {/* Location Card - Touchable */}
                    <TouchableOpacity 
                        style={styles.infoCard}
                        onPress={() => memory.location && setIsLocationModalVisible(true)}
                    >
                        <Feather name="map-pin" size={20} color="#007AFF" />
                        <Text style={styles.infoCardText}>
                            {memory.locationName || 'Unknown location'}
                        </Text>
                    </TouchableOpacity>

                    {/* Date Card */}
                    <View style={styles.infoCard}>
                        <Feather name="calendar" size={20} color="#FF9500" />
                        <Text style={styles.infoCardText}>
                            {formatDate(memory.createdAt)}
                        </Text>
                    </View>
                    {memory.updatedAt && memory.updatedAt !== memory.createdAt && (
                    <View style={styles.infoCard}>
                        <Feather name="edit" size={20} color="#4CAF50" />
                        <Text style={styles.infoCardText}>
                        Last edited: {formatDate(memory.updatedAt)}
                        </Text>
                    </View>
                    )}

                    {/* Weather Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.weatherIcon}>
                                {getWeatherIcon(memory.weather?.condition)}
                            </Text>
                        </View>
                        <Text style={styles.infoCardText}>
                            {memory.weather ? 
                            `${memory.weather.condition}, ${memory.weather.temperature}°C` : 
                            'Weather information not available'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View style={[
                    styles.contentContainer, 
                    { minHeight: Math.min(300, (memory.content?.length || 0) / 3) }
                ]}>
                    <Text style={styles.contentTitle}>Memory</Text>
                    <Text style={styles.content}>{memory.content}</Text>
                </View>

                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        <Text style={styles.tagsTitle}>Tags</Text>
                        <View style={styles.tagsList}>
                            {memory.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Bottom spacing */}
                <View style={{height: 40}} />

            </ScrollView>

            {/* Full Screen Image Viewer Modal */}
            <ImageViewerModal
                visible={isImageViewerVisible}
                onClose={() => setIsImageViewerVisible(false)}
                images={memory?.photos || []}
                initialIndex={currentImageIndex}
            />

            {/* Location View Modal */}
            <LocationViewModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
                location={memory.location}
                locationName={memory.locationName}
            />

        </SafeAreaView>
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
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
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
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f0f0f0',
        position: 'relative',
    },
    photoGalleryScroll: {
        width: '100%',
        height: '100%',
    },
    memoryImage: {
        width: Dimensions.get('window').width, // Dynamically use screen width for proper paging
        height: 250,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDots: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        margin: 3,
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 15,
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        margin: 16,
        marginBottom: 8,
    },
    infoCardsContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoCardText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    iconContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    weatherIcon: {
        fontSize: 20,
    },
    contentContainer: {
        padding: 16,
        paddingTop: 8,
        minHeight: 100, // Minimum height for short content
    },
    contentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
        flexGrow: 1, // Allows the text to expand the container
    },
    tagsContainer: {
        padding: 16,
        paddingTop: 8,
    },
    tagsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    tagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#e1f5fe',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        margin: 4,
    },
    tagText: {
        color: '#0277bd',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MemoryDetailScreen;