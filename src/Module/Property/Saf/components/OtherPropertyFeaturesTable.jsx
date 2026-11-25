import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDate } from '../utils/helpers';
import { uiStyles } from '../../../../style/theme';

const OtherPropertyFeaturesTable = ({
  mobileTower,
  towerArea,
  installationDate,
  hoarding,
  hoardingArea,
  hoardingInstallationDate,
  petrolPump,
  pumpArea,
  pumpInstallationDate,
  rainHarvesting,
  completionDate,
  selectedPropertyLabel,
}) => {
  return (
    <View style={styles.tableContainer}>
      <Text selectable style={styles.tableTitle}>Other Property Features</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text selectable style={styles.tableHeaderText}>Field</Text>
          <Text selectable style={styles.tableHeaderText}>Value</Text>
        </View>

        {/* Mobile Tower */}
        <View style={styles.tableRow}>
          <Text selectable style={styles.tableCellLabel}>Mobile Tower</Text>
          <Text selectable style={styles.tableCell}>{mobileTower || 'N/A'}</Text>
        </View>
        {mobileTower === 'yes' && (
          <>
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <Text selectable style={styles.tableCellLabel}>Tower Area</Text>
              <Text selectable style={styles.tableCell}>{towerArea || 'N/A'}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text selectable style={styles.tableCellLabel}>Installation Date</Text>
              <Text selectable style={styles.tableCell}>
                {installationDate ? formatDate(installationDate) : 'N/A'}
              </Text>
            </View>
          </>
        )}

        {/* Hoarding */}
        <View style={[styles.tableRow, styles.tableRowAlternate]}>
          <Text selectable style={styles.tableCellLabel}>Hoarding</Text>
          <Text selectable style={styles.tableCell}>{hoarding || 'N/A'}</Text>
        </View>
        {hoarding === 'yes' && (
          <>
            <View style={styles.tableRow}>
              <Text selectable style={styles.tableCellLabel}>Hoarding Area</Text>
              <Text selectable style={styles.tableCell}>{hoardingArea || 'N/A'}</Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <Text selectable style={styles.tableCellLabel}>Installation Date</Text>
              <Text selectable style={styles.tableCell}>
                {hoardingInstallationDate ? formatDate(hoardingInstallationDate) : 'N/A'}
              </Text>
            </View>
          </>
        )}

        {selectedPropertyLabel !== 'VACANT LAND' && (
          <>
            <View style={styles.tableRow}>
              <Text selectable style={styles.tableCellLabel}>Petrol Pump</Text>
              <Text selectable style={styles.tableCell}>{petrolPump || 'N/A'}</Text>
            </View>
            {petrolPump === 'yes' && (
              <>
                <View style={[styles.tableRow, styles.tableRowAlternate]}>
                  <Text selectable style={styles.tableCellLabel}>Pump Area</Text>
                  <Text selectable style={styles.tableCell}>{pumpArea || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text selectable style={styles.tableCellLabel}>Installation Date</Text>
                  <Text selectable style={styles.tableCell}>
                    {pumpInstallationDate ? formatDate(pumpInstallationDate) : 'N/A'}
                  </Text>
                </View>
              </>
            )}

            {/* Rainwater Harvesting */}
            <View style={[styles.tableRow, styles.tableRowAlternate]}>
              <Text selectable style={styles.tableCellLabel}>Rainwater Harvesting</Text>
              <Text selectable style={styles.tableCell}>{rainHarvesting || 'N/A'}</Text>
            </View>
            {rainHarvesting === 'yes' && (
              <View style={styles.tableRow}>
                <Text selectable style={styles.tableCellLabel}>Completion Date</Text>
                <Text selectable style={styles.tableCell}>
                  {completionDate
                    ? new Date(completionDate).toISOString().split('T')[0]
                    : 'N/A'}
                </Text>
              </View>
            )}
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

export default OtherPropertyFeaturesTable;
