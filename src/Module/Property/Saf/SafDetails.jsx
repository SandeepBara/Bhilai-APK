import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Button,
} from 'react-native';
import { WORK_FLOW_PERMISSION } from '../../../api/apiRoutes';
import { TCVerificationModal } from './Models/TCVerificationModal';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropertyTaxNoticeModal from './Models/PropertyTaxNoticeModal';
import { PaymentReceiptModal } from './Models/PaymentReceiptModal';
import { ViewDemandModal } from './Models/ViewDemandModal';
import { PayNowModal } from './Models/PayNowModal';
import { DocumentViewModal } from './Models/DocumentViewModal';
import { ImageViewModal } from './Models/ImageViewModal';
import React from 'react';
import Header from '../../../Screen/Header';
import Colors from '../../Constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import { getToken } from '../../../utils/auth';
import { CopyableText, CopyableTouchableOpacity } from '../../../Components/CopyableControl';
import { SAF_DEMAND_API, SAF_DOCUMENTS_API, SAF_RECEIPT_API, SAF_DETAILS_API, SAF_PAY_DEMAND_API } from '../../../api/apiRoutes';
const isEnabled = value => [true, 1, '1', 'true'].includes(value);
const yesNo = value => isEnabled(value) ? 'Yes' : 'No';

function DetailRows({ title, fields }) {
  return (
    <View style={styles.card}>
      <Text selectable style={styles.heading}>{title}</Text>
      {fields.map(([label, value, onPress]) => (
        <View key={label} style={styles.row}>
          <Text selectable style={styles.labelFixed}>{label}</Text>
          <CopyableText selectable onPress={onPress} style={[styles.value, onPress && styles.linkValue]}>
            {value ?? 'NA'}
          </CopyableText>
        </View>
      ))}
    </View>
  );
}

function DetailTable({ title, columns, rows }) {
  return (
    <View style={styles.card}>
      <Text selectable style={styles.heading}>{title}</Text>
      {rows.length ? (
        <ScrollView horizontal>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {columns.map(column => (
                <Text selectable key={column} style={[styles.tableCell, styles.headerText]}>{column}</Text>
              ))}
            </View>
            {rows.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                {row.map((value, column) => (
                  <Text selectable key={columns[column]} style={styles.tableCell}>{value ?? 'NA'}</Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : <Text selectable style={styles.value}>No records available.</Text>}
    </View>
  );
}

const SafDetails = ({ route, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const { id } = route.params;
  const [safData, setSafData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerList, setOwnerList] = useState([]); // 👈 owners arrayconst
  const [floordata, setFloorData] = useState([]);
  const [taxDetails, setTaxDetails] = useState([]);
  const [transDtls, setTranDtls] = useState([]);
  const [memoDtls, setMemoDtls] = useState([]);
  const [tcVerfivication, setTcVerfivication] = useState([]);
  const [paymentDtls, setPaynemtDtls] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // View Demand Modal
  const [viewDemandVisible, setViewDemandVisible] = useState(false);
  const [demandlist, setDemandList] = useState(null);
  const [currentdemand, setCurrentDemand] = useState(null);
  const [maindata, setMaindata] = useState(null);
  const [showPayNow, setShowPayNow] = useState(false);

  const [docModalVisible, setDocModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [payNowModalVisible, setPayNowModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null);
  const [amount, setAmount] = useState('0.00');
  const [refNo, setRefNo] = useState('');
  const [chequeDate, setChequeDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [paymentReceiptVisible, setPaymentReceiptVisible] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  const paymentTypeData = [{ label: 'Full', value: 'Full' }];

  const paymentModeData = [
    { label: 'DD', value: 'DD' },
    { label: 'Cash', value: 'Cash' },
    { label: 'NEFT', value: 'NEFT' },
    { label: 'Cheque', value: 'ChEQUE' },
  ];
  const [isVisible, setIsVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [permissionData, setPermissionData] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const fetchedToken = await getToken();
        if (fetchedToken) {
          setToken(fetchedToken);
        }
      } catch (error) {
        console.error('Failed to load token:', error);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const handleView = id => {
    setIsVisible(true); // if you are opening a modal
    setSelectedData(id); // store it in state to use in modal
  };

  const viewdemand = async id => {
    try {
      if (!token) {
        return Alert.alert('Error', 'Token not found');
      }
      const response = await axios.post(
        SAF_DEMAND_API,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const demandList = response.data?.data?.demandList || [];
      const currentDeman = response.data?.data?.currentDemand;
      setMaindata(response.data?.data);
      setCurrentDemand(currentDeman);
      setDemandList(demandList);
      setViewDemandVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch demand');
    }
  };

  const documentview = async id => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const token = storedToken ? JSON.parse(storedToken) : null;

      if (!token) {
        Alert.alert('Error', 'Authentication token not found.');
        return;
      }

      const response = await axios.post(
        SAF_DOCUMENTS_API,
        { id }, // Send the document/property ID in body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const uploadedDocs = response.data?.data;
      setUploadedDocs(uploadedDocs); // <-- if using useState
      setDocModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch document list.');
    }
  };

  const handleViewReceipt = async tranDtlId => {
    try {
      if (!token) {
        console.warn('Token not found');
        return;
      }
      const response = await axios.post(
        SAF_RECEIPT_API,
        { id: tranDtlId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      setPaynemtDtls(response.data?.data);
      setPaynemtDtls(response.data?.data);
      setModalVisible(true);
      // setReceiptData(response.data?.data);
    } catch (error) {
      console.error(
        'Error fetching payment receipt:',
        error?.response || error,
      );
    }
  };

  const fetchSafDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        SAF_DETAILS_API,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const safData = response.data?.data;
      setWorkflowId(safData?.workflowId);
      setOwnerList(safData?.owners || []);
      setFloorData(safData?.floors || []);
      setTaxDetails(safData?.taxDtl || []);
      setTranDtls(safData?.tranDtls || []);
      setMemoDtls(safData?.memoDtls || []);

      setTcVerfivication(safData?.tcVerifications || []);
      setSafData(safData);
      console.log(safData, 'asbdsjaj');
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load property details. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPermission = async () => {
    try {
      const response = await axios.post(
        WORK_FLOW_PERMISSION,
        { wfId: workflowId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const permission = response.data?.data;
      if (permission) {
        setPermissionData(permission);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentTypeChange = item => {
    console.log('Payment Type selected:', item.value);
    setPaymentType(item.value);
  };

  const handlePaymentModeChange = item => {
    console.log('Payment Mode selected:', item.value);
    setPaymentMode(item.value);
  };

  // Update amount when maindata changes - MUST be before any conditional returns

  useEffect(() => {
    if (id && token) {
      fetchSafDetails();
    } else {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (maindata?.payableAmount) {
      setAmount(maindata.payableAmount.toString());
    }
  }, [maindata]);

  useEffect(() => {
    if (workflowId && token) fetchPermission();
  }, [workflowId, token]);

  const processPayment = async () => {
    try {
      const token = JSON.parse(await AsyncStorage.getItem('token'));
      if (!token) {
        Alert.alert('Error', 'Token not found');
        return false;
      }

      const paymentData = {
        id: id,
        paymentType: paymentType?.toUpperCase() || 'FULL',
        paymentMode: paymentMode?.toUpperCase() || 'CASH',
        chequeNo: paymentMode === 'Cash' ? '' : refNo || '',
        chequeDate:
          paymentMode === 'Cash'
            ? ''
            : chequeDate
            ? chequeDate.toISOString().split('T')[0]
            : '',
        bankName: paymentMode === 'Cash' ? '' : bankName || '',
        branchName: paymentMode === 'Cash' ? '' : branchName || '',
      };

      console.log('Processing payment:', paymentData);

      // Make payment API call
      const response = await axios.post(
        SAF_PAY_DEMAND_API,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // console.log('Payment API response:', response.data);

      if (response.data.status === true) {
        console.log(
          'Payment processed successfully, Transaction ID:',
          response.data.data?.tranId,
        );
        Alert.alert(
          'Success',
          response.data.message || 'Payment Successfully Done',
        );
        fetchSafDetails(); // Refresh details after payment
        viewdemand(id); // Refresh document list

        setModalVisible(true);
        handleViewReceipt(response.data.data?.tranId);

        return { success: true, tranId: response.data.data?.tranId };
      } else {
        Alert.alert('Payment Error', response.data.message || 'Payment failed');
        return { success: false };
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        error.response?.data?.message ||
          'Failed to process payment. Please try again.',
      );
      return { success: false };
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.headignColor} />
        <Text selectable
          style={{ marginTop: 10, fontSize: 16, color: Colors.headignColor }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: bottom + 12 }}>
      <HeaderNavigation />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text selectable style={styles.heading}>SAF {safData?.safNo ?? 'NA'}</Text>
          <Text selectable style={styles.value}>{safData?.appStatus ?? 'NA'}</Text>
          <Text selectable style={styles.value}>{safData?.assessmentType ?? 'NA'}</Text>
        </View>
        <DetailRows title="Application Details" fields={[
          ['SAF No', safData?.safNo],
          ['Apply Date', safData?.applyDate],
          ['Application Type', safData?.applicationFrom],
          ['Ward No', safData?.wardNo],
          ['Assessment Type', safData?.assessmentType],
          ['Property Type', safData?.propertyType],
          ['Ownership Type', safData?.ownershipType],
          ['Road Type', safData?.roadType],
          ['BPL Category', yesNo(safData?.isBpl)],
          ['Address', safData?.propAddress],
          ...(safData?.propertyType?.toLowerCase().includes('flat')
            ? [['Apartment Name', safData.apartmentName]] : []),
          ...(safData?.previousHoldingId && safData?.holdingNo
            ? [[
                'Old Holding No',
                safData.holdingNo,
                () => navigation.push('SafDetails', { id: safData.previousHoldingId }),
              ]] : []),
        ]} />
        <DetailTable title="Owner Details"
          columns={['SL', 'Owner', 'Gender', 'Guardian', 'Relation', 'Mobile', 'Address']}
          rows={ownerList.map((owner, index) => [
            index + 1, owner.ownerName, owner.gender, owner.guardianName,
            owner.relationType, owner.mobileNo, owner.address,
          ])}
        />
        <DetailRows title="Property Details" fields={[
          ['Khata No', safData?.khataNo], ['Plot No', safData?.plotNo],
          ['Village/Mauja Name', safData?.villageMaujaName],
          ['Area of Plot (in Sqft)', safData?.areaOfPlot],
        ]} />
        <DetailRows title="Property Address" fields={[
          ['Property Address', safData?.propAddress], ['City', safData?.propCity],
          ['Pin', safData?.propPinCode], ['State', safData?.propState],
          ['District', safData?.propDist],
          ['If Corresponding Address Different', yesNo(safData?.isCorrAddDiffer)],
        ]} />
        {isEnabled(safData?.isCorrAddDiffer) && (
          <DetailRows title="Correspondence Address" fields={[
            ['Correspondence Address', safData.corrAddress], ['City', safData.corrCity],
            ['Pin', safData.corrPinCode], ['State', safData.corrState],
            ['District', safData.corrDist],
          ]} />
        )}
        <DetailTable title="Floor Details"
          columns={['SL', 'Zone', 'Floor No', 'Usage Type', 'Occupancy Type',
            'Construction Type', 'Built Up Area (in Sq. Ft)', 'From Date', 'Upto Date']}
          rows={floordata.map((floor, index) => [
            index + 1, floor.zoneName, floor.floorName, floor.usageType,
            floor.occupancyName, floor.constructionType, floor.builtupArea,
            floor.dateFrom, floor.dateUpto,
          ])}
        />
        {Array.isArray(safData?.swmConsumer) && safData.swmConsumer.length > 0 && (
          <View style={styles.card}>
            <Text selectable style={styles.heading}>SWM Consumer Details</Text>
            {safData.swmConsumer.map((consumer, index) => (
              <View key={consumer.id ?? index}>
                <DetailRows title="Consumer No." fields={[
                  ['Consumer No.', consumer.consumerNo],
                  ['Occupancy Type', consumer.occupancyType], ['Category', consumer.category],
                  ['Sub Category', consumer.subCategoryType], ['Effective From', consumer.dateOfEffective],
                ]} />
                <DetailTable title="Owner(s)"
                  columns={['SL', 'Owner', 'Guardian', 'Relation', 'Mobile']}
                  rows={(consumer.owners ?? []).map((owner, ownerIndex) => [
                    ownerIndex + 1, owner.ownerName, owner.guardianName,
                    owner.relationType, owner.mobileNo,
                  ])}
                />
              </View>
            ))}
          </View>
        )}
        <DetailRows title="Additional Property Details" fields={[
          ['Does Property Have Mobile Tower(s)?', yesNo(safData?.isMobileTower)],
          ...(isEnabled(safData?.isMobileTower)
            ? [['Date of Installation of Mobile Tower', safData.towerInstallationDate]] : []),
          ['Widow/Abandoned/Mentally Disable/Visually Impaired?', yesNo(safData?.isWidow)],
          ['Ex-Army (Income Tax Exempted)?', yesNo(safData?.isExArmy)],
          ['Physically Disable?', yesNo(safData?.isDisabledPerson)],
          ['Old Property waived Off?', yesNo(safData?.isOldProperty)],
          ['Belongs to IHSDP?', yesNo(safData?.isDp)],
          ['Is School?', yesNo(safData?.isSchool)],
          ['Is Complex?', yesNo(safData?.isComplex)],
          ['Is Chabutra?', yesNo(safData?.isChabutra)],
          ['Holding Belongs To Shop?', yesNo(safData?.isShopHolding)],
        ]} />
        <DetailTable title="Tax Details"
          columns={['SL', 'ARV', 'Effect From', 'Holding Tax', 'Composite Tax',
            'Water Tax', 'Conservancy/Latrine Tax', 'Education Cess', 'RWH Penalty', 'Yearly Tax']}
          rows={taxDetails.map((tax, index) => [
            index + 1, tax.arv, tax.fyear, tax.holdingTax, tax.compositeTax,
            tax.rwhTax, tax.latrineTax, tax.educationCess, tax.rwhTax, tax.propertyTax,
          ])}
        />

        {transDtls.length > 0 && (
          <View style={styles.card}>
            <Text selectable style={styles.heading}>Payment Details</Text>

            <ScrollView horizontal>
              <View>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>SL</Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Transaction No
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Payment Mode
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Date
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    From Qtr / Year
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Upto Qtr / Year
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Amount
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    View
                  </Text>
                </View>

                {/* Table Body */}
                {transDtls.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text selectable style={styles.tableCell}>{index + 1}</Text>
                    <Text selectable style={styles.tableCell}>{item?.tranNo ?? 'NA'}</Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.paymentMode ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.tranDate
                        ? new Date(item.tranDate).toLocaleDateString('en-GB')
                        : 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.fromQtr ?? 'NA'} / {item?.fromFyear ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.uptoQtr ?? 'NA'} / {item?.uptoFyear ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.payableAmt ?? 'NA'}
                    </Text>

                    <CopyableTouchableOpacity
                      onPress={() => handleViewReceipt(item.id)}
                    >
                      <Text style={[styles.tableCell, { color: 'blue' }]}>
                        View
                      </Text>
                    </CopyableTouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {tcVerfivication.length > 0 && (
          <View style={styles.card}>
            <Text selectable style={styles.heading}>Field Verification</Text>

            <ScrollView horizontal>
              <View>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>SL</Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Transaction No
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Payment Mode
                  </Text>

                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    View
                  </Text>
                </View>

                {/* Table Body */}
                {tcVerfivication.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text selectable style={styles.tableCell}>{index + 1}</Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.verifiedBy ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item?.towerInstallationDate ?? 'NA'}
                    </Text>

                    <CopyableTouchableOpacity onPress={() => handleView(item.id)}>
                      <Text style={{ color: 'blue' }}>View</Text>
                    </CopyableTouchableOpacity>

                    {/* TC Verification Modal */}
                    <TCVerificationModal
                      visible={isVisible}
                      onClose={() => setIsVisible(false)}
                      id={selectedData}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        {Array.isArray(memoDtls) && memoDtls.length > 0 && (
          <View style={styles.card}>
            <Text selectable style={styles.heading}>Memo Details</Text>

            <ScrollView horizontal>
              <View>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>SL</Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Memo No
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Memo Type
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Holding No
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Quarter
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Financial Year
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Quarterly Tax
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    Created At
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    User Name
                  </Text>
                  <Text selectable style={[styles.tableCell, styles.headerText]}>
                    User Name
                  </Text>
                </View>

                {/* Table Rows */}
                {memoDtls.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text selectable style={styles.tableCell}>{index + 1}</Text>
                    <Text selectable style={styles.tableCell}>{item.memoNo ?? 'NA'}</Text>
                    <Text selectable style={styles.tableCell}>
                      {item.memoType ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item.holdingNo ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>{item.qtr ?? 'NA'}</Text>
                    <Text selectable style={styles.tableCell}>{item.fyear ?? 'NA'}</Text>
                    <Text selectable style={styles.tableCell}>
                      {item.quarterlyTax ?? 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-GB')
                        : 'NA'}
                    </Text>
                    <Text selectable style={styles.tableCell}>
                      {item.userName ?? 'NA'}
                    </Text>
                    <CopyableTouchableOpacity
                      style={styles.button}
                      onPress={() => setVisible(true)}
                    >
                      <Text style={styles.buttonText}>View</Text>
                    </CopyableTouchableOpacity>

                    <PropertyTaxNoticeModal
                      visible={visible}
                      onClose={() => setVisible(false)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {Array.isArray(safData?.levelRemarks) && safData.levelRemarks.length > 0 && (
          <DetailTable title="Level Remarks"
            columns={['Role', 'Action', 'User', 'Remarks', 'Date']}
            rows={safData.levelRemarks.map(item => [
              item.senderRole, item.actions, item.senderUserName, item.senderRemarks,
              item.createdAt ? new Date(item.createdAt).toLocaleString() : null,
            ])}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.secondaryActions}>
          <CopyableTouchableOpacity
            accessibilityRole="button"
            onPress={() => documentview(id)}
            style={styles.actionBtn}
          >
            <Icon name="description" size={20} color="#1e3a5f" />
            <Text style={styles.actionBtnText}>View Document</Text>
          </CopyableTouchableOpacity>
          {safData?.paymentStatus == 0 && (
            <CopyableTouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setShowPayNow(false);
                setViewDemandVisible(true);
                viewdemand(id);
              }}
              style={styles.actionBtn}
            >
              <Icon name="receipt" size={20} color="#1e3a5f" />
              <Text style={styles.actionBtnText}>View Demand</Text>
            </CopyableTouchableOpacity>
          )}
        </View>
        {safData?.paymentStatus == 0 && (
          <CopyableTouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              setShowPayNow(true);
              setViewDemandVisible(true);
              viewdemand(id);
            }}
            style={[styles.actionBtn, styles.paymentAction]}
          >
            <Icon name="payment" size={21} color="#fff" />
            <Text style={[styles.actionBtnText, styles.paymentActionText]}>
              Proceed to Payment
            </Text>
          </CopyableTouchableOpacity>
        )}
      </View>
      <PayNowModal
        visible={payNowModalVisible}
        onClose={() => setPayNowModalVisible(false)}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        amount={amount}
        setAmount={setAmount}
        refNo={refNo}
        setRefNo={setRefNo}
        chequeDate={chequeDate}
        setChequeDate={setChequeDate}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        bankName={bankName}
        setBankName={setBankName}
        branchName={branchName}
        setBranchName={setBranchName}
        onProceed={async () => {
          console.log('Submitting:', {
            paymentType,
            paymentMode,
            amount,
          });

          // Close payment modal first
          setPayNowModalVisible(false);

          // Process the payment
          const paymentResult = await processPayment();

          if (paymentResult.success) {
            // Store transaction ID for receipt
            setTransactionId(paymentResult.tranId);

            // Refresh demand data after payment
            await viewdemand(id);

            // Check if all demand values are now 0 (payment completed)
            setTimeout(() => {
              const allValuesZero = demandlist?.every(item => {
                const totalDue =
                  parseFloat(item.dueHoldingTax || 0) +
                  parseFloat(item.dueLatrineTax || 0) +
                  parseFloat(item.dueWaterTax || 0) +
                  parseFloat(item.dueHealthCessTax || 0) +
                  parseFloat(item.dueEducationCessTax || 0) +
                  parseFloat(item.dueRwhTax || 0) +
                  parseFloat(item.monthlyPenalty || 0);
                return totalDue === 0;
              });

              // Always show receipt after successful payment, regardless of demand data
              setPaymentCompleted(true);
              setViewDemandVisible(false); // Close demand modal
              setPaymentReceiptVisible(true); // Show receipt

              if (
                allValuesZero ||
                parseFloat(maindata?.payableAmount || 0) === 0
              ) {
                console.log(
                  'Payment completed - all demand values are now zero',
                );
              }
            }, 500); // Small delay to ensure data is updated
          }
        }}
      />

      {/* View Demand Modal */}
      <ViewDemandModal
        visible={viewDemandVisible}
        onClose={() => setViewDemandVisible(false)}
        demandlist={demandlist}
        maindata={maindata}
        showPayNow={showPayNow}
        onPayNowPress={() => {
          console.log('Pay Now Clicked');
          setPayNowModalVisible(true);
        }}
      />

      <PaymentReceiptModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        paymentDtls={paymentDtls}
      />
      <DocumentViewModal
        visible={docModalVisible}
        onClose={() => setDocModalVisible(false)}
        uploadedDocs={uploadedDocs}
        onDocumentPress={doc => {
          setSelectedDoc(doc);
          setSelectedImageUri(doc.docPath);
          setImageLoading(true);
          setImageModalVisible(true);
        }}
      />

      {/* Full-screen Image/PDF Modal */}
      <ImageViewModal
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        imageUri={selectedImageUri}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
      />
    </ScrollView>
  );
};

export default SafDetails;

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 16,
    margin: 12,
    elevation: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.background,
    backgroundColor: Colors.headignColor,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
  },
  rowTable: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  labelFixed: {
    fontSize: 13,
    marginVertical: 2,
    fontWeight: '600',
    color: '#555',
    width: 120,
  },
  value: {
    flex: 1,
    color: '#222',
  },
  headerRow: {
    backgroundColor: Colors.textSecondary,
  },
  cell: {
    minWidth: 70,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 10,
    color: '#333',
    borderRightWidth: 0.5,
    borderColor: '#ccc',
  },
  containerdue: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    margin: 12,
    elevation: 4,
    paddingBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexWrap: 'nowrap',
  },

  tableHeader: {
    backgroundColor: '#f0f0f0',
  },

  tableCell: {
    width: 120,
    padding: 4,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#ccc',
    fontSize: 10,
    color: '#000',
    flex: 1,
  },

  headerText: {
    fontWeight: 'bold',
    color: '#fff',
  },

  docModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docModalContent: {
    backgroundColor: '#fff',
    width: '95%',
    maxHeight: '85%',
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  docModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#222',
  },
  docTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  docTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  docCellHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  docCell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  docFileLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  docCloseButton: {
    backgroundColor: '#007bff',
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  docCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkValue: { color: '#1d4ed8' },
  buttonContainer: {
    gap: 10,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dce5ef',
    backgroundColor: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d4dfed',
    backgroundColor: '#f3f7fc',
  },
  actionBtnText: {
    flexShrink: 1,
    color: '#1e3a5f',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  paymentAction: {
    flexBasis: 'auto',
    borderColor: '#154e80',
    backgroundColor: '#154e80',
  },
  paymentActionText: { color: '#fff', fontSize: 15 },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    maxHeight: '95%',
    width: '95%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 8,
    backgroundColor: '#ffffffff',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    width: '60%',
  },
  value: {
    fontWeight: 'bold',
    color: '#000',
    width: '50%',
    display: 'flex',
    textAlign: 'right',
  },
  penaltyBox: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    marginBottom: 10,
  },
  rebateBox: {
    backgroundColor: '#e6ffe6',
    padding: 10,
    marginBottom: 10,
  },
  totalPayableBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    padding: 10,
    marginTop: 10,
  },
  totalPayableLabel: {
    fontWeight: 'bold',
  },
  totalPayableAmount: {
    fontWeight: 'bold',
    color: '#d9534f',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    minWidth: 1200,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    backgroundColor: '#003366',
  },
  tableSubHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableFooter: {
    backgroundColor: 'white',
  },
  payNowButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  payNowButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullScreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeFullScreenButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  fullScreenScrollView: {
    flex: 1,
    width: '100%',
  },
  fullScreenScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 100,
  },
});
