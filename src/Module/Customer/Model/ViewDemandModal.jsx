import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pagination from '../../../Components/Pagination';
import { cardHeader } from '../../../style/cardHeader';
import { PaymentForm } from './PaymentModal';
import { sharedStyles } from './sharedStyles';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';

const ROWS_PER_PAGE = 5;

export const ViewDemandModal = ({
  visible,
  onClose,
  customerDue,
  customerDeuDetails,
  showTakePayment = false,
  id,
  onPaymentSuccess,
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const payableAmount = customerDeuDetails?.payableAmount;
  const canTakePayment = showTakePayment && id != null && Number(payableAmount) > 0;
  const takingPayment = canTakePayment && showPaymentForm;
  const close = () => {
    if (!submitting) onClose();
  };
  const [requestedPage, setPage] = useState(1);
  const scrollRef = useRef(null);
  const rows = Array.isArray(customerDue) ? customerDue : [];
  const lastPage = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * ROWS_PER_PAGE;
  const visibleRows = rows.slice(offset, offset + ROWS_PER_PAGE);

  const goToPage = next => {
    if (next < 1 || next > lastPage || next === page) return;
    setPage(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const renderItem = ({ item, index }) => (
    <View
      key={item.id ?? offset + index}
      style={[
        sharedStyles.rowContainer,
        index % 2 === 0 ? sharedStyles.rowEven : sharedStyles.rowOdd,
      ]}
    >
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>{offset + index + 1}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 2 }]}>{item.demandFrom}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 2 }]}>{item.demandUpto}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>₹ {item.amount}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
        ₹ {item.totalTax || 0}
      </Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>₹ {item.balance}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>{item.fromReading}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
        {item.currentMeterReading}
      </Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>₹ {item.unitAmount}</Text>
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>₹ {item.latePenalty}</Text>
      <Text selectable
        style={[
          sharedStyles.tableCell,
          { flex: 1, color: item.paidStatus ? 'green' : 'red' },
        ]}
      >
        {item.paidStatus ? 'Paid' : 'Pending'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <SafeAreaView style={sharedStyles.overlay}>
        <View style={sharedStyles.modalContent}>
          <View style={styles.header}>
            <Text selectable accessibilityRole="header" style={styles.title}>Demand Details</Text>
            <CopyableTouchableOpacity accessibilityRole="button" style={styles.close} disabled={submitting} onPress={close}>
              <Text style={styles.closeText}>Close</Text>
            </CopyableTouchableOpacity>
          </View>
          {takingPayment ? (
            <ScrollView keyboardShouldPersistTaps="handled">
              <PaymentForm id={id} payableAmount={payableAmount} submitting={submitting}
                onSubmittingChange={setSubmitting} onCancel={() => setShowPaymentForm(false)}
                onSuccess={transactionId => {
                  onClose();
                  onPaymentSuccess?.(transactionId);
                }} />
            </ScrollView>
          ) : (
            <ScrollView ref={scrollRef} nestedScrollEnabled>
              {/* Table Section */}
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View style={{ minWidth: 700 }}>
                  {/* Table Header */}
                  <View style={[sharedStyles.rowContainer, sharedStyles.tableHeader]}>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>#</Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 2 }]}>
                      Demand From
                    </Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 2 }]}>Demand To</Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>Amount</Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>Tax</Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>Balance</Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
                      From Reading
                    </Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
                      Current Reading
                    </Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
                      Unit Amount
                    </Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>
                      Late Penalty
                    </Text>
                    <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>Paid</Text>
                  </View>

                  {visibleRows.map((item, index) => renderItem({ item, index }))}
                  {visibleRows.length === 0 && <Text selectable style={styles.empty}>No demand records found.</Text>}
                </View>
              </ScrollView>

              {lastPage > 1 && (
                <Pagination page={page} lastPage={lastPage} total={rows.length}
                  onNext={() => goToPage(page + 1)} onPrev={() => goToPage(page - 1)}
                  onPageChange={goToPage} />
              )}

              <View style={sharedStyles.paymentSummarySection}>
                <Text selectable style={sharedStyles.paymentTitle}>Main Demand</Text>

                <View style={sharedStyles.paymentDetailsContainer}>
                  <View style={sharedStyles.paymentRow}>
                    <View style={sharedStyles.paymentItem}>
                      <Text selectable style={sharedStyles.paymentLabel}>Demand:</Text>
                      <Text selectable style={sharedStyles.paymentValue}>
                        ₹{customerDeuDetails?.demandAmount || '0.00'}
                      </Text>
                    </View>

                    <View style={sharedStyles.paymentItem}>
                      <Text selectable style={[sharedStyles.paymentLabel, sharedStyles.penaltyText]}>
                        Penalty:
                      </Text>
                      <Text selectable style={[sharedStyles.paymentValue, sharedStyles.penaltyText]}>
                        ₹{customerDeuDetails?.penaltyAmount || '0.00'}
                      </Text>
                    </View>

                    <View style={sharedStyles.paymentItem}>
                      <Text selectable style={[sharedStyles.paymentLabel, sharedStyles.penaltyText]}>
                        Other Penalty:
                      </Text>
                      <Text selectable style={[sharedStyles.paymentValue, sharedStyles.penaltyText]}>
                        ₹{customerDeuDetails?.otherPenalty || '0.00'}
                      </Text>
                    </View>

                    <View style={sharedStyles.paymentItem}>
                      <Text selectable style={[sharedStyles.paymentLabel, sharedStyles.advanceText]}>
                        Advance:
                      </Text>
                      <Text selectable style={[sharedStyles.paymentValue, sharedStyles.advanceText]}>
                        ₹{customerDeuDetails?.advanceAmount || '0.00'}
                      </Text>
                    </View>
                  </View>

                  <View style={sharedStyles.totalSection}>
                    <Text selectable style={sharedStyles.totalSectionText}>Total</Text>
                  </View>

                  <View style={sharedStyles.totalPayableContainer}>
                    <Text selectable style={sharedStyles.totalPayableLabel}>
                      Total Payable Amount:
                    </Text>
                    <Text selectable style={sharedStyles.totalPayableValue}>
                      ₹{customerDeuDetails?.payableAmount ?? '0.00'}
                    </Text>
                  </View>
                </View>
              </View>
              {canTakePayment && (
                <CopyableTouchableOpacity accessibilityRole="button" style={styles.takePayment}
                  onPress={() => setShowPaymentForm(true)}>
                  <Text style={styles.closeText}>Take Payment</Text>
                </CopyableTouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    ...cardHeader,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: 10, marginBottom: 10,
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '700', flexShrink: 1 },
  close: { padding: 8 },
  closeText: { color: '#fff', fontWeight: '700' },
  takePayment: { minHeight: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#14532d', borderRadius: 6, marginTop: 12 },
  empty: { padding: 12 },
});

export default ViewDemandModal;
