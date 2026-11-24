import React from 'react';
import { BluetoothReceiptModal } from '../../../../Components/BluetoothReceiptModal';

function getFields(receipt, { money, date }) {
  return [
    ['Consumer No.', receipt.consumerNo ?? receipt.consumer_no],
    ['Holding No.', receipt.newHoldingNo],
    ['Name', receipt.ownerName],
    ['Address', receipt.address],
    ['Dues From', receipt.periodFrom || date(receipt.fromDate)],
    ['Dues Upto', receipt.periodUpto || date(receipt.uptoDate)],
    ['Water Charges', money(receipt.demandAmount)],
    ['Penalty', money(receipt.penaltyAmt)],
    ['Balance Due', money(receipt.dueAmount)],
  ];
}

export function PaymentReceiptModal({ visible, onClose, receiptData }) {
  return (
    <BluetoothReceiptModal
      visible={visible}
      onClose={onClose}
      paymentDtls={receiptData}
      receiptTitle="Water Charge Payment Receipt"
      previewTitle="Water Payment Receipt"
      getFields={getFields}
    />
  );
}
