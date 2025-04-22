import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getUserMemories } from '../../firebaseConfig';

import DateRangePicker from '../../components/date/DateRangePicker';
import TagSelector from '../../components/tags/TagSelector';
import LocationSearchInput from '../../components/search/LocationSearchInput';

const SearchScreen = ({ navigation, route }) => {
  // Get pre-filtered memories passed from the memory list screen
  const { preFilteredMemories = [] } = route.params || {};

  // State for search filters
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [locationSearchText, setLocationSearchText] = useState('');

  const fetchAvailableTags = async () => {
    try {
      const memories = await getUserMemories();
      // Extract all tags and remove duplicates
      const allTags = [...new Set(memories.flatMap(memory => memory.tags || []))];
      setAvailableTags(allTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Call this when the component mounts
  useEffect(() => {
    if (preFilteredMemories.length > 0) {
      // Extract all tags from the pre-filtered memories
      const allTags = [...new Set(preFilteredMemories.flatMap(memory => memory.tags || []))];
      setAvailableTags(allTags);
    } else {
      // If no pre-filtered memories, fetch all memories to get tags
      fetchAvailableTags();
    };
  }, [preFilteredMemories]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <View style={{width: 44}} />
      </View>
      
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Filter your memories</Text>
        
        {/* Date Range Selection */}
        <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <DateRangePicker 
            dateRange={dateRange}
            setDateRange={setDateRange}
        />
        </View>
        
        {/* Location Selection */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Location</Text>
          <LocationSearchInput
            searchText={locationSearchText}
            onSearchTextChange={setLocationSearchText}
          />
        </View>
        
        {/* Tags Selection */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <TagSelector
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsSelected={setSelectedTags}
            onFetchTags={fetchAvailableTags}
          />
        </View>
        
        {/* Search Button */}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            // Create filters object from selected filters
            const filters = {
              dateRange: {
                start: dateRange.start,
                end: dateRange.end
              },
              locationText: locationSearchText,
              tags: selectedTags
            };
            // Navigate to results screen with filters and pre-filtered memories
            navigation.navigate('SearchResults', { 
              filters,
              preFilteredMemories
            });
          }}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;