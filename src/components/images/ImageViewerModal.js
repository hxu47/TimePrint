import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  StatusBar,
  Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';

/**
 * A reusable full-screen image viewer modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when the modal is closed
 * @param {Array} props.images - Array of image URIs to display
 * @param {number} props.initialIndex - Initial image index to display
 * @returns {React.Component}
 */
const ImageViewerModal = ({ 
  visible, 
  onClose, 
  images, 
  initialIndex = 0 
}) => {
  // Convert image URIs to the format expected by react-native-image-zoom-viewer
  const imageUrls = images.map(uri => ({ url: uri }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar hidden={visible} />
      <View style={styles.modalContainer}>
        <ImageViewer
          imageUrls={imageUrls}
          index={initialIndex}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          saveToLocalByLongPress={false}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          )}
          renderIndicator={(currentIndex, allSize) => (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>
                {currentIndex} / {allSize}
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 15,
    zIndex: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 999,
  },
  imageIndicatorText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ImageViewerModal;