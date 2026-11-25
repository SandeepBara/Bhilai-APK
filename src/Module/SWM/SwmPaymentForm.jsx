import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '../../Components/AppButton';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { uiStyles } from '../../style/theme';

const types = [
  { label: 'Full', value: 'FULL' },
  { label: 'Partial', value: 'PART' },
];
const modes = [
  { label: 'Cash', value: 'CASH' }, { label: 'Cheque', value: 'CHEQUE' },
  { label: 'DD', value: 'DD' }, { label: 'NEFT', value: 'NEFT' },
  { label: 'RTGS', value: 'RTGS' },
];
const localDate = date => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export function SwmPaymentForm({ payable, saving, onCancel, onSubmit }) {
  const [form, setForm] = useState({ paymentType: 'FULL', paymentMode: '', amount: '' });
  const [showDate, setShowDate] = useState(false);
  const nonCash = Boolean(form.paymentMode && form.paymentMode !== 'CASH');
  const partial = form.paymentType === 'PART';
  const update = (key, value) => setForm(previous => ({ ...previous, [key]: value }));

  const confirm = () => {
    if (!form.paymentMode) {
      Alert.alert('Payment Mode', 'Select a payment mode.');
      return;
    }
    const amount = partial ? Number(form.amount) : payable;
    if (!Number.isFinite(amount) || amount < 0.01 || amount > payable) {
      Alert.alert('Invalid Amount', 'The payment amount must be between Rs. 0.01 and Rs. ' + payable.toFixed(2) + '.');
      return;
    }
    const chequeNo = form.chequeNo?.trim();
    const bankName = form.bankName?.trim();
    const branchName = form.branchName?.trim();
    if (nonCash && (!chequeNo || !form.chequeDate || !bankName || !branchName)) {
      Alert.alert('Payment Details', 'Enter the reference number, date, bank name, and branch name.');
      return;
    }

    const payment = {
      paymentType: form.paymentType,
      paymentMode: form.paymentMode,
      amount,
      ...(nonCash && { chequeNo, chequeDate: localDate(form.chequeDate), bankName, branchName }),
    };
    Alert.alert('Confirm Payment', 'Amount to collect: Rs. ' + amount.toFixed(2), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Proceed', onPress: () => onSubmit(payment) },
    ]);
  };

  return (
    <View style={styles.form}>
      <Text selectable style={styles.label}>Payment Type</Text>
      <Dropdown accessibilityLabel="Payment Type" style={styles.input} data={types}
        labelField="label" valueField="value" value={form.paymentType}
        disable={saving} onChange={item => update('paymentType', item.value)} />
      <Text selectable style={styles.label}>Payment Mode</Text>
      <Dropdown accessibilityLabel="Payment Mode" style={styles.input} data={modes}
        labelField="label" valueField="value" value={form.paymentMode} placeholder="Select Mode"
        disable={saving} onChange={item => update('paymentMode', item.value)} />
      <Text selectable style={styles.label}>Amount</Text>
      <TextInput accessibilityLabel="Amount" style={[styles.input, !partial && styles.readOnly]}
        keyboardType="decimal-pad" editable={partial && !saving}
        value={partial ? form.amount : payable.toFixed(2)} onChangeText={value => update('amount', value)} />
      {nonCash && (
        <>
          <Text selectable style={styles.label}>Cheque/DD/Reference No.</Text>
          <TextInput accessibilityLabel="Cheque/DD/Reference No." style={styles.input} editable={!saving}
            value={form.chequeNo ?? ''} onChangeText={value => update('chequeNo', value)} />
          <Button title={form.chequeDate ? localDate(form.chequeDate) : 'Select Cheque/DD Date'}
            disabled={saving} onPress={() => setShowDate(true)} />
          {showDate && (
            <DateTimePicker mode="date" value={form.chequeDate ?? new Date()}
              onChange={(_, date) => {
                setShowDate(false);
                if (date) update('chequeDate', date);
              }} />
          )}
          <Text selectable style={styles.label}>Bank Name</Text>
          <TextInput accessibilityLabel="Bank Name" style={styles.input} editable={!saving}
            value={form.bankName ?? ''} onChangeText={value => update('bankName', value)} />
          <Text selectable style={styles.label}>Branch Name</Text>
          <TextInput accessibilityLabel="Branch Name" style={styles.input} editable={!saving}
            value={form.branchName ?? ''} onChangeText={value => update('branchName', value)} />
        </>
      )}
      <View style={styles.actions}>
        <Button title="Cancel" disabled={saving} onPress={onCancel} />
        <Button title={saving ? 'Processing…' : 'Proceed'} disabled={saving} onPress={confirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 8 },
  label: {
    ...uiStyles.label,
  },
  input: {
    ...uiStyles.input,
  },
  readOnly: { backgroundColor: '#f1f5f9' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
});
