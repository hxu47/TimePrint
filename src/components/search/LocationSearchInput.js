import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const LocationSearchInput = ({ 
  searchText, 
  onSearchTextChange,
  containerStyle
}) => {
  const clearSearch = () => {
    onSearchTextChange('');
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Feather name="map-pin" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Enter location name..."
          value={searchText}
          onChangeText={onSearchTextChange}
          returnKeyType="done"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  }
});

export default LocationSearchInput;