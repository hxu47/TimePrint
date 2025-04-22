import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const TagSelector = ({ 
  availableTags = [], 
  selectedTags = [], 
  onTagsSelected,
  onFetchTags, // optional function to fetch tags if needed
  containerStyle
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localSelectedTags, setLocalSelectedTags] = useState(selectedTags);
  
  // Initialize with provided tags
  useEffect(() => {
    setLocalSelectedTags(selectedTags);
  }, [selectedTags]);
  
  // Fetch tags if needed when modal opens
  useEffect(() => {
    if (isModalVisible && onFetchTags) {
      onFetchTags();
    }
  }, [isModalVisible, onFetchTags]);
  
  const handleOpenModal = () => {
    setIsModalVisible(true);
  };
  
  const toggleTag = (tag) => {
    if (localSelectedTags.includes(tag)) {
      setLocalSelectedTags(localSelectedTags.filter(t => t !== tag));
    } else {
      setLocalSelectedTags([...localSelectedTags, tag]);
    }
  };
  
  const clearTags = () => {
    setLocalSelectedTags([]);
  };
  
  const handleDone = () => {
    // Save changes and close modal
    onTagsSelected(localSelectedTags);
    setIsModalVisible(false);
  };
  
  const handleCancel = () => {
    // Discard changes and restore original selection
    setLocalSelectedTags(selectedTags);
    setIsModalVisible(false);
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={handleOpenModal}
      >
        <Text style={styles.selectorButtonText}>
          {localSelectedTags.length > 0 
            ? `${localSelectedTags.length} tags selected` 
            : 'Select tags'}
        </Text>
      </TouchableOpacity>
      
      {localSelectedTags.length > 0 && (
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.selectedTagsContainer}
          >
            {localSelectedTags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagChipText}>#{tag}</Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearTags}
          >
            <Text style={styles.clearButtonText}>Clear tags</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Tag Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Tags</Text>
              <TouchableOpacity onPress={handleDone}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tagsList}>
              {availableTags.length > 0 ? (
                availableTags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.tagItem,
                      localSelectedTags.includes(tag) && styles.tagItemSelected
                    ]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.tagItemText,
                      localSelectedTags.includes(tag) && styles.tagItemTextSelected
                    ]}>
                      #{tag}
                    </Text>
                    {localSelectedTags.includes(tag) && (
                      <Feather name="check" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTagsText}>No tags available</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectorButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 4,
  },
  tagChip: {
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  tagChipText: {
    color: '#0277bd',
    fontSize: 14,
  },
  clearButton: {
    marginTop: 8,
    padding: 8,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  doneText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  tagsList: {
    maxHeight: 300,
  },
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tagItemSelected: {
    backgroundColor: '#007AFF',
  },
  tagItemText: {
    fontSize: 16,
    color: '#333',
  },
  tagItemTextSelected: {
    color: '#fff',
  },
  noTagsText: {
    padding: 20,
    textAlign: 'center',
    color: '#999',
  },
});

export default TagSelector;