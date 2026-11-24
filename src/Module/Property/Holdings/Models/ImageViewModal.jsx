import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { styles } from './sharedStyles';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';

export const ImageViewModal = ({
  visible,
  onClose,
  selectedImageUri,
  imageLoading,
  setImageLoading,
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.fullScreenModalContainer}>
      <CopyableTouchableOpacity style={styles.closeFullScreenButton} onPress={onClose}>
        <Text style={styles.closeFullScreenButtonText}>✖ Close</Text>
      </CopyableTouchableOpacity>

      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text selectable style={styles.loadingText}>Loading document...</Text>
        </View>
      )}

      <ScrollView
        style={styles.fullScreenScrollView}
        contentContainerStyle={styles.fullScreenScrollContent}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
      >
        {selectedImageUri ? (
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              Alert.alert('Error', 'Failed to load the document');
            }}
          />
        ) : (
          <Text selectable style={styles.errorText}>No document selected</Text>
        )}
      </ScrollView>
    </View>
  </Modal>
);
