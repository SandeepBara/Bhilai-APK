import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import HeaderNavigation from '../../Components/HeaderNavigation';
import Pagination from '../../Components/Pagination';
import { BluetoothReceiptModal } from '../../Components/BluetoothReceiptModal';
import { CopyableText, CopyableTouchableOpacity } from '../../Components/CopyableControl';
import { cardHeader } from '../../style/cardHeader';
import { message, request, useData } from './swmRequests';
import { SwmPaymentForm } from './SwmPaymentForm';
import {
  WARD_LIST_API, SWM_SEARCH_API, SWM_DETAILS_API,
  SWM_DUE_API, SWM_GENERATE_DEMAND_API, SWM_PAY_DUE_API, SWM_PAYMENT_RECEIPT_API,
} from '../../api/apiRoutes';

const flag = value => [true, 1, '1', 'true'].includes(value);
const rows = value => Array.isArray(value) ? value : Object.values(value ?? {});
const PAGE_SIZE = 10;

function Page({ children }) {
  return (
    <View style={styles.screen}>
      <HeaderNavigation />
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      {title ? <Text selectable accessibilityRole="header" style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

function Fields({ fields }) {
  return (
    <View style={styles.grid}>
      {fields.map(([label, value, onPress]) => (
        <View key={label} style={styles.field}>
          <Text selectable style={styles.label}>{label}</Text>
          {onPress ? (
            <CopyableText accessibilityRole="link" style={styles.link} onPress={onPress}>{value}</CopyableText>
          ) : <Text selectable>{value ?? '—'}</Text>}
        </View>
      ))}
    </View>
  );
}

function SwmTable({ columns, data, getCells, firstNumber = 1, demandStyle = false }) {
  if (!data.length) return <Text selectable>No records found.</Text>;

  return (
    <ScrollView horizontal>
      <View>
        <View style={[styles.tableRow, styles.tableHeading, demandStyle && styles.demandTableHeading]}>
          {columns.map(([label, width]) => (
            <Text selectable key={label} style={[styles.tableCell, styles.tableHeadingText, { width }]}>
              {label}
            </Text>
          ))}
        </View>
        {data.map((item, index) => (
          <View key={item.id ?? index} style={[styles.tableRow, index % 2 === 1 && styles.tableStripe]}>
            {getCells(item, firstNumber + index).map((value, columnIndex) => {
              const [label, width] = columns[columnIndex];
              return (
                <View key={label} style={[styles.tableCell, { width }]}>
                  {React.isValidElement(value) ? value : <Text selectable style={demandStyle && styles.demandCellText}>{value ?? '—'}</Text>}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function PaginatedSwmTable({ data, ...tableProps }) {
  const [requestedPage, setPage] = useState(1);
  const pageSize = 5;
  const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * pageSize;

  return (
    <>
      <SwmTable {...tableProps} data={data.slice(offset, offset + pageSize)} firstNumber={offset + 1} />
      {lastPage > 1 && (
        <Pagination
          page={page}
          lastPage={lastPage}
          total={data.length}
          onPrev={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
          onPageChange={setPage}
        />
      )}
    </>
  );
}

function PagedResults({ result, page, onPage, renderRow }) {
  if (!result) return <ActivityIndicator accessibilityLabel="Loading records" />;
  if (result.error) return <Text selectable accessibilityRole="alert">{result.error}</Text>;
  const items = rows(result.data?.data);
  const lastPage = Number(result.data?.lastPage) || 1;

  return (
    <>
      {items.map(renderRow)}
      {!items.length && <Text selectable>No records found.</Text>}
      {lastPage > 1 && (
        <Pagination page={page} lastPage={lastPage} total={Number(result.data.total) || items.length}
          onPrev={() => onPage(page - 1)} onNext={() => onPage(page + 1)} onPageChange={onPage} />
      )}
    </>
  );
}

export function SwmSearch({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [wardIds, setWardIds] = useState([]);
  const [query, setQuery] = useState(undefined);
  const wards = useData(WARD_LIST_API, null);
  const result = useData(SWM_SEARCH_API, query);
  const search = () => setQuery({ wardId: wardIds, keyWord: keyword.trim(), page: 1, perPage: PAGE_SIZE });

  return (
    <Page>
      <Card title="Search SWM Consumer">
        <Text selectable style={styles.label}>Ward No.</Text>
        <MultiSelect style={styles.input}
          data={rows(wards?.data).map(ward => ({ label: String(ward.wardNo ?? ''), value: ward.id }))}
          accessibilityLabel="Ward No." placeholder="Select Ward(s)" labelField="label" valueField="value"
          value={wardIds} onChange={setWardIds} />
        {wards?.error ? <Text selectable accessibilityRole="alert">{wards.error}</Text> : null}
        <Text selectable style={styles.label}>Enter Keywords</Text>
        <TextInput style={styles.input} accessibilityLabel="Enter Keywords"
          placeholder="Consumer No., owner name, or mobile" value={keyword} onChangeText={setKeyword}
          returnKeyType="search" onSubmitEditing={search} />
        <Button title="Search" onPress={search} />
      </Card>
      {query && (
        <PagedResults result={result} page={query.page}
          onPage={page => setQuery({ ...query, page })}
          renderRow={(item, index) => (
            <Card key={item.id ?? index} title={item.consumerNo ?? 'Consumer'}>
              <Fields fields={[
                ['Ward No.', item.wardNo], ['Holding No.', item.holdingNo],
                ['Owner Name', item.ownerName], ['Guardian Name', item.guardianName],
                ['Mobile No.', item.mobileNo], ['Address', item.address],
              ]} />
              <Button title="View" disabled={item.id == null}
                onPress={() => navigation.navigate('SwmConsumerDetails', { id: item.id })} />
            </Card>
          )} />
      )}
    </Page>
  );
}

const demandPageSizes = [5, 10, 15, 50, 100, 500, 1000].map(value => ({ label: String(value), value }));
const demandDate = value => typeof value === 'string'
  ? value.replace(/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/, '$3/$2/$1')
  : value;

function DemandModal({ id, showTakePayment = false, onClose, onPaid }) {
  const [dueQuery, setDueQuery] = useState(() => ({ id }));
  const [pageSize, setPageSize] = useState(5);
  const [requestedPage, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const inFlight = useRef(false);
  const due = useData(SWM_DUE_API, dueQuery);
  const data = due?.data;
  const payable = Number(data?.payableAmount);
  const paymentPending = [false, 0, '0', 'false'].includes(data?.lastPaymentClear);
  const canSubmit = showTakePayment && !paymentPending && Number.isFinite(payable) && payable > 0;
  const demandRows = rows(data?.demandList);
  const lastPage = Math.max(1, Math.ceil(demandRows.length / pageSize));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * pageSize;
  const visibleRows = demandRows.slice(offset, offset + pageSize);
  const firstPageButton = Math.max(1, Math.min(page - 1, lastPage - 2));
  const pageButtons = Array.from({ length: Math.min(3, lastPage) }, (_, index) => firstPageButton + index);

  const close = () => {
    if (!inFlight.current) onClose();
  };

  async function pay(payment) {
    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    try {
      const result = await request(SWM_PAY_DUE_API, { id, ...payment });
      onPaid(result?.tranId);
    } catch (error) {
      Alert.alert('Payment failed', message(error));
      setDueQuery({ id });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <Modal visible transparent onRequestClose={close} animationType="fade">
      <SafeAreaView style={styles.demandOverlay}>
        <View style={styles.demandPanel}>
          <View style={styles.toolbar}>
            <Text selectable accessibilityRole="header" style={styles.toolbarTitle}>View Demand</Text>
            <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel="Close"
              disabled={saving} onPress={close} style={styles.closeDemand}>
              <Text style={styles.closeDemandText}>×</Text>
            </CopyableTouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.demandContent}>
            {!due && <ActivityIndicator accessibilityLabel="Loading demand" />}
            {due?.error ? (
              <>
                <Text selectable accessibilityRole="alert">{due.error}</Text>
                <Button title="Retry" onPress={() => setDueQuery({ id })} />
              </>
            ) : null}
            {data && (
              <>
                <View style={styles.demandTablePanel}>
                  <View style={styles.demandPageSize}>
                    <Text selectable>Show</Text>
                    <Dropdown accessibilityLabel="Items per page" style={styles.demandPageInput}
                      data={demandPageSizes} labelField="label" valueField="value" value={pageSize}
                      onChange={item => {
                        setPageSize(item.value);
                        setPage(1);
                      }} />
                    <Text selectable>items</Text>
                  </View>
                  <SwmTable
                    columns={[
                      ['#', 40], ['Demand From', 112], ['Demand Upto', 112],
                      ['Demand Amount To', 135], ['Penalty', 85], ['Total Tax', 95],
                    ]}
                    demandStyle
                    data={visibleRows}
                    firstNumber={offset + 1}
                    getCells={(item, number) => [
                      number, demandDate(item.demandFrom), demandDate(item.demandUpto),
                      item.balance, item.latePenalty, item.totalTax,
                    ]}
                  />
                  <View style={styles.demandPagination}>
                    <Text selectable style={styles.label}>
                      Showing {demandRows.length ? offset + 1 : 0} to {offset + visibleRows.length} of {demandRows.length} entries
                    </Text>
                    {lastPage > 1 && (
                      <View style={styles.demandPageButtons}>
                        {[
                          ['Previous', page - 1], ...pageButtons.map(number => [String(number), number]),
                          ['Next', page + 1],
                        ].map(([label, target]) => {
                          const selected = label === String(page);
                          const disabled = selected || target < 1 || target > lastPage;
                          return (
                            <CopyableTouchableOpacity key={label} accessibilityRole="button" disabled={disabled}
                              accessibilityState={{ disabled, selected }}
                              onPress={() => setPage(target)}
                              style={[styles.demandPageButton, selected && styles.demandPageButtonActive]}>
                              <Text style={[
                                styles.demandPageText, selected && styles.demandPageTextActive,
                                disabled && !selected && styles.demandPageTextDisabled,
                              ]}>{label}</Text>
                            </CopyableTouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>

                <Text selectable accessibilityRole="header" style={styles.demandHeading}>Main Demand</Text>
                <View style={styles.demandSummary}>
                  {[
                    ['Demand:', data.demandAmount, '#111827'],
                    ['Penalty:', data.latePenalty, '#b91c1c'],
                    ['Other Penalty:', data.otherPenalty, '#b91c1c'],
                    ['Advance:', data.advanceAmount, '#15803d'],
                  ].map(([label, value, color]) => (
                    <View key={label} style={styles.demandTile}>
                      <Text selectable style={[styles.label, { color }]}>{label}</Text>
                      <Text selectable style={{ color }}>{value ?? '—'}</Text>
                    </View>
                  ))}
                </View>
                <Text selectable accessibilityRole="header" style={styles.totalHeading}>Total</Text>
                <View style={styles.payableTotal}>
                  <Text selectable style={styles.payableAmount}>Total Payable Amount:</Text>
                  <Text selectable style={styles.payableAmount}>{data.payableAmount ?? '—'}</Text>
                </View>

                {showTakePayment && paymentPending && (
                  <Text selectable>Wait for the previous payment to clear.</Text>
                )}
                {canSubmit && !showPaymentForm && (
                  <View style={styles.payNow}>
                    <Button title="Pay Now" onPress={() => setShowPaymentForm(true)} />
                  </View>
                )}
                {canSubmit && showPaymentForm && (
                  <Card title="Process Payment">
                    <SwmPaymentForm payable={payable} saving={saving}
                      onCancel={() => setShowPaymentForm(false)} onSubmit={pay} />
                  </Card>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const receiptFields = (receipt, { money, date }) => [
  ['Consumer No.', receipt.consumerNo ?? receipt.consumer_no],
  ['Holding No.', receipt.holdingNo ?? receipt.holding_no],
  ['Name', receipt.ownerName], ['Address', receipt.address],
  ['Dues From', date(receipt.fromDate)], ['Dues Upto', date(receipt.uptoDate)],
  ['Waste Charges', money(receipt.monthlyDemandAmount)], ['Balance Due', money(receipt.dueAmount)],
];

export function SwmConsumerDetails({ route, navigation }) {
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 12, gap: 10, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 8 },
  title: { ...cardHeader, fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', padding: 5, gap: 3 },
  label: { color: '#475569', fontWeight: '600' },
  input: { minHeight: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10 },
  link: { color: '#1d4ed8', textDecorationLine: 'underline' },
  tableRow: { flexDirection: 'row', alignItems: 'stretch' },
  tableHeading: { backgroundColor: '#e8eff7' },
  tableHeadingText: { color: '#10263a', fontWeight: '700' },
  tableStripe: { backgroundColor: '#f1f5f9' },
  tableCell: { padding: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1' },
  record: { paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  demandOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.48)' },
  demandPanel: { width: '100%', maxWidth: 1100, height: '92%', backgroundColor: '#fff', borderRadius: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  toolbarTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a8a' },
  closeDemand: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeDemandText: { color: '#475569', fontSize: 28, fontWeight: '700' },
  demandContent: { padding: 14, gap: 12 },
  demandTablePanel: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 8 },
  demandPageSize: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  demandPageInput: { width: 76, height: 36, paddingHorizontal: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6 },
  demandPagination: { padding: 9, gap: 8 },
  demandPageButtons: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 5 },
  demandPageButton: { minHeight: 38, minWidth: 34, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 5, backgroundColor: '#f1f2f4' },
  demandPageButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  demandPageText: { color: '#111827' },
  demandPageTextActive: { color: '#fff' },
  demandPageTextDisabled: { color: '#64748b' },
  demandTableHeading: { backgroundColor: '#f1f2f4' },
  demandCellText: { textAlign: 'center' },
  demandHeading: { fontWeight: '700', color: '#1e3a8a' },
  demandSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demandTile: { flexBasis: 133, flexGrow: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: '#f1f2f4', borderRadius: 5, padding: 9 },
  totalHeading: { fontWeight: '700', color: '#111827' },
  payableTotal: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: '#fef08a', borderRadius: 5, padding: 10 },
  payableAmount: { color: '#b91c1c', fontWeight: '700' },
  payNow: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
});
