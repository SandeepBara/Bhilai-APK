import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import Button from '../../../Components/AppButton';
import { BluetoothReceiptModal } from '../../../Components/BluetoothReceiptModal';
import { SWM_DETAILS_API, SWM_GENERATE_DEMAND_API, SWM_PAYMENT_RECEIPT_API } from '../../../api/apiRoutes';
import DemandModal from '../components/DemandModal';
import { SwmTable, PaginatedSwmTable } from '../components/SwmTable';
import { Card, Fields, Page } from '../components/SwmUI';
import { message, request, rows, useData } from '../swmRequests';
import { styles } from '../swmStyles';

const flag = value => [true, 1, '1', 'true'].includes(value);

const receiptFields = (receipt, { money, date }) => [
  ['Consumer No.', receipt.consumerNo ?? receipt.consumer_no],
  ['Holding No.', receipt.holdingNo ?? receipt.holding_no],
  ['Name', receipt.ownerName], ['Address', receipt.address],
  ['Dues From', date(receipt.fromDate)], ['Dues Upto', date(receipt.uptoDate)],
  ['Waste Charges', money(receipt.monthlyDemandAmount)], ['Balance Due', money(receipt.dueAmount)],
];

export default function SwmConsumerDetails({ route, navigation }) {
  const id = route.params?.id;
  const [revision, setRevision] = useState(0);
  const [mode, setMode] = useState(null);
  const [receiptId, setReceiptId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const generationInFlight = useRef(false);
  const [query] = useState(() => ({ id }));
  const result = useData(SWM_DETAILS_API, query, revision);
  const [receiptQuery, setReceiptQuery] = useState(undefined);
  const receipt = useData(SWM_PAYMENT_RECEIPT_API, receiptQuery);
  const record = result?.data;
  const permissions = record?.userPermission;
  const locked = flag(record?.lockStatus);
  const canPay = flag(permissions?.canTakePayment) && !locked;
  const canGenerate = flag(permissions?.canGenerateDemand) && !locked;
  const refresh = () => setRevision(value => value + 1);
  const openReceipt = transactionId => {
    if (transactionId == null) return;
    setReceiptId(transactionId);
    setReceiptQuery({ id: transactionId });
  };
  const closeReceipt = () => {
    setReceiptId(null);
    setReceiptQuery(undefined);
  };

  async function generate() {
    if (!canGenerate || generationInFlight.current) return;
    generationInFlight.current = true;
    setGenerating(true);
    try {
      await request(SWM_GENERATE_DEMAND_API, { id });
      refresh();
      Alert.alert('Demand generated');
    } catch (error) {
      Alert.alert('Could not generate demand', message(error));
    } finally {
      generationInFlight.current = false;
      setGenerating(false);
    }
  }

  return (
    <Page>
      {!result && <ActivityIndicator accessibilityLabel="Loading SWM details" />}
      {result?.error ? (
        <Card title="SWM Consumer Details">
          <Text selectable accessibilityRole="alert">{result.error}</Text>
          <Button title="Retry" onPress={refresh} />
        </Card>
      ) : null}
      {record && (
        <>
          <Card title="SWM Consumer Details">
            <Fields fields={[
              ['Consumer No.', record.consumerNo], ['RFID No.', record.rfId], ['Ward No.', record.wardNo],
              ['Holding No.', record.holdingNo, record.propertyDetailId ? () =>
                navigation.push('HoldingDetails', { id: record.propertyDetailId }) : undefined],
              ['House/Flat No.', record.houseNo], ['Address', record.address],
              ['Landmark', record.landmark], ['Pin Code', record.pinCode], ['Police Station', record.ps],
              ['Street Name', record.streetName], ['Locality', record.locality], ['Apply Date', record.applyDate],
              ...(record.appStatus ? [['Status', record.appStatus]] : []),
            ]} />
          </Card>
          <Card title="Owner Details">
            <SwmTable
              columns={[[ 'SL', 45 ], [ 'Owner', 140 ], [ 'Guardian', 140 ], [ 'Mobile', 120 ], [ 'Email', 180 ], [ 'DOB', 105 ]]}
              data={rows(record.owners)}
              getCells={(owner, number) => [
                number, owner.ownerName, owner.guardianName, owner.mobileNo, owner.email, owner.dob,
              ]}
            />
          </Card>
          <Card title="Payment Details">
            <PaginatedSwmTable
              columns={[
                ['SL', 45], ['Transaction No.', 165], ['Payment Mode', 110], ['Date', 105],
                ['Demand From', 110], ['Demand Upto', 110], ['Demand Amount Without Penalty', 150],
                ['Paid Demand', 105], ['Paid Penalty', 105], ['Total Paid Amount', 125],
                ['Balance Amount', 120], ['View', 112],
              ]}
              data={rows(record.tranDtls)}
              getCells={(entry, number) => [
                number, entry.tranNo, entry.paymentMode, entry.tranDate, entry.fromDate, entry.uptoDate,
                entry.requestDemandAmount, entry.demandAmt, entry.penaltyAmt, entry.payableAmt, entry.balance,
                entry.id == null ? null : (
                  <Button title="View Receipt" disabled={receiptId != null} onPress={() => openReceipt(entry.id)} />
                ),
              ]}
            />
          </Card>
          <Card title="Consumer Connection Details">
            {rows(record.connections).map((connection, index) => (
              <View key={connection.id ?? index} style={styles.record}>
                <Fields fields={[
                  ['Connection', index + 1], ['Status', flag(connection.isCurrent) ? 'Current' : 'Old'],
                  ['Effective From', connection.dateOfEffective],
                ]} />
                <SwmTable
                  columns={[
                    ['SL', 45], ['Category Type', 135], ['Sub Category Type', 145],
                    ['House / Truck / Room / Area (sq ft)', 155], ['Restaurants', 105],
                    ['Gardens', 95], ['Banquet Halls', 115],
                  ]}
                  data={rows(connection.connectionDetails)}
                  getCells={(entry, number) => [
                    number, entry.categoryType, entry.subCategoryType, entry.totalNoOfHouseAreaRoomTruck,
                    entry.totalNoOfRestaurant, entry.totalNoOfGarden, entry.totalNoOfBanquetHall,
                  ]}
                />
              </View>
            ))}
            {!rows(record.connections).length && <Text selectable>No connections found.</Text>}
          </Card>
          <Card title="Monthly Rate Details">
            <PaginatedSwmTable columns={[[ 'SL', 45 ], [ 'Monthly Rate', 115 ], [ 'Date of Effect', 125 ]]}
              data={rows(record.monthlyCharges)}
              getCells={(charge, number) => [number, charge.rate, charge.demandFrom]} />
          </Card>
          <View style={styles.actions}>
            <Button title="View Demand" onPress={() => setMode('history')} />
            {canPay && <Button title="Proceed Payment" onPress={() => setMode('payment')} />}
            {canGenerate && (
              <Button title="Generate Demand" disabled={generating}
                onPress={() => Alert.alert('Generate demand?', 'Create demand for this SWM consumer.', [
                  { text: 'Cancel', style: 'cancel' }, { text: 'Generate', onPress: generate },
                ])} />
            )}
          </View>
        </>
      )}
      {(mode === 'history' || (mode === 'payment' && canPay)) && (
        <DemandModal id={id} showTakePayment={mode === 'payment' && canPay} onClose={() => setMode(null)}
          onPaid={transactionId => {
            setMode(null);
            refresh();
            openReceipt(transactionId);
            Alert.alert('Payment successful');
          }} />
      )}
      {receiptId != null && (
        receipt?.data ? (
          <BluetoothReceiptModal visible onClose={closeReceipt} paymentDtls={receipt.data}
            receiptTitle="Solid Waste User Charge Receipt" previewTitle="SWM Payment Receipt" getFields={receiptFields} />
        ) : (
          <Card title="SWM Payment Receipt">
            {receipt?.error ? <Text selectable accessibilityRole="alert">{receipt.error}</Text> : <ActivityIndicator />}
            <Button title="Close" onPress={closeReceipt} />
          </Card>
        )
      )}
    </Page>
  );
}
