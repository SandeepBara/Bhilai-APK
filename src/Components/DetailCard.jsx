import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../Constants/Colors';
import { CopyableTouchableOpacity } from './CopyableControl';
import { uiStyles } from '../style/theme';

function DetailCard({ title, note, data = [] }) {
  const hasData = data && data.length > 0;

  // State to control modal visibility and content
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', info: '' });

  // Function to open the modal with specific content
  const openInfoModal = (label, info) => {
    setModalContent({ title: label, info: info });
    setModalVisible(true);
  };

  return (
    <View style={styles.outerContainer}>
      {/* ... (Heading component remains the same) ... */}
      {title && (
        <View style={styles.headingWrapper}>
          <Text selectable style={styles.headingText}>{title}</Text>
        </View>
      )}

      <View style={styles.card}>
        {note && <Text selectable style={styles.note}>{note}</Text>}

        {!hasData && (
          <Text selectable style={styles.noDataText}>No details available.</Text>
        )}

        {hasData &&
          data.map((item, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.labelContainer}>
                <Text selectable style={styles.label}>{item?.label} :</Text>
                {/* Check for item.info and render the icon */}
                {item.info && (
                  <TouchableOpacity
                    style={styles.infoIcon}
                    onPress={() => openInfoModal(item.label, item.info)}
                  >
                    <MaterialIcons
                      name="info-outline"
                      size={responsiveWidth(4)}
                      color={Colors.primary || '#007AFF'}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Text selectable={true} style={styles.value}>
                {item?.value ? item?.value : 'NA'}
              </Text>
            </View>
          ))}
      </View>

      {/* --- MODAL COMPONENT --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text selectable style={styles.modalTitle}>
              {modalContent.title} Information
            </Text>
            <Text selectable style={styles.modalInfo}>{modalContent.info}</Text>
            <CopyableTouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </CopyableTouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default DetailCard;

// --- STYLES ---

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveHeight(1),
  },

  headingWrapper: {
    ...uiStyles.cardHeader,
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(4),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    elevation: 6,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  headingText: {
    ...uiStyles.cardHeaderText,
    textAlign: 'left',
  },
  card: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingTop: responsiveWidth(4),
    paddingBottom: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(4),
    borderWidth: 1,
    borderColor: Colors.cardBorder || '#f0f0f0',
    borderTopWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 1,
  },
  note: {
    fontSize: responsiveWidth(3.5),
    color: Colors.textMuted || '#777',
    fontStyle: 'italic',
    marginBottom: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(1),
  },
  noDataText: {
    fontSize: responsiveWidth(4),
    color: Colors.textMuted || '#777',
    textAlign: 'center',
    paddingVertical: responsiveHeight(1),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(0.5),
    paddingVertical: responsiveHeight(0.8),
    paddingHorizontal: responsiveWidth(2),
    borderBottomWidth: 1,
    borderBottomColor: Colors.rowDivider || '#eee',
  },

  label: {
    ...uiStyles.label,
    marginVertical: 0,
    minWidth: responsiveWidth(25),
    maxWidth: responsiveWidth(40),
    marginRight: responsiveWidth(2),
  },
  value: {
    ...uiStyles.text,
    flex: 1,
    textAlign: 'left',
    flexWrap: 'wrap',
    paddingRight: responsiveWidth(2),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: responsiveWidth(25),
    maxWidth: responsiveWidth(40),
    marginRight: responsiveWidth(2),
  },
  infoIcon: {
    marginLeft: responsiveWidth(1),
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground || '#fff',
    borderRadius: 12,
    padding: responsiveWidth(6),
    width: '85%',
    maxHeight: '70%',
    elevation: 10,
  },
  modalTitle: {
    ...uiStyles.title,
    marginBottom: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: responsiveHeight(0.5),
  },
  modalInfo: {
    fontSize: responsiveWidth(4),
    color: Colors.textValue || '#333',
    marginVertical: responsiveHeight(1.5),
    lineHeight: responsiveHeight(2.5),
  },
  modalCloseButton: {
    backgroundColor: Colors.primary || '#007AFF',
    borderRadius: 8,
    padding: responsiveHeight(1.5),
    marginTop: responsiveHeight(2),
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: responsiveWidth(4),
  },
});
