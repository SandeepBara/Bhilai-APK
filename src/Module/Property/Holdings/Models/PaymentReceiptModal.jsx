import React from 'react';
import { BluetoothReceiptModal } from '../../../../Components/BluetoothReceiptModal';

function getFields(receipt, { money }) {
  const dues = [receipt.previousPaymentReceipt?.totalDue, receipt.currentPaymentReceipt?.totalDue]
    .filter(value => value != null && value !== '' && Number.isFinite(Number(value)));
  return [
    ['Holding No.', receipt.newHoldingNo || receipt.holdingNo],
    ['Name', receipt.ownerName],
    ['Address', receipt.address],
    ['Dues From', receipt.fromFyear],
    ['Dues Upto', receipt.uptoFyear],
    ['Rain Harvest', money(receipt.rwhTax)],
    ['Total Dues', money(dues.length ? dues.reduce((sum, value) => sum + Number(value), 0) : null)],
  ];
}

export function PaymentReceiptModal({ visible, onClose, paymentDtls }) {
  return (
    <BluetoothReceiptModal
      visible={visible}
      onClose={onClose}
      paymentDtls={paymentDtls}
      receiptTitle="Holding Tax Payment Receipt"
      previewTitle="Payment Receipt"
      getFields={getFields}
    />
  );
}
