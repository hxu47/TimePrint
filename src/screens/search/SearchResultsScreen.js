import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView,
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getUserMemories } from '../../firebaseConfig';

const SearchResultsScreen = ({ navigation, route }) => {
    const { filters, preFilteredMemories = [] } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [memories, setMemories] = useState([]);
    
    useEffect(() => {
        const filterMemories = async () => {
            setLoading(true);
            try {
                // Start with either pre-filtered memories or fetch all memories
                let memoriesToFilter = [];
                
                if (preFilteredMemories.length > 0) {
                  // Use pre-filtered memories if provided
                  memoriesToFilter = [...preFilteredMemories];
                } else {
                  // Otherwise fetch all memories
                  memoriesToFilter = await getUserMemories();
                }
                
                let filteredMemories = [...memoriesToFilter];

                // Apply date range filter
                if (filters.dateRange?.start || filters.dateRange?.end) {
                    filteredMemories = filteredMemories.filter(memory => {
                    const memoryDate = new Date(memory.createdAt);
                    if (filters.dateRange.start && memoryDate < filters.dateRange.start) {
                        return false;
                    }
                    if (filters.dateRange.end) {
                        // Set end date to end of day
                        const endDate = new Date(filters.dateRange.end);
                        endDate.setHours(23, 59, 59, 999);
                        if (memoryDate > endDate) {
                        return false;
                        }
                    }
                    return true;
                    });
                }

                // Apply location text filter
                if (filters.locationText && filters.locationText.trim()) {
                    const locationQuery = filters.locationText.toLowerCase();
                    filteredMemories = filteredMemories.filter(memory => {
                    if (!memory.locationName) return false;
                    return memory.locationName.toLowerCase().includes(locationQuery);
                    });
                }
                
                // Apply tags filter
                if (filters.tags && filters.tags.length > 0) {
                    filteredMemories = filteredMemories.filter(memory => {
                    if (!memory.tags || !memory.tags.length) return false;
                    
                    // Check if memory has at least one of the selected tags
                    return filters.tags.some(tag => memory.tags.includes(tag));
                    });
                }

                setMemories(filteredMemories);
            } catch(error) {
                console.error('Error filtering memories:', error);
            } finally {
                setLoading(false);
            }
        };

        filterMemories();
    }, [filters, preFilteredMemories]);

  
    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
        );
    }
  
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                    >
                    <Feather name="arrow-left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search Results</Text>
                    <View style={{width: 44}} />
                </View>
        
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                    {memories.length} {memories.length === 1 ? 'memory' : 'memories'} found
                    </Text>
                </View>
        
                <FlatList
                    data={memories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => {
                        navigation.navigate("MemoryDetail", { memory: item });
                        }}
                    >
                        <View style={styles.cardContent}>
                        {/* Left side - Photo */}
                        <View style={styles.imageContainer}>
                            {item.photos && item.photos.length > 0 ? (
                            <Image 
                                source={{ uri: item.photos[0] }} 
                                style={styles.memoryImage} 
                                resizeMode="cover"
                            />
                            ) : (
                            <View style={styles.placeholderImage} />
                            )}
                        </View>

                        {/* Right side - Text content */}
                        <View style={styles.textContent}>
                            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.date}>
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Text>
                            <View style={styles.locationContainer}>
                            <Text style={styles.locationIcon}>📍</Text>
                            <Text style={styles.locationText} numberOfLines={2}>
                                {item.locationName || 'Unknown location'}
                            </Text>
                            </View>
                        </View>
                        </View>
                    </TouchableOpacity>
                    )}
                    ListEmptyComponent={(
                    <View style={styles.emptyContainer}>
                        <Feather name="search" size={60} color="#ccc" />
                        <Text style={styles.emptyText}>
                        No memories found matching your filters.
                        </Text>
                        <TouchableOpacity 
                        style={styles.modifySearchButton}
                        onPress={() => navigation.goBack()}
                        >
                        <Text style={styles.modifySearchButtonText}>Modify Search</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                />
            </View>
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
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsInfo: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    resultsText: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        minHeight: 140,
    },
    imageContainer: {
        width: 140,
        height: 140,
        backgroundColor: '#e0e0e0',
    },
    memoryImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e0e0e0',
    },
    textContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 4,
        marginTop: 3,
    },
    locationText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    modifySearchButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    modifySearchButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default SearchResultsScreen;