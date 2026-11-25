import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Button from '../../../Components/AppButton';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';
import { SWM_DUE_API, SWM_PAY_DUE_API } from '../../../api/apiRoutes';
import { SwmPaymentForm } from './SwmPaymentForm';
import { SwmTable } from './SwmTable';
import { Card } from './SwmUI';
import { message, request, rows, useData } from '../swmRequests';
import { styles } from '../swmStyles';

const demandPageSizes = [5, 10, 15, 50, 100, 500, 1000].map(value => ({ label: String(value), value }));
const demandDate = value => typeof value === 'string'
  ? value.replace(/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/, '$3/$2/$1')
  : value;

export default function DemandModal({ id, showTakePayment = false, onClose, onPaid }) {
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
