// Components/images/SwipeableGallery.js
import React, { useState, useRef } from 'react';
import { ScrollView, View, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * A swipeable image gallery with pagination indicators
 * 
 * @param {Object} props - Component props
 * @param {Array} props.images - Array of image URIs to display
 * @param {Function} props.onImagePress - Function called when an image is pressed, receives index
 * @param {number} props.height - Height of the gallery (default: 250)
 * @returns {React.Component}
 */
const SwipeableGallery = ({ 
  images = [], 
  onImagePress, 
  height = 250 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const windowWidth = Dimensions.get('window').width;
  
  return (
    <View style={[styles.container, { height }]}>
      {images && images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          ref={scrollViewRef}
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const newIndex = Math.round(contentOffsetX / windowWidth);
            if (newIndex !== currentImageIndex) {
              setCurrentImageIndex(newIndex);
            }
          }}
          scrollEventThrottle={16}
        >
          {images.map((imageUri, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => onImagePress && onImagePress(index)}
            >
              <Image 
                source={{ uri: imageUri }} 
                style={[styles.image, { width: windowWidth, height }]} 
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.placeholderImage, { height }]}>
          <Feather name="image" size={50} color="#ccc" />
        </View>
      )}
      
      {/* Page Indicator Dots */}
      {images && images.length > 1 ? (
        <View style={styles.paginationDots}>
          {images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%', 
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
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
  }
});

export default SwipeableGallery;