import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { uiStyles } from '../../../../style/theme';

const ElectricityDetailsSection = ({
  kno,
  setKno,
  accNo,
  setAccNo,
  bindBookNo,
  setBindBookNo,
  electricityCategory,
  setElectricityCategory,
  selectelectcate,
  errors = {}, // 👈 new
  isRessessment = false,
  isMutation = false,
}) => {
  const isDisabled = isRessessment || isMutation;

  return (
    <View style={styles.container}>
      {/* Electricity K. No */}
      <Text selectable style={styles.label}>Electricity K. No *</Text>
      <TextInput
        style={[
          styles.input,
          errors.kno && styles.inputError, // highlight error
        ]}
        placeholder="xxxx xxxx xxxx"
        placeholderTextColor="grey"
        keyboardType="numeric"
        maxLength={14}
        value={kno}
        onChangeText={setKno}
        editable={!isDisabled}
      />
      {errors.kno && <Text selectable style={styles.errorText}>{errors.kno}</Text>}

      {/* ACC No */}
      <Text selectable style={styles.label}>ACC No *</Text>
      <TextInput
        style={[styles.input, errors.accNo && styles.inputError]}
        placeholder="xxxx xxxx xxxx"
        placeholderTextColor="grey"
        keyboardType="numeric"
        value={accNo}
        onChangeText={setAccNo}
        editable={!isDisabled}
      />
      {errors.accNo && <Text selectable style={styles.errorText}>{errors.accNo}</Text>}

      {/* BIND/BOOK No */}
      <Text selectable style={styles.label}>BIND/BOOK No</Text>
      <TextInput
        style={[styles.input, errors.bindBookNo && styles.inputError]}
        placeholder="xxxx xxxx xxxx"
        placeholderTextColor="grey"
        value={bindBookNo}
        onChangeText={setBindBookNo}
        editable={!isDisabled}
      />
      {errors.bindBookNo && (
        <Text selectable style={styles.errorText}>{errors.bindBookNo}</Text>
      )}

      {/* Electricity Category */}
      <Text selectable style={styles.label}>Electricity Category *</Text>
      <Dropdown
        style={[
          styles.dropdown,
          errors.electricityCategory && styles.inputError,
        ]}
        data={selectelectcate}
        labelField="label"
        valueField="value"
        value={electricityCategory}
        onChange={item => setElectricityCategory(item.value)}
        disabled={isDisabled}
      />
      {errors.electricityCategory && (
        <Text selectable style={styles.errorText}>{errors.electricityCategory}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    ...uiStyles.label,
    marginBottom: 5,
  },
  input: {
    ...uiStyles.input,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dropdown: {
    ...uiStyles.input,
    height: 45,
    marginBottom: 8,
    justifyContent: 'center',
  },
  inputError: {
    ...uiStyles.inputError,
  },
  errorText: {
    ...uiStyles.errorText,
    marginBottom: 8,
  },
});

export default ElectricityDetailsSection;
