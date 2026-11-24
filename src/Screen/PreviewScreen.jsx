import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const PreviewScreen = ({ route }) => {
  const { formData } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text selectable style={styles.title}>Preview Data</Text>
      <Text selectable>Ward No: {formData.wardDropdown}</Text>
      <Text selectable>New Ward No: {formData.newWardDropdown}</Text>
      <Text selectable>Zone: {formData.zoneDropdown}</Text>
      <Text selectable>Property Type: {formData.propertyDropdown}</Text>
      {/* Add more fields as needed */}
      <Text selectable style={{ fontWeight: 'bold', marginTop: 10 }}>Floors:</Text>
      {formData.floors && formData.floors.length > 0 ? (
        formData.floors.map((floor, idx) => (
          <View key={idx} style={styles.floorBox}>
            <Text selectable>Floor Name: {floor.name}</Text>
            <Text selectable>Construction Type: {floor.constructionType}</Text>
            <Text selectable>Occupancy Type: {floor.occupancyType}</Text>
            <Text selectable>Usage Type: {floor.usageType}</Text>
            <Text selectable>Date From: {floor.fromDate ? new Date(floor.fromDate).toLocaleDateString() : ''}</Text>
            <Text selectable>Date Upto: {floor.toDate ? new Date(floor.toDate).toLocaleDateString() : ''}</Text>
          </View>
        ))
      ) : (
        <Text selectable>No extra floors added.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 10, alignSelf: 'center' },
  floorBox: { marginBottom: 10, padding: 5, borderWidth: 1, borderColor: '#eee', borderRadius: 5 },
});

export default PreviewScreen; 