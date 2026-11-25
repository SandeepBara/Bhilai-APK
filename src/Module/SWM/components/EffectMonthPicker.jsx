import React, { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../../Components/AppButton';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';
import { month } from '../swmConsumerForm';
import { styles } from '../swmFormStyles';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EffectMonthPicker({ value, onSelect, onClose }) {
  const current = month(new Date());
  const currentYear = Number(current.slice(0, 4));
  const [year, setYear] = useState(() => Number((value || current).slice(0, 4)));
  const yearText = String(year).padStart(4, '0');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.monthOverlay}>
        <View style={styles.monthDialog}>
          <Text selectable accessibilityRole="header" style={styles.title}>Date of Effect</Text>
          <View style={styles.monthYearBar}>
            <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel="Previous year"
              disabled={year <= 1} onPress={() => setYear(previous => previous - 1)} style={styles.monthArrow}>
              <Icon name="chevron-left" size={24} color={year <= 1 ? '#94a3b8' : '#173a7b'} />
            </CopyableTouchableOpacity>
            <Text selectable accessibilityLiveRegion="polite" style={styles.monthYear}>{yearText}</Text>
            <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel="Next year"
              disabled={year >= currentYear} onPress={() => setYear(previous => previous + 1)} style={styles.monthArrow}>
              <Icon name="chevron-right" size={24} color={year >= currentYear ? '#94a3b8' : '#173a7b'} />
            </CopyableTouchableOpacity>
          </View>
          <View style={styles.monthGrid}>
            {monthLabels.map((label, index) => {
              const selectedMonth = yearText + '-' + String(index + 1).padStart(2, '0');
              const selected = selectedMonth === value;
              const disabled = selectedMonth > current;
              return (
                <View key={label} style={styles.monthCell}>
                  <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel={label + ' ' + yearText}
                    accessibilityState={{ disabled, selected }} disabled={disabled}
                    onPress={() => onSelect(selectedMonth)}
                    style={[styles.monthButton, selected && styles.monthButtonSelected, disabled && styles.monthButtonDisabled]}>
                    <Text style={[styles.monthText, selected && styles.monthTextSelected]}>{label}</Text>
                  </CopyableTouchableOpacity>
                </View>
              );
            })}
          </View>
          <Button title="Cancel" onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
