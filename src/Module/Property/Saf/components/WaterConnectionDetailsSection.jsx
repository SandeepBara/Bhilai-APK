import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';
import { uiStyles } from '../../../../style/theme';

const WaterConnectionDetailsSection = ({
  waterConnectionNo,
  setWaterConnectionNo,
  waterConnectionDate,
  setWaterConnectionDate,
  showWaterConnectionDatePicker,
  setShowWaterConnectionDatePicker,
  isRessessment = false,
  isMutation = false,
}) => {
  const isDisabled = isRessessment || isMutation;

  return (
    <View style={styles.section}>
      <Text selectable style={styles.label}>Water Connection No</Text>
      <TextInput
        style={styles.input}
        placeholder="con number"
        placeholderTextColor="grey"
        value={waterConnectionNo}
        onChangeText={setWaterConnectionNo}
        editable={!isDisabled}
      />

      <Text selectable style={styles.label}>Water Connection Date</Text>
      <CopyableTouchableOpacity
        style={styles.dateInput}
        onPress={() => !isDisabled && setShowWaterConnectionDatePicker(true)}
      >
        <Text style={{ color: waterConnectionDate ? '#000' : '#999' }}>
          {waterConnectionDate
            ? new Date(waterConnectionDate).toLocaleDateString('en-GB')
            : 'Water Connection Date (DD/MM/YYYY)'}
        </Text>
      </CopyableTouchableOpacity>

      {showWaterConnectionDatePicker && !isDisabled && (
        <DateTimePicker
          value={
            waterConnectionDate ? new Date(waterConnectionDate) : new Date()
          }
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowWaterConnectionDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setWaterConnectionDate(selectedDate.toISOString());
            }
          }}
        />
      )}
    </View>
  );
};

export default WaterConnectionDetailsSection;

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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    justifyContent: 'center',
  },
});
