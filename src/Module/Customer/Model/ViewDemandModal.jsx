import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { sharedStyles } from './sharedStyles';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';

export const ViewDemandModal = ({
  visible,
  onClose,
  customerDue,
  customerDeuDetails,
}) => {
  const renderItem = ({ item, index }) => (
    <View
      style={[
        sharedStyles.rowContainer,
        index % 2 === 0 ? sharedStyles.rowEven : sharedStyles.rowOdd,
      ]}
    >
      <Text selectable style={[sharedStyles.tableCell, { flex: 1 }]}>{index + 1}</Text>
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
    <Modal visible={visible} transparent animationType="slide">
      <View style={sharedStyles.overlay}>
        <View style={sharedStyles.modalContent}>
          <ScrollView>
            <CopyableTouchableOpacity style={sharedStyles.closeBtn} onPress={onClose}>
              <Text style={sharedStyles.closeText}>Close</Text>
            </CopyableTouchableOpacity>

            <Text selectable style={sharedStyles.mainTitle}>Demand Details</Text>

            {/* Table Section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

                {/* Table Data */}
                <FlatList
                  data={customerDue}
                  renderItem={renderItem}
                  keyExtractor={item => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>

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
                    ₹{customerDeuDetails.payableAmount || '0.00'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ViewDemandModal;
