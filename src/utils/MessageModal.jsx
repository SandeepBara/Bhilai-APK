import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CopyableTouchableOpacity } from '../Components/CopyableControl';
import { uiStyles } from '../style/theme';

const MessageModal = ({ visible, type, message, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            type === 'success' ? styles.success : styles.error,
          ]}
        >
          <Text selectable style={styles.title}>
            {type === 'success' ? 'Success' : 'Error'}
          </Text>
          <Text selectable style={styles.message}>{message}</Text>
          <CopyableTouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={[styles.buttonText, uiStyles.primaryButtonText]}>OK</Text>
          </CopyableTouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
  },
  error: {
    backgroundColor: '#ffffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  button: {
    ...uiStyles.primaryButton,
  },
  buttonText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
});

export default MessageModal;
