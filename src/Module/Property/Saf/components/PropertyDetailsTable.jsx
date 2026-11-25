import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { uiStyles } from '../../../../style/theme';

const PropertyDetailsTable = ({
  previewData,
  assessmentType,
  selectedPropertyLabel,
}) => {
  return (
    <View style={styles.tableContainer}>
      <Text selectable style={styles.tableTitle}>Property Details</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text selectable style={styles.tableHeaderText}>Field</Text>
          <Text selectable style={styles.tableHeaderText}>Current Value</Text>
          <Text selectable style={styles.tableHeaderText}>Verified Value</Text>
        </View>

        {assessmentType === 'Mutation' && (
          <View style={styles.tableRow}>
            <Text selectable style={styles.tableCellLabel}>
              Percentage of Property Transfer
            </Text>
            <Text selectable style={styles.tableCell}>
              {previewData['Percentage_Transfer'] || 'N/A'}
            </Text>
            <Text selectable style={styles.tableCell}>
              {previewData['Verified_Percentage'] || 'N/A'}
            </Text>
          </View>
        )}

        <View style={styles.tableRow}>
          <Text selectable style={styles.tableCellLabel}>Ward No</Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Ward No'] || 'N/A'}
          </Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Verified_Ward'] || 'N/A'}
          </Text>
        </View>

        <View style={[styles.tableRow, styles.tableRowAlternate]}>
          <Text selectable style={styles.tableCellLabel}>Build-up Area</Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Built-up Area (Current)'] || 'N/A'}
          </Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Verified_BuiltupArea'] || 'N/A'}
          </Text>
        </View>

        <View style={styles.tableRow}>
          <Text selectable style={styles.tableCellLabel}>Zone</Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Zone (Current)'] || 'N/A'}
          </Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Verified_Zone'] || 'N/A'}
          </Text>
        </View>

        <View style={[styles.tableRow, styles.tableRowAlternate]}>
          <Text selectable style={styles.tableCellLabel}>Property Type</Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Property Type (Current)'] || 'N/A'}
          </Text>
          <Text selectable style={styles.tableCell}>
            {previewData['Verified_PropertyType'] || 'N/A'}
          </Text>
        </View>

        {selectedPropertyLabel === 'FLATS / UNIT IN MULTI STORIED BUILDING' && (
          <>
            <View style={styles.tableRow}>
              <Text selectable style={styles.tableCellLabel}>Selected Date</Text>
              <Text selectable style={styles.tableCell}>{previewData.selectedDate}</Text>
              <Text selectable style={styles.tableCell}> </Text>
            </View>

            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <Text selectable style={styles.tableCellLabel}>Apartment Detail</Text>
              <Text selectable style={styles.tableCell}>
                {previewData.apartmentLabel || 'N/A'}
              </Text>
              <Text selectable style={styles.tableCell}> </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  table: {
    backgroundColor: '#fff',
  },
  tableHeader: {
    ...uiStyles.tableHeader,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    ...uiStyles.tableHeaderText,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlternate: {
    ...uiStyles.tableStripe,
  },
  tableCellLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    paddingRight: 5,
  },
  tableCell: {
    ...uiStyles.tableCell,
    flex: 1,
    textAlign: 'center',
  },
});

export default PropertyDetailsTable;
