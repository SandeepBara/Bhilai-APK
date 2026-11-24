import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { styles } from './sharedStyles';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';

export const DocumentModal = ({
  visible,
  onClose,
  uploadedDocs,
  onDocumentPress,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.docModalContainer}>
      <View style={styles.docModalContent}>
        <Text selectable style={styles.docModalTitle}>📑 Document View</Text>

        <View style={styles.docTableHeader}>
          <Text selectable style={styles.docCellHeader}>#</Text>
          <Text selectable style={styles.docCellHeader}>Document Name</Text>
          <Text selectable style={styles.docCellHeader}>File</Text>
          <Text selectable style={styles.docCellHeader}>Status</Text>
        </View>

        <ScrollView>
          {uploadedDocs?.map((doc, index) => (
            <View key={doc.id} style={styles.docTableRow}>
              <Text selectable style={styles.docCell}>{index + 1}</Text>
              <Text selectable style={styles.docCell}>{doc.docName}</Text>
              <CopyableTouchableOpacity onPress={() => onDocumentPress(doc)}>
                <Text style={[styles.docCell, styles.docFileLink]}>
                  View File
                </Text>
              </CopyableTouchableOpacity>
              <Text selectable style={styles.docCell}>
                {doc.verifiedStatus === 1 ? 'Pending' : 'Verified'}
              </Text>
            </View>
          ))}
        </ScrollView>

        <CopyableTouchableOpacity style={styles.docCloseButton} onPress={onClose}>
          <Text style={styles.docCloseButtonText}>Close</Text>
        </CopyableTouchableOpacity>
      </View>
    </View>
  </Modal>
);
