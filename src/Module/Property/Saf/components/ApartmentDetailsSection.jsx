import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import { formatDate1 } from '../utils/helpers';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';
import { uiStyles } from '../../../../style/theme';

const ApartmentDetailsSection = ({
  selectedDate,
  setSelectedDate,
  showDatePicker,
  setShowDatePicker,
  apartmentList,
  apartmentDetail,
  setApartmentDetail,
  setApartmentLabel,
  error,
}) => {
  return (
    <View style={styles.card}>
      <View>
        <Text selectable style={[styles.label, error.ownershipType && styles.errorLabel]}>
          Flat Registry Date *
        </Text>
        <CopyableTouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateInput}
        >
          <Text>
            {selectedDate ? formatDate1(selectedDate) : 'Select Date'}
          </Text>
        </CopyableTouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            maximumDate={new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (event.type === 'set' && date) {
                setSelectedDate(
                  new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                );
              }
            }}
          />
        )}

        <Text selectable style={[styles.label, error.ownershipType && styles.errorLabel]}>
          Appartment Datails *
        </Text>
        <Dropdown
          style={[styles.dropdown, error.propertyType && styles.errorInput]}
          data={apartmentList}
          labelField="label"
          valueField="value"
          placeholder="Select Apartment"
          value={apartmentDetail}
          onChange={item => {
            setApartmentDetail(item.value);
            setApartmentLabel(item.label);
          }}
        />
      </View>
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
    marginBottom: 5,
  },
  errorLabel: {
    color: 'red',
  },
  dateInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dropdown: {
    ...uiStyles.input,
    height: 50,
  },
  errorInput: {
    ...uiStyles.inputError,
  },
});

export default ApartmentDetailsSection;
