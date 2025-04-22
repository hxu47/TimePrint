import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUserMemories } from '../../firebaseConfig';
import { getRecentMemory } from '../../services/recentMemoryService';
import { getSortOrderPreference } from '../../services/userPreferencesService.js';
import { Feather } from '@expo/vector-icons';

const MemoryListScreen = ({ navigation }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentMemoryId, setRecentMemoryId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMemories, setFilteredMemories] = useState([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMemories();
    setRefreshing(false);
  };

  // Effect to filter memories when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, show all memories
      setFilteredMemories(memories);
      return;
    }
    
    // Filter memories by title or content
    const filtered = memories.filter(memory => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const titleMatch = memory.title?.toLowerCase().includes(lowerCaseQuery);
      const contentMatch = memory.content?.toLowerCase().includes(lowerCaseQuery);
      
      return titleMatch || contentMatch;
    });
    
    setFilteredMemories(filtered);
  }, [searchQuery, memories]);

  useFocusEffect(
    React.useCallback(() => {
      const checkRecentMemory = async () => {
        const memoryId = await getRecentMemory();
        setRecentMemoryId(memoryId);
      };
      
      checkRecentMemory();
      loadMemories();
      
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  const loadMemories = async () => {
    try {
      const sortOrderPreference = await getSortOrderPreference();
      const userMemories = await getUserMemories();
      
      // Apply sort based on user preference
      if (sortOrderPreference === 'oldest') {
        userMemories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      setMemories(userMemories);
      setFilteredMemories(userMemories); // Initially show all memories
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // check if there is the most recent memory
  const recentMemory = recentMemoryId ? memories.find(m => m.id === recentMemoryId) : null;

  return (
    <View style={styles.container}>
      {/* Seach Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search memories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.advancedSearchButton}
          onPress={() => navigation.navigate('Search', { 
            preFilteredMemories: filteredMemories 
          })}
        >
          <Feather name="filter" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Listing Memories */}
      <FlatList
        data={filteredMemories}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
              <Text style={styles.emptyText}>
                No memories yet. Create your first one!
              </Text>
          </View>
        )}
      /> 
      
      {/* Recent Memory Button - Only show if we have a valid recent memory*/}
      {recentMemory && (
        <TouchableOpacity
          style={styles.recentMemoryButton}
          onPress={() => {
            navigation.navigate("MemoryDetail", { memory: recentMemory });
          }}
        >
          <Text style={styles.recentMemoryButtonText}>
            Continue where you left off
          </Text>
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 140,  // Changed to minHeight to accommodate longer location text
  },
  imageContainer: {
    width: 140,
    height: 140, // Fixed height for the image
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
    marginTop: 3, // Slightly adjust to align with first line of text
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recentMemoryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8, 
    marginHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  recentMemoryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  headerButton: {
    padding: 10,
    marginRight: 5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  advancedSearchButton: {
    padding: 10,
    marginLeft: 8,
  },
});

export default MemoryListScreen;