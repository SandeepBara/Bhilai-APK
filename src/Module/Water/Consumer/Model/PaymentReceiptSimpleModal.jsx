import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { sharedStyles } from './sharedStyles';
import { CopyableTouchableOpacity } from '../../../../Components/CopyableControl';

export const PaymentReceiptSimpleModal = ({ visible, onClose, receiptData }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={sharedStyles.overlay}>
      <View style={sharedStyles.modalContent}>
        <ScrollView nestedScrollEnabled>
          <CopyableTouchableOpacity style={sharedStyles.closeBtn} onPress={onClose}>
            <Text style={sharedStyles.closeText}>Close</Text>
          </CopyableTouchableOpacity>

          <Text selectable style={sharedStyles.mainTitle}>Payment Receipt</Text>
          <Text selectable style={sharedStyles.subTitle}>
            {receiptData?.ulbDtl?.ulbName || 'Municipal Corporation'}
          </Text>

          <View style={sharedStyles.sectionContainer}>
            <Text selectable style={sharedStyles.sectionTitle}>Receipt Info</Text>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Receipt No:</Text>
              <Text selectable style={sharedStyles.value}>{receiptData?.tranNo || 'N/A'}</Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Date:</Text>
              <Text selectable style={sharedStyles.value}>{receiptData?.tranDate || 'N/A'}</Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Application No:</Text>
              <Text selectable style={sharedStyles.value}>
                {receiptData?.applicationNo || 'N/A'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Account:</Text>
              <Text selectable style={sharedStyles.value}>
                {receiptData?.accountDescription || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={sharedStyles.sectionContainer}>
            <Text selectable style={sharedStyles.sectionTitle}>Owner Details</Text>
            {receiptData?.ownerDtl?.map((o, i) => (
              <View style={sharedStyles.rowContainer} key={i}>
                <Text selectable style={sharedStyles.label}>Owner {i + 1}:</Text>
                <Text selectable style={sharedStyles.value}>
                  {o.ownerName} ({o.mobileNo})
                </Text>
              </View>
            ))}
          </View>

          <View style={sharedStyles.sectionContainer}>
            <Text selectable style={sharedStyles.sectionTitle}>Payment Details</Text>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Mode:</Text>
              <Text selectable style={sharedStyles.value}>
                {receiptData?.paymentMode || 'N/A'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Status:</Text>
              <Text selectable
                style={[
                  sharedStyles.value,
                  {
                    color:
                      receiptData?.paymentStatus === 'Clear' ? 'green' : 'red',
                  },
                ]}
              >
                {receiptData?.paymentStatus || 'N/A'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Amount:</Text>
              <Text selectable style={sharedStyles.value}>
                ₹ {receiptData?.amount || '0.00'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>In Words:</Text>
              <Text selectable style={sharedStyles.value}>
                {receiptData?.amountInWords || ''}
              </Text>
            </View>
          </View>

          <View style={sharedStyles.sectionContainer}>
            <Text selectable style={sharedStyles.sectionTitle}>Transaction</Text>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Payable Amount:</Text>
              <Text selectable style={sharedStyles.value}>
                ₹ {receiptData?.tranDtl?.payableAmt || '0.00'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Demand Amount:</Text>
              <Text selectable style={sharedStyles.value}>
                ₹ {receiptData?.tranDtl?.demandAmt || '0.00'}
              </Text>
            </View>
            <View style={sharedStyles.rowContainer}>
              <Text selectable style={sharedStyles.label}>Penalty:</Text>
              <Text selectable style={sharedStyles.value}>
                ₹ {receiptData?.tranDtl?.penaltyAmt || '0.00'}
              </Text>
            </View>
          </View>

          {receiptData?.fineRebate?.length > 0 && (
            <View style={sharedStyles.sectionContainer}>
              <Text selectable style={sharedStyles.sectionTitle}>Fine / Rebate</Text>
              {receiptData.fineRebate.map((f, i) => (
                <View style={sharedStyles.rowContainer} key={i}>
                  <Text selectable style={sharedStyles.label}>{f.headName}:</Text>
                  <Text selectable style={sharedStyles.value}>₹ {f.amount}</Text>
                </View>
              ))}
            </View>
          )}

          <Text selectable style={sharedStyles.note}>
            Note: This is a computer-generated receipt. No physical signature is
            required.
          </Text>

          <TouchableOpacity style={sharedStyles.printBtn}>
            <Text selectable style={sharedStyles.printText}>Download / Print</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default PaymentReceiptSimpleModal;
