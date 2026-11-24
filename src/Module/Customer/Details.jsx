import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Colors from '../Constants/Colors';
import { CUSTOMER_API } from '../../api/apiRoutes';
import HeaderNavigation from '../../Components/HeaderNavigation';
import { CopyableText, CopyableTouchableOpacity } from '../../Components/CopyableControl';
import { getToken } from '../../utils/auth';
import { PaymentReceiptModal, ViewDemandModal } from './Model';
import GenerateDemandModal from './Model/GenerateDemandModal';
import { cardHeader } from '../../style/cardHeader';

const enabled = value => [true, 1, '1', 'true'].includes(value);
const dateOnly = value => value?.match?.(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? value;
const hasId = value => /^\d+$/.test(String(value ?? '')) && /[1-9]/.test(String(value));
const list = value => Array.isArray(value) ? value : Object.values(value ?? {});

async function post(url, id, signal) {
  const token = await getToken();
  if (!token) throw new Error('Please sign in again.');
  const { data } = await axios.post(url, { id }, {
    headers: { Authorization: 'Bearer ' + token }, signal,
  });
  if (!data?.status || !data.data) throw new Error(data?.message || 'Could not load details.');
  return data.data;
}

function Section({ title, children }) {
  return (
    <View style={styles.card}>
      <Text selectable accessibilityRole="header" style={styles.heading}>{title}</Text>
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
            <CopyableText onPress={onPress} accessibilityRole="link" style={styles.link}>
              {value}
            </CopyableText>
          ) : <Text selectable style={styles.value}>{value ?? '—'}</Text>}
        </View>
      ))}
    </View>
  );
}

function Action({ title, onPress, disabled, propertyStyle = false }) {
  return (
    <CopyableTouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPress={onPress}
      disabled={disabled}
      style={[
        propertyStyle ? styles.propertyAction : styles.action,
        disabled && (propertyStyle ? styles.propertyActionDisabled : styles.disabled),
      ]}>
      <Text style={propertyStyle ? styles.propertyActionLabel : styles.actionLabel}>{title}</Text>
    </CopyableTouchableOpacity>
  );
}

function Table({ columns, rows }) {
  if (!rows.length) return <Text selectable>No records found.</Text>;

  return (
    <ScrollView horizontal>
      <View>
        {[columns, ...rows].map((row, index) => (
          <View key={index} style={[styles.tableRow, index === 0 && styles.tableHeader]}>
            {row.map((value, column) => (
              <View key={columns[column]} style={[styles.cell, column === 0 && styles.numberCell]}>
                {React.isValidElement(value) ? value : (
                  <Text selectable style={index === 0 ? styles.columnTitle : styles.value}>
                    {value ?? '—'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function Details({ route, navigation }) {
  const id = route.params?.id;
  const { bottom } = useSafeAreaInsets();
  const [consumer, setConsumer] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [due, setDue] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [newTransactionId, setNewTransactionId] = useState(null);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const actionRequest = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setConsumer(null);
    setError('');
    setBusy(false);
    if (id == null) {
      setError('Consumer ID is missing.');
      return;
    }
    post(CUSTOMER_API.CUSTOMER_DETAILS_API, id, controller.signal).then(data => {
      if (!controller.signal.aborted) setConsumer(data);
    }).catch(failure => {
      if (!controller.signal.aborted) setError(failure.response?.data?.message || failure.message);
    });
    return () => {
      controller.abort();
      actionRequest.current?.abort();
      actionRequest.current = null;
    };
  }, [id, revision]);

  useEffect(() => {
    if (newTransactionId == null) return;
    const controller = new AbortController();
    post(CUSTOMER_API.CUSTOMER_PAYMENT_RECIPT_API, newTransactionId, controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setReceipt(data);
        setModal('receipt');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          Alert.alert('Receipt unavailable', 'Open the receipt from Payment Details to try again.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setNewTransactionId(null);
      });
    return () => controller.abort();
  }, [newTransactionId]);

  const connection = consumer?.connectionDtl ?? {};
  const permission = consumer?.userPermission;
  const canTakePayment = enabled(permission?.canTakePayment);
  const canGenerateDemand = enabled(permission?.canGenerateDemand) && hasId(consumer?.meterStatusId);
  const canViewApplication = hasId(consumer?.applicationId);

  async function openAction(type, endpoint, recordId) {
    if (type === 'payment' && !canTakePayment) return;
    if (actionRequest.current) return;
    const controller = new AbortController();
    actionRequest.current = controller;
    setBusy(true);
    try {
      const data = await post(endpoint, recordId, controller.signal);
      if (controller.signal.aborted) return;
      if (type === 'receipt') setReceipt(data);
      else setDue(data);
      setModal(type);
    } catch (failure) {
      if (!controller.signal.aborted) {
        Alert.alert('Unable to open details', failure.response?.data?.message || failure.message);
      }
    } finally {
      if (actionRequest.current === controller) {
        actionRequest.current = null;
        setBusy(false);
      }
    }
  }

  const close = () => setModal(null);

  return (
    <View style={styles.screen}>
      <HeaderNavigation />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 12 }]}>
        {!consumer && !error && <ActivityIndicator accessibilityLabel="Loading consumer details" />}
        {error ? (
          <Section title="Consumer Details">
            <Text selectable accessibilityRole="alert">{error}</Text>
            <Action title="Retry" onPress={() => setRevision(value => value + 1)} />
          </Section>
        ) : null}
        {consumer && (
          <>
            <Section title="Consumer Details">
              <Fields fields={[
                ['Consumer No', consumer.consumerNo],
                ...(consumer.oldConsumerNO || consumer.oldConsumerNo
                  ? [['Old Consumer No.', consumer.oldConsumerNO || consumer.oldConsumerNo]] : []),
                ['Consumer Date', dateOnly(consumer.connectionDate)], ['Ward No', consumer.wardNo],
                ...(consumer.safNo ? [['SAF No.', consumer.safNo, consumer.safDetailId
                  ? () => navigation.push('SafDetails', { id: consumer.safDetailId }) : undefined]] : []),
                ...(consumer.newHoldingNo ? [['Holding No.', consumer.newHoldingNo, consumer.propertyDetailId
                  ? () => navigation.push('HoldingDetails', { id: consumer.propertyDetailId }) : undefined]] : []),
                ['Property Type', consumer.propertyType], ['Address', consumer.address],
                ['Landmark', consumer.landmark], ['Pin Code', consumer.pinCode],
              ]} />
            </Section>
            <Section title="Owner Details">
              <Table columns={['SL', 'Owner', 'Guardian', 'Mobile']}
                rows={list(consumer.owners).map((owner, index) => [
                  index + 1, owner.ownerName, owner.guardianName, owner.mobileNo,
                ])} />
            </Section>
            <Section title="Payment Details">
              <Table columns={[
                'SL', 'Transaction No', 'Payment Mode', 'Date', 'Demand From', 'Demand Upto',
                'Demand Amount Without Penalty', 'Paid Demand', 'Paid Penalty', 'Total Paid Amount',
                'Balance Amount', 'View',
              ]} rows={list(consumer.tranDtls).map((payment, index) => [
                index + 1, payment.tranNo, payment.paymentMode, dateOnly(payment.tranDate),
                payment.fromDate, payment.uptoDate, payment.requestDemandAmount,
                payment.demandAmt, payment.penaltyAmt, payment.payableAmt, payment.balance,
                payment.id != null ? (
                  <Action title="View" disabled={busy} onPress={() =>
                    openAction('receipt', CUSTOMER_API.CUSTOMER_PAYMENT_RECIPT_API, payment.id)
                  } />
                ) : null,
              ])} />
            </Section>
            <Section title="Connection Details">
              <Table columns={[
                'SL', 'Is Correct Connection', 'Property Type', 'Connection Type', 'Meter No.',
                'Initial Reading', 'Is Meter Working', 'No. Of Connection/Room/Table',
                'Effect Of Connection', 'Any Fix Rate',
              ]} rows={list(consumer.allConnection).map((item, index) => [
                index + 1, enabled(item.isCurrent) ? 'Yes' : 'No', item.propertyType,
                item.connectionType, item.meterNo, item.initialReading,
                enabled(item.isMeterWorking) && Number(item.meterTypeId) === 1 ? 'Yes' : 'No',
                item.noOfRoom, dateOnly(item.connectionDate), item.fixRate,
              ])} />
            </Section>
            <Section title="Consumer Connection Details">
              <Fields fields={[
                ['Property Type', connection.propertyType], ['Connection Type', connection.connectionType],
                ['Connection Date', dateOnly(connection.connectionDate)], ['Meter No.', connection.meterNo],
                ['Last Reading', connection.currentReading],
                ['Last Reading Date', Array.isArray(connection.currentReadingDate)
                  ? connection.currentReadingDate[0] : connection.currentReadingDate],
                ['User Name', connection.userName],
              ]} />
              <Text selectable style={styles.label}>Last Reading Img</Text>
              {connection.docPath ? (
                <Image accessibilityLabel="Last reading image" source={{ uri: connection.docPath }}
                  style={styles.image} resizeMode="contain" />
              ) : <Text selectable>—</Text>}
            </Section>
            <View style={styles.actions}>
              <Action propertyStyle title="View Demand" disabled={busy}
                onPress={() => openAction('demand', CUSTOMER_API.CUSTOMER_DUE_API, id)} />
              {canTakePayment && (
                <Action propertyStyle title="Proceed Payment" disabled={busy}
                  onPress={() => openAction('payment', CUSTOMER_API.CUSTOMER_DUE_API, id)} />
              )}
              {canGenerateDemand && (
                <Action propertyStyle title="Generate Demand" disabled={busy} onPress={() => setModal('generate')} />
              )}
              {canViewApplication && (
                <Action propertyStyle title="View Application" onPress={() =>
                  navigation.push('WaterDetails', { id: consumer.applicationId })
                } />
              )}
            </View>
            {busy && <ActivityIndicator accessibilityLabel="Loading action" />}
          </>
        )}
      </ScrollView>

      {(modal === 'demand' || (modal === 'payment' && canTakePayment)) && (
        <ViewDemandModal
          visible onClose={close} id={id}
          showTakePayment={modal === 'payment' && canTakePayment}
          customerDue={list(due?.demandList)} customerDeuDetails={due}
          onPaymentSuccess={transactionId => {
            setRevision(value => value + 1);
            if (hasId(transactionId)) setNewTransactionId(transactionId);
          }}
        />
      )}
      {modal === 'receipt' && <PaymentReceiptModal visible onClose={close} receiptData={receipt} />}
      {modal === 'generate' && canGenerateDemand && <GenerateDemandModal visible onClose={close}
        connectionDetails={connection} id={id} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 12, gap: 12 },
  card: { padding: 12, gap: 8, borderRadius: 10, backgroundColor: '#fff' },
  heading: { color: '#10263a', fontSize: 17, fontWeight: '700', ...cardHeader },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', padding: 5, gap: 3 },
  label: { color: '#475569', fontWeight: '600' },
  value: { color: '#10263a' },
  link: { color: '#1d4ed8', textDecorationLine: 'underline' },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#e8eff7' },
  columnTitle: { color: '#10263a', fontWeight: '700' },
  cell: { width: 122, padding: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#cbd5e1' },
  numberCell: { width: 42 },
  image: { width: 150, height: 100 },
  actions: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6,
    marginTop: 15, marginBottom: 20, paddingHorizontal: 5,
  },
  propertyAction: {
    width: 85, backgroundColor: Colors.primary, borderRadius: 6,
    paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center',
    justifyContent: 'center', elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  propertyActionLabel: { color: '#fff', fontSize: 9, fontWeight: 'bold', textAlign: 'center' },
  propertyActionDisabled: { opacity: 0.5, backgroundColor: '#ccc' },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 7, backgroundColor: '#164e83' },
  actionLabel: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
