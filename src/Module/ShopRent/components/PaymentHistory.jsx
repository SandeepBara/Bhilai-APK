import React, { useState } from 'react';
import { Text } from 'react-native';
import Button from '../../../Components/AppButton';
import { uiStyles } from '../../../style/theme';
import { Panel, ShopPagination, ShopTable } from './ShopRentUI';

const transactionFields = [
  ['Receipt No.', 'tranNo'], ['Payment Mode', 'paymentMode'], ['Payment Date', 'tranDate'],
  ['From', 'fromDate'], ['Through', 'uptoDate'], ['Demand', 'demandAmt'],
  ['Penalty', 'penaltyAmt'], ['Amount Payable', 'payableAmt'],
];

export default function PaymentHistory({ transactions, onViewReceipt }) {
  const [requestedPage, setPage] = useState(1);
  const pageSize = 5;
  const total = transactions.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * pageSize;
  const columns = [
    ...transactionFields,
    ['Receipt', transaction => transaction.id ? (
      <Button title="View Receipt" onPress={() => onViewReceipt(transaction.id)} />
    ) : <Text selectable style={uiStyles.text}>—</Text>],
  ];

  return (
    <Panel title="Payment History">
      {total ? (
        <>
          <ShopTable columns={columns} rows={transactions.slice(offset, offset + pageSize)} />
          <ShopPagination data={{ lastPage, total }} page={page} setPage={setPage} />
        </>
      ) : <Text selectable style={uiStyles.text}>No payments found.</Text>}
    </Panel>
  );
}
