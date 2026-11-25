import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  responsiveHeight as rh,
  responsiveWidth as rw,
  responsiveFontSize as rf,
} from 'react-native-responsive-dimensions';
import Colors from '../Module/Constants/Colors';
import { CopyableTouchableOpacity } from './CopyableControl';
import { uiStyles } from '../style/theme';
const Card = ({
  applicationNo,
  wardNo,
  firmType,
  ownerName,
  applyDate,
  address,
  natureOfBusiness,
  onPress,
}) => {
  // Handle both array and string formats for Nature of Business
  let natureOfBusinessDisplay = natureOfBusiness;
  if (Array.isArray(natureOfBusinessDisplay)) {
    natureOfBusinessDisplay = natureOfBusinessDisplay.join(', ');
  }

  return (
    <View style={styles.card}>
      <Row label="Application No.:" value={applicationNo} />
      <Row label="Ward No.:" value={wardNo} />
      <Row label="Firm Type:" value={firmType} />
      <Row label="Owner Name:" value={ownerName} />
      <Row label="Guardian Name:" value={applyDate} />
      <Row label="Address:" value={address} />
      {natureOfBusinessDisplay && (
        <Row label="Nature of Business:" value={natureOfBusinessDisplay} />
      )}

      <CopyableTouchableOpacity onPress={onPress} style={styles.button}>
        <Text style={[styles.buttonText, uiStyles.primaryButtonText]}>View</Text>
      </CopyableTouchableOpacity>
    </View>
  );
};

// Reusable row component for label + value
const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text selectable style={styles.label}>{label}</Text>
    <Text selectable style={styles.value}>{value}</Text>
  </View>
);

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: rh(1),
    borderRadius: 8,
    elevation: 3,
    padding: rh(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: rh(1),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: rh(0.5),
  },
  label: {
    ...uiStyles.label,
    width: '45%',
  },
  value: {
    ...uiStyles.text,
    width: '50%',
    textAlign: 'right',
  },
  button: {
    ...uiStyles.primaryButton,
    marginTop: rh(2),
  },
  buttonText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
});
