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
import { TCVerificationModal } from '../Saf/Models/TCVerificationModal';
import PropertyTaxNoticeModal from '../Saf/Models/PropertyTaxNoticeModal';
import React from 'react';
import Colors from '../../Constants/Colors';
import { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import {
  PayNowModal,
  ViewDemandModal,
  PaymentReceiptModal,
  DocumentViewModal,
  ImageViewModal,
  api,
} from './Model/Model';
import { getToken } from '../../../utils/auth';
import { HOLDIGN_API_ROUTES } from '../../../api/apiRoutes';
const yesNo = value => [true, 1, '1', 'true'].includes(value) ? 'Yes' : 'No';

function HoldingFields({ title, fields, notice }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{title}</Text>
      {notice ? <Text accessibilityRole="alert" style={styles.assessmentNotice}>{notice}</Text> : null}
      {fields.map(([label, value, onPress]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.labelFixed}>{label}</Text>
          <Text onPress={onPress} style={[styles.value, onPress && styles.fieldLink]}>
            {value ?? 'NA'}
          </Text>
        </View>
      ))}
    </View>
  );
}

function HoldingTable({ title, columns, rows, note }) {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>{title}</Text>
      {note ? <Text style={styles.value}>{note}</Text> : null}
      {rows.length > 0 ? (
        <ScrollView horizontal>
          <View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              {columns.map(column => (
                <Text key={column} style={[styles.tableCell, styles.headerText]}>{column}</Text>
              ))}
            </View>
            {rows.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                {row.map((value, column) => (
                  <Text key={columns[column]} style={styles.tableCell}>{value ?? 'NA'}</Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : <Text style={styles.value}>No records available.</Text>}
    </View>
  );
}

const HoldingDetails = ({ route, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const { id } = route.params;
  console.log(id, 'holdign id');
  const [holdingData, setHoldingData] = useState('');
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
    { label: 'Online', value: 'Online' },
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
  ];
  const [isVisible, setIsVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [permissionData, setPermissionData] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchSafDetails = async () => {
      setLoading(true);
      try {
        const token = await getToken();

        const response = await axios.post(
          HOLDIGN_API_ROUTES.DETAILS_API,
          { id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const responseData = response?.data?.data;

        console.log('API Response Data:', responseData);

        // Set both state variables with the same data
        setHoldingData(responseData);
        setSafData(responseData);

        setWorkflowId(responseData?.workflowId);
        setOwnerList(responseData?.owners || []);
        setFloorData(responseData?.floors || []);
        setTaxDetails(responseData?.taxDtl || []);
        setTranDtls(responseData?.tranDtls || []);
        setMemoDtls(responseData?.memoDtls || []);
        setTcVerfivication(responseData?.tcVerifications || []);
      } catch (error) {
        console.error('fetchSafDetails error:', error);
        Alert.alert(
          'Error',
          'Failed to load property details. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSafDetails();
    }
  }, [id, token]); // ✅ depend on id only

  useEffect(() => {
    const loadToken = async () => {
      try {
        const fetchedToken = await getToken();
        console.log(fetchedToken, 'get token');
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
      const token = await getToken(); // ✅ get auth token first

      const response = await axios.post(
        HOLDIGN_API_ROUTES.DEMAND_API,
        { id }, // ✅ send id in body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ API structure: { status, message, data }
      const responseData = response?.data?.data;
      console.log('Demand API Response:', responseData);

      const demandList = responseData?.demandList || [];
      const currentDemand = responseData?.currentDemand || null;

      setMaindata(responseData);
      setCurrentDemand(currentDemand);
      setDemandList(demandList);
      setViewDemandVisible(true);
    } catch (error) {
      console.error(
        'viewdemand error:',
        error?.response?.data || error.message,
      );
      Alert.alert('Error', 'Unable to fetch demand');
    }
  };

  const documentview = async id => {
    try {
      const response = await api.getUploadedDocs(id);
      const uploadedDocs = response?.data;
      setUploadedDocs(uploadedDocs);
      setDocModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch document list.');
    }
  };

  // const handleViewReceipt = async tranDtlId => {
  //   try {
  //     const response = await api.getPaymentReceipt(tranDtlId);
  //     setPaynemtDtls(response?.data);
  //     setModalVisible(true);
  //   } catch (error) {
  //     console.error(
  //       'Error fetching payment receipt:',
  //       error?.response || error,
  //     );
  //   }
  // };
  const handleViewReceipt = async tranDtlId => {
    console.log('trans is', tranDtlId);
    try {
      setLoading(true);

      const response = await axios.post(HOLDIGN_API_ROUTES.RECEIPT_API, {
        id: tranDtlId, // sending transaction ID in body
      });

      setPaynemtDtls(response?.data.data);
      setModalVisible(true);
    } catch (error) {
      console.error(
        'Error fetching payment receipt:',
        error?.response || error,
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

  // useEffect(() => {
  //   if (id && token) {
  //     fetchSafDetails();
  //   } else {
  //     setLoading(false);
  //   }
  // }, [id, token]);

  useEffect(() => {
    if (maindata?.payableAmount) {
      setAmount(maindata.payableAmount.toString());
    }
  }, [maindata]);

  useEffect(() => {
    if (workflowId && token) fetchPermission();
  }, [workflowId, token]);

  const processPayment = async () => {
    const token = await getToken();
    try {
      const paymentData = {
        id: id, // e.g. 143
        paymentType: paymentType?.toUpperCase() || 'FULL',
        paymentMode: paymentMode?.toUpperCase() || 'CASH',
        amount: amount || '0.00', // make sure you pass this too
        chequeNo: paymentMode === 'CASH' ? '' : refNo || '',
        chequeDate:
          paymentMode === 'CASH'
            ? ''
            : chequeDate
            ? chequeDate.toISOString().split('T')[0]
            : '',
        bankName: paymentMode === 'CASH' ? '' : bankName || '',
        branchName: paymentMode === 'CASH' ? '' : branchName || '',
      };

      const response = await axios.post(
        HOLDIGN_API_ROUTES.PAY_DEMAND_API,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('my data resposne of apyment', response.data.status);
      if (response.data?.status === true) {
        Alert.alert(
          'Success',
          response.data.message || 'Payment Successfully Done',
        );
        return { success: true, tranId: response.data?.data?.tranId };
      } else {
        Alert.alert(
          'Payment Error',
          response.data?.message || 'Payment failed',
        );
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
        <Text
          style={{ marginTop: 10, fontSize: 16, color: Colors.headignColor }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  const isLocked = yesNo(safData?.lockStatus) === 'Yes';

  const openDemand = showPayment => {
    setShowPayNow(showPayment);
    setViewDemandVisible(true);
    viewdemand(id);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: bottom + 12 }}
    >
      <HeaderNavigation />
      <View style={styles.container}>
        <HoldingFields title="Property Details"
          notice={safData?.isAssessmentDue === true
            ? 'Assessment is due' + (safData.lastAssessmentYear ? ' (last assessed: ' + safData.lastAssessmentYear + ')' : '')
            : null}
          fields={[
            ['Ward No', safData?.wardNo], ['New Holding No', safData?.newHoldingNo],
            ['Old Holding No', safData?.holdingNo],
            ['SAF No', safData?.safNo, safData?.safDetailId
              ? () => navigation.navigate('SafDetails', { id: safData.safDetailId }) : undefined],
            ['Assessment Type', safData?.assessmentType], ['Last Assessment Year', safData?.lastAssessmentYear],
            ['Plot No', safData?.plotNo], ['Property Type', safData?.propertyType],
            ['Area of Plot (In Sqft)', safData?.areaOfPlot], ['Ownership Type', safData?.ownershipType],
            ['Rain Water Harvesting', yesNo(safData?.rainWaterHarvesting)],
            ['Holding Type', safData?.holdingType], ['Address', safData?.propAddress],
            ...(safData?.assessmentType?.toLowerCase() === 'mutation' ? []
              : [['Road Type', safData?.roadType]]),
          ]}
        />
        <HoldingTable title="Owner Details"
          columns={['SL', 'Owner', 'Guardian', 'Relation', 'Mobile', 'Email', 'Aadhar No',
            'PAN No', 'Gender', 'Dob', 'Armed Force', 'Specially Abled']}
          rows={ownerList.map((owner, index) => [
            index + 1, owner.ownerName, owner.guardianName, owner.relationType,
            owner.mobileNo, owner.email, owner.aadharNo, owner.panNo, owner.gender,
            owner.dob, yesNo(owner.isArmedForce).toUpperCase(),
            yesNo(owner.isSpeciallyAbled).toUpperCase(),
          ])}
        />
        <HoldingFields title="Property Details" fields={[
          ['Khata No', safData?.khataNo], ['Plot No', safData?.plotNo],
          ['Village/Mauja Name', safData?.villageMaujaName],
          ['Area of Plot (in Decimal)', safData?.areaOfPlot],
        ]} />
        <HoldingFields title="Property Address" fields={[
          ['Property Address', safData?.propAddress], ['City', safData?.propCity],
          ['Pin', safData?.propPinCode], ['State', safData?.propState],
          ['District', safData?.propDist],
          ['If Corresponding Address Different', yesNo(safData?.isCorrAddDiffer)],
        ]} />
        {yesNo(safData?.isCorrAddDiffer) === 'Yes' && (
          <HoldingFields title="Correspondence Address" fields={[
            ['Correspondence Address', safData.corrAddress], ['City', safData.corrCity],
            ['Pin', safData.corrPinCode], ['State', safData.corrState], ['District', safData.corrDist],
          ]} />
        )}
        <HoldingTable title="Floor Details"
          note="Built Up refers to the entire carpet area along with the thickness of the external walls, internal walls, and columns."
          columns={['SL', 'Floor No', 'Usage Type', 'Occupancy Type', 'Construction Type',
            'Built Up Area (in Sq. Ft)', 'From Date', 'Upto Date (Leave blank for current date)']}
          rows={floordata.map((floor, index) => [
            index + 1, floor.floorName, floor.usageType, floor.occupancyName,
            floor.constructionType, floor.builtupArea, floor.dateFrom, floor.dateUpto ?? '',
          ])}
        />
        <HoldingFields title="Additional Property Details" fields={[
          ['Does Property Have Mobile Tower(s)?', yesNo(safData?.isMobileTower)],
          ...(yesNo(safData?.isMobileTower) === 'Yes'
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
        {Array.isArray(safData?.additionalDoc) && safData.additionalDoc.length > 0 && (
          <HoldingTable title="Additional Document"
            columns={['SL', 'Document Name', 'File']}
            rows={safData.additionalDoc.map((doc, index) => [
              index + 1, doc.documentName, doc.docPath ? (
                <Text
                  accessibilityRole="link"
                  style={{ color: '#1d4ed8' }}
                  onPress={() => Linking.openURL(doc.docPath).catch(() =>
                    Alert.alert('Unable to open document'),
                  )}
                >View</Text>
              ) : 'No file',
            ])}
          />
        )}
        <HoldingTable title="Tax Details"
          columns={['SL', 'ARV', 'Effect From', 'Property Tax', 'Holding Tax',
            'Composite Tax', 'Water Tax', 'Education Cess', 'RWH Penalty']}
          rows={taxDetails.map((tax, index) => [
            index + 1, tax.arv, tax.fyear, tax.propertyTax, tax.holdingTax,
            tax.compositeTax, tax.waterTax, tax.educationCess, tax.rwhTax,
          ])}
        />
        {transDtls.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.heading}>Payment Details</Text>

            <ScrollView horizontal>
              <View>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.headerText]}>SL</Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    Transaction No
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    Payment Mode
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    Date
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    From Qtr / Year
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    Upto Qtr / Year
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    Amount
                  </Text>
                  <Text style={[styles.tableCell, styles.headerText]}>
                    View
                  </Text>
                </View>

                {/* Table Body */}
                {transDtls.map((item, index) => (
                  <View style={styles.tableRow} key={index}>
                    <Text style={styles.tableCell}>{index + 1}</Text>
                    <Text style={styles.tableCell}>{item?.tranNo ?? 'NA'}</Text>
                    <Text style={styles.tableCell}>
                      {item?.paymentMode ?? 'NA'}
                    </Text>
                    <Text style={styles.tableCell}>
                      {item?.tranDate
                        ? new Date(item.tranDate).toLocaleDateString('en-GB')
                        : 'NA'}
                    </Text>
                    <Text style={styles.tableCell}>
                      {item?.fromQtr ?? 'NA'} / {item?.fromFyear ?? 'NA'}
                    </Text>
                    <Text style={styles.tableCell}>
                      {item?.uptoQtr ?? 'NA'} / {item?.uptoFyear ?? 'NA'}
                    </Text>
                    <Text style={styles.tableCell}>
                      {item?.payableAmt ?? 'NA'}
                    </Text>

                    <TouchableOpacity
                      onPress={() => handleViewReceipt(item.id)}
                    >
                      <Text style={[styles.tableCell, { color: 'blue' }]}>
                        View
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {Array.isArray(safData?.swm) && safData.swm.length > 0 && (
          <HoldingTable title="SWM Details"
            columns={['SL', 'Consumer No.', 'Owner Name', 'Guardian Name', 'Mobile No', 'Address']}
            rows={safData.swm.map((item, index) => [
              index + 1, item.consumerNo, item.ownerName, item.guardianName, item.mobileNo, item.address,
            ])}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isLocked}
          style={[styles.actionBtn, isLocked && styles.disabledButton]}
          onPress={() => openDemand(false)}
        >
          <Text style={styles.actionBtnText}>View Demand</Text>
        </TouchableOpacity>
        {yesNo(safData?.userPermission?.canTakePayment) === 'Yes' && (
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isLocked}
            style={[styles.actionBtn, isLocked && styles.disabledButton]}
            onPress={() => openDemand(true)}
          >
            <Text style={styles.actionBtnText}>Proceed Payment</Text>
          </TouchableOpacity>
        )}
        {safData?.safDetailId != null && (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.actionBtn}
            onPress={() => navigation.navigate('SafDetails', { id: safData.safDetailId })}
          >
            <Text style={styles.actionBtnText}>View SAF</Text>
          </TouchableOpacity>
        )}
        {yesNo(safData?.userPermission?.canAdd) === 'Yes' && (
          <>
            {[
              ['ReAssessment', { isRessessment: true }],
              ['Mutation', { isMutation: true }],
            ].map(([label, mode]) => (
              <TouchableOpacity
                key={label}
                accessibilityRole="button"
                disabled={isLocked}
                style={[styles.actionBtn, isLocked && styles.disabledButton]}
                onPress={() => navigation.navigate('ApplyAssessmentComponentized', {
                  id, ...mode, safData, ownerList, taxDetails, transDtls,
                  memoDtls, tcVerfivication, paymentDtls,
                })}
              >
                <Text style={styles.actionBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
      <PayNowModal
        visible={payNowModalVisible}
        onClose={() => setPayNowModalVisible(false)}
        paymentTypeData={paymentTypeData}
        paymentModeData={paymentModeData}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
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
        amount={amount}
        setAmount={setAmount}
        onProceed={async () => {
          if (!paymentType || !paymentMode) {
            Alert.alert('Validation Error', 'Please fill all required fields');
            return;
          }
          if (paymentMode !== 'Cash' && (!refNo || !bankName || !branchName)) {
            Alert.alert('Validation Error', 'Please fill all payment details');
            return;
          }
          setPayNowModalVisible(false);
          const paymentResult = await processPayment();
          if (paymentResult.success) {
            setTransactionId(paymentResult.tranId);
            await viewdemand(id);
            setTimeout(() => {
              setPaymentCompleted(true);
              setViewDemandVisible(false);
              setPaymentReceiptVisible(true);
            }, 500);
          }
        }}
      />

      <ViewDemandModal
        visible={viewDemandVisible}
        onClose={() => setViewDemandVisible(false)}
        demandlist={demandlist}
        maindata={maindata}
        showPayNow={showPayNow}
        onPayNowPress={() => setPayNowModalVisible(true)}
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
          const fileExtension = doc.docPath.split('.').pop().toLowerCase();
          if (fileExtension === 'pdf') {
            Alert.alert(
              'PDF Document',
              'PDF files will open in external viewer',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open', onPress: () => Linking.openURL(doc.docPath) },
              ],
            );
          } else {
            setSelectedDoc(doc);
            setSelectedImageUri(doc.docPath);
            setImageLoading(true);
            setImageModalVisible(true);
          }
        }}
      />

      <ImageViewModal
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        selectedImageUri={selectedImageUri}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        visible={paymentReceiptVisible}
        onClose={() => {
          setPaymentReceiptVisible(false);
          setPaymentCompleted(false);
          setTransactionId(null);
          // Reset payment form
          setPaymentType(null);
          setPaymentMode(null);
          setRefNo('');
          setBankName('');
          setBranchName('');
          setChequeDate(null);
        }}
        paymentDtls={{
          tranNo: transactionId ? `TXN-${transactionId}` : 'PMT-' + Date.now(),
          tranDate: new Date().toLocaleDateString('en-GB'),
          paymentMode: paymentMode || 'Online',
          payableAmt: amount,
        }}
      />
    </ScrollView>
  );
};

export default HoldingDetails;

const styles = StyleSheet.create({
  assessmentNotice: { color: '#991b1b', backgroundColor: '#fef2f2', padding: 8 },
  fieldLink: { color: '#1d4ed8' },
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
    width: '100%',
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
    fontWeight: 'bold',
    color: '#000',
    width: '50%',
    display: 'flex',
    textAlign: 'right',
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

  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d2a7e',
    marginBottom: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoCircle: {
    fontSize: 30,
  },
  corpName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  receiptType: {
    alignSelf: 'center',
    marginVertical: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    marginVertical: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 15,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 6,
  },
  tableRowModal: {
    flexDirection: 'row',
    padding: 6,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  col: {
    flex: 1,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  qrBox: {
    width: 90,
    height: 90,
    backgroundColor: '#ccc',
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 13,
    marginBottom: 2,
  },
  generatedNote: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 8,
    alignItems: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  actionBtn: {
    width: 85,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginLeft: 5,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
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

  // label: {
  //   fontWeight: '600',
  //   width: '60%',
  // },
  value: {
    fontWeight: 'bold',
    color: '#000',
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
