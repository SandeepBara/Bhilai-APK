// LeftSidebar.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CopyableTouchableOpacity } from '../Components/CopyableControl';

const LeftSidebar = () => {
  const [screen, setScreen] = useState('Dashboard');
  const [showModal, setShowModal] = useState(false);

  const renderScreen = () => {
    switch (screen) {
      case 'Dashboard':
        return <Text selectable style={styles.contentText}>📊 Dashboard Screen</Text>;
      case 'Profile':
        return <Text selectable style={styles.contentText}>👤 Profile Screen</Text>;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    console.log('User logged out');
    setShowModal(false);
    // Add logout logic here
  };

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        <CopyableTouchableOpacity
          style={styles.menuItem}
          onPress={() => setScreen('Dashboard')}
        >
          <Icon name="dashboard" size={24} color="#000" />
          <Text style={styles.menuText}>Dashboard</Text>
        </CopyableTouchableOpacity>

        <CopyableTouchableOpacity
          style={styles.menuItem}
          onPress={() => setScreen('Profile')}
        >
          <Icon name="person" size={24} color="#000" />
          <Text style={styles.menuText}>Profile</Text>
        </CopyableTouchableOpacity>

        <View style={styles.spacer} />

        <CopyableTouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowModal(true)}
        >
          <Icon name="logout" size={24} color="#000" />
          <Text style={styles.menuText}>Logout</Text>
        </CopyableTouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Logout Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text selectable style={styles.modalTitle}>Confirm Logout?</Text>
            <View style={styles.modalActions}>
              <CopyableTouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                <Text>Cancel</Text>
              </CopyableTouchableOpacity>
              <CopyableTouchableOpacity
                onPress={handleLogout}
                style={styles.confirmButton}
              >
                <Text style={{ color: 'white' }}>Logout</Text>
              </CopyableTouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LeftSidebar;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 120,
    backgroundColor: '#f4f4f4',
    paddingTop: 50,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  menuItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  menuText: {
    fontSize: 12,
    marginTop: 5,
  },
  spacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cancelButton: {
    padding: 10,
  },
  confirmButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
  },
});
