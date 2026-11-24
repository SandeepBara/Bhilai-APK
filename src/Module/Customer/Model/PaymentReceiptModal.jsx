import React from 'react';
import { BluetoothReceiptModal } from '../../../Components/BluetoothReceiptModal';

export function PaymentReceiptModal({ visible, onClose, receiptData }) {
  return (
    <BluetoothReceiptModal visible={visible} onClose={onClose} paymentDtls={receiptData} kind="water" />
  );
}
