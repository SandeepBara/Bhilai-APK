import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { uiStyles } from '../../../../style/theme';

const ApplicationInfo = ({ data }) => {
  if (!data) return null;

  return (
    <View style={styles.card}>
      <Text selectable style={styles.label}>
        Your Application No.:{' '}
        <Text style={styles.value}>{data.safNo}</Text>
      </Text>
      <Text selectable style={styles.label}>
        Application Type:{' '}
        <Text style={styles.value}>{data.assessmentType}</Text>
      </Text>
      <Text selectable style={styles.label}>
        Applied Date: <Text style={styles.value}>{data.applyDate}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: responsiveWidth(4),
    margin: responsiveWidth(4),
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginTop: 10,
  },
  label: {
    ...uiStyles.label,
  },
  value: {
    ...uiStyles.text,
    fontWeight: 'bold',
  },
});

export default ApplicationInfo;
