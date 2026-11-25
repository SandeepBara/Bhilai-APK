import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { WATER_CONSUMER_PAY_DUE_API } from '../../../../api/apiRoutes';
import { getToken } from '../../../../utils/auth';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';
import { uiStyles } from '../../../../style/theme';

const paymentTypes = [
  { label: 'Full Payment', value: 'FULL' },
  { label: 'Partial Payment', value: 'PART' },
];
const paymentModes = [
  { label: 'Cash', value: 'CASH' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
];

export function PaymentForm({ id, payableAmount, submitting, onSubmittingChange, onCancel, onSuccess }) {
  const [paymentType, setPaymentType] = useState('FULL');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [amount, setAmount] = useState(String(payableAmount ?? ''));
  const inFlight = useRef(false);

  const submit = async () => {
    if (inFlight.current) return;
    const paymentAmount = Number(amount.trim());
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid payment amount.');
      return;
    }

    inFlight.current = true;
    onSubmittingChange(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Please sign in again.');
      const { data } = await axios.post(WATER_CONSUMER_PAY_DUE_API, {
        id, paymentType, paymentMode, amount: paymentAmount,
      }, { headers: { Authorization: 'Bearer ' + token } });
      if (data?.status !== true) throw new Error(data?.message || 'Please try again.');

      onSuccess(data.data?.tranId);
      Alert.alert('Success', data.message || 'Payment successful.');
    } catch (error) {
      Alert.alert('Payment failed', error.response?.data?.message || error.message);
    } finally {
      inFlight.current = false;
      onSubmittingChange(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text selectable accessibilityRole="header" style={styles.title}>Process Payment</Text>
      <Text selectable style={styles.label}>Payment Type</Text>
      <Dropdown accessibilityLabel="Payment Type" style={styles.input} data={paymentTypes}
        labelField="label" valueField="value" value={paymentType} disable={submitting}
        onChange={item => setPaymentType(item.value)} />
      <Text selectable style={styles.label}>Payment Mode</Text>
      <Dropdown accessibilityLabel="Payment Mode" style={styles.input} data={paymentModes}
        labelField="label" valueField="value" value={paymentMode} disable={submitting}
        onChange={item => setPaymentMode(item.value)} />
      <Text selectable style={styles.label}>Amount</Text>
      <TextInput accessibilityLabel="Amount" style={styles.input} keyboardType="decimal-pad"
        value={amount} onChangeText={setAmount} editable={!submitting} />
      <View style={styles.actions}>
        <CopyableTouchableOpacity accessibilityRole="button" disabled={submitting}
          onPress={onCancel} style={styles.cancel}>
          <Text>Cancel</Text>
        </CopyableTouchableOpacity>
        <CopyableTouchableOpacity accessibilityRole="button"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          disabled={submitting} onPress={submit} style={styles.submit}>
          <Text style={styles.submitLabel}>{submitting ? 'Processing…' : 'Proceed'}</Text>
        </CopyableTouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 8, padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: '#10263a' },
  label: {
    ...uiStyles.label,
  },
  input: {
    ...uiStyles.input,
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cancel: { backgroundColor: '#e2e8f0', borderRadius: 6, padding: 12 },
  submit: { backgroundColor: '#14532d', borderRadius: 6, padding: 12 },
  submitLabel: { color: '#fff', fontWeight: '700' },
});
