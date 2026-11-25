import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { uiStyles } from '../../../../style/theme';

// Error Display Component
const ErrorText = ({ error }) => {
  if (!error) return null;
  return <Text selectable style={styles.errorText}>{error}</Text>;
};

const PropertyDetails = ({
  khataNo,
  setKhataNo,
  plotNo,
  setPlotNo,
  villageName,
  setVillageName,
  plotArea,
  setPlotArea,
  roadWidth,
  setRoadWidth,
  showFieldAlert = () => {},
  isEditable,
  errors = {},
  setErrors = () => {},
  khataNoRef,
  plotNoRef,
  villageNameRef,
  plotAreaRef,
  roadWidthRef,
  buildArea,
  setBuildArea,
  counterFieldsOnly = false,
}) => {
  return (
    <View style={styles.section}>
      {!counterFieldsOnly && <Text selectable style={styles.label}>Property Details</Text>}

      {/* Khata No */}
      <Text selectable style={styles.label}>Khata No.{!counterFieldsOnly && ' *'}</Text>
      <TextInput
        ref={khataNoRef}
        style={[styles.input, errors.khataNo && styles.inputError]}
        // placeholder="xxxx xxxx xxxx"
        placeholderTextColor="grey"
        value={khataNo}
        onChangeText={setKhataNo}
        editable={isEditable}
      />
      {errors.khataNo && <Text selectable style={styles.errorText}>{errors.khataNo}</Text>}

      {/* Plot No */}
      <Text selectable style={styles.label}>{counterFieldsOnly ? 'Plot No/Khasra No.' : 'Plot No. *'}</Text>
      <TextInput
        ref={plotNoRef}
        style={[styles.input, errors.plotNo && styles.inputError]}
        // placeholder="ASD12"
        placeholderTextColor="grey"
        value={plotNo}
        onChangeText={setPlotNo}
        editable={isEditable}
      />
      {errors.plotNo && <Text selectable style={styles.errorText}>{errors.plotNo}</Text>}

      {/* Village Name */}
      <Text selectable style={styles.label}>Village/Mauja Name</Text>
      <TextInput
        ref={villageNameRef}
        style={[styles.input, errors.villageName && styles.inputError]}
        placeholder="village"
        // placeholderTextColor="grey"
        value={villageName}
        onChangeText={setVillageName}
        editable={isEditable}
      />
      {errors.villageName && (
        <Text selectable style={styles.errorText}>{errors.villageName}</Text>
      )}

      {/* Plot Area */}
      <Text selectable style={styles.label}>Area of Plot (in Decimal) *</Text>
      <TextInput
        ref={plotAreaRef}
        style={[styles.input, errors.plotArea && styles.inputError]}
        placeholder="100.00"
        placeholderTextColor="grey"
        value={plotArea}
        onChangeText={setPlotArea}
        keyboardType="numeric"
        editable={isEditable}
      />
      {errors.plotArea && (
        <Text selectable style={styles.errorText}>{errors.plotArea}</Text>
      )}

      {!counterFieldsOnly && (
        <>
          {/* Built-up Area */}
          <Text selectable style={styles.label}>Built-up Area *</Text>
          <TextInput
            ref={plotAreaRef}
            style={[styles.input, errors.buildArea && styles.inputError]}
            placeholder="100.00"
            placeholderTextColor="grey"
            value={buildArea}
            onChangeText={setBuildArea}
            keyboardType="numeric"
            editable={isEditable}
          />
          {errors.buildArea && (
            <Text selectable style={styles.errorText}>{errors.buildArea}</Text>
          )}

          {/* Road Width */}
          <Text selectable style={styles.label}>Road Width (in ft) *</Text>
          <TextInput
            ref={roadWidthRef}
            style={[styles.input, errors.roadWidth && styles.inputError]}
            placeholder="Road Width"
            placeholderTextColor="grey"
            value={roadWidth}
            onChangeText={setRoadWidth}
            keyboardType="numeric"
            editable={isEditable}
          />
          {errors.roadWidth && (
            <Text selectable style={styles.errorText}>{errors.roadWidth}</Text>
          )}

          <Text selectable style={styles.label}>
            In Case of No Road Enter "0" (For Vacant Land Only)
          </Text>
          <ErrorText error={errors.noRoad} />
        </>
      )}
    </View>
  );
};

export default PropertyDetails;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  label: {
    ...uiStyles.label,
    marginBottom: 5,
  },
  input: {
    ...uiStyles.input,
    paddingVertical: 10,
    marginBottom: 12,
  },
  inputError: {
    ...uiStyles.inputError,
    borderWidth: 1.5,
  },
  errorText: {
    ...uiStyles.errorText,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '400',
  },
});
