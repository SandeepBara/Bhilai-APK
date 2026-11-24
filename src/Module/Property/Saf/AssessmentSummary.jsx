import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../Constants/Colors';
import axios from 'axios';
import { SAF_API_ROUTES } from '../../../api/apiRoutes'; // make sure this is your API route
import { getToken } from '../../../utils/auth';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import Clipboard from '@react-native-clipboard/clipboard';
// OR for newer versions:

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

function Fields({ fields }) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.grid}>
      {fields.map(([label, value]) => (
        <View key={label} style={[
          styles.field,
          (width < 360 || String(value ?? '').length > 40) && styles.fullField,
        ]}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{value == null || value === '' ? '—' : value}</Text>
        </View>
      ))}
    </View>
  );
}

function PreviewTable({ columns, rows, emptyMessage }) {
  if (!rows.length) return emptyMessage ? <Text>{emptyMessage}</Text> : null;

  return (
    <ScrollView horizontal style={styles.table} showsHorizontalScrollIndicator>
      <View>
        {[columns, ...rows].map((row, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableStripe]}>
            {row.map((value, column) => (
              <Text key={columns[column]} style={[
                styles.tableCell,
                columns[column] === 'SL' && styles.numberCell,
                column === row.length - 1 && styles.lastCell,
                index === 0 && styles.tableHeading,
              ]}>
                {value ?? ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const checked = value => value === true || value === 1 || value === '1';

function PreviewDetails({ data, masters, apartments }) {
  const label = (list, id, field) =>
    masters[list]?.find(item => String(item.id) === String(id))?.[field];
  const apartment = apartments.find(
    item => String(item.value) === String(data.appartmentDetailsId),
  );
  const flags = [
    ['Have Mobile Tower(s)?', data.isMobileTower],
    ['Widow/Abandoned/Mentally Disabled/Visually Impaired?', data.isWidow],
    ['Ex-Army (Income Tax Exempted)?', data.isExArmy],
    ['Physically Disabled?', data.isDisabledPerson],
    ['Old Property Waived Off in 2026–2027', data.isOldProperty],
    ['Belongs to IHSDP?', data.isDp],
    ['Is School?', data.isSchool],
    ...(checked(data.isSchool) ? [['Is 12A School?', data.is12ASchool]] : []),
    ['Is Complex?', data.isComplex],
    ['Is Chabutra?', data.isChabutra],
    ['Holding Belongs to Shop?', data.isShopHolding],
  ].map(([name, value]) => [name, checked(value) ? 'YES' : 'NO']);

  if (checked(data.isMobileTower) && data.towerInstallationDate) {
    flags.splice(1, 0, ['Installation Date', data.towerInstallationDate]);
  }

  return (
    <>
      <Section title="Assessment Information">
        <Fields fields={[
          ['Application Type', data.applicationFrom],
          ['Assessment Type', data.assessmentType || 'New Assessment'],
          ['Ward No', label('wardList', data.wardMstrId, 'wardNo')],
          ['Ownership Type', label('ownershipType', data.ownershipTypeMstrId, 'ownershipType')],
          ['Property Type', label('propertyType', data.propTypeMstrId, 'propertyType')],
          ...(Number(data.propTypeMstrId) === 3 ? [['Apartment Name', apartment?.label]] : []),
          ['Road Type', label('roadType', data.roadTypeMstrId, 'roadType')],
          ['BPL Category', checked(data.isBpl) ? 'YES' : 'NO'],
        ]} />
      </Section>
      <Section title="Owner Details">
        <PreviewTable
          columns={['SL', 'Name', 'Gender', 'Guardian Name', 'Relation', 'Mobile No.', 'Address']}
          rows={(data.ownerDtl ?? []).map((owner, index) => [
            index + 1, owner.ownerName, owner.gender, owner.guardianName,
            owner.relationType, owner.mobileNo, owner.address,
          ])}
          emptyMessage="No owner details provided."
        />
      </Section>
      <Section title="Property Details">
        <Fields fields={[
          ['Khata No.', data.khataNo],
          ['Plot No.', data.plotNo],
          ['Village/Mauja Name', data.villageMaujaName],
          ['Area of Plot (in Sqft)', data.areaOfPlot],
        ]} />
      </Section>
      <Section title="Property Address">
        <Fields fields={[
          ['Property Address', data.propAddress], ['City', data.propCity],
          ['District', data.propDist], ['State', data.propState],
          ['Pincode', data.propPinCode],
        ]} />
        {checked(data.isCorrAddDiffer) && (
          <>
            <Text style={styles.subheading}>Correspondence Address</Text>
            <Fields fields={[
              ['Correspondence Address', data.corrAddress], ['City', data.corrCity],
              ['District', data.corrDist], ['State', data.corrState],
              ['Pincode', data.corrPinCode],
            ]} />
          </>
        )}
      </Section>
      <Section title="Floor Details">
        <PreviewTable
          columns={[
            'SL', 'Zone', 'Floor', 'Usage Type', 'Occupancy Type',
            'Construction Type', 'Builtup Area', 'Date From', 'Date Upto',
          ]}
          rows={(data.floorDtl ?? []).map((floor, index) => [
            index + 1,
            label(masters.zoneType ? 'zoneType' : 'zone', floor.zoneMstrId, 'zoneName'),
            label('floorType', floor.floorMasterId, 'floorName'),
            label('usageType', floor.usageTypeMasterId, 'usageType'),
            label('occupancyType', floor.occupancyTypeMasterId, 'occupancyName'),
            label('constructionType', floor.constructionTypeMasterId, 'constructionType'),
            floor.builtupArea, floor.dateFrom, floor.dateUpto,
          ])}
          emptyMessage="No floor details provided."
        />
      </Section>
      <Section title="Additional Details">
        <Fields fields={flags} />
      </Section>
    </>
  );
}

const amount = value => Number(value ?? 0).toFixed(2);

function TaxHistory({ tax }) {
  const eras = Array.isArray(tax?.ruleSetVersionTax)
    ? tax.ruleSetVersionTax.filter(era => era?.floors?.length || era?.taxDiff?.length)
    : [];
  eras.sort((a, b) =>
    String(a.effectiveFromFyear ?? '').localeCompare(String(b.effectiveFromFyear ?? '')),
  );

  if (!eras.length) return <Text>No tax details available.</Text>;

  return eras.map((era, index) => (
    <View key={index} style={styles.taxEra}>
      {era.floors?.length > 0 && (
        <>
          <Text style={styles.subheading}>
            Annual Rental Value as per the rate of {era.effectiveFromFyear}
          </Text>
          <PreviewTable
            columns={[
              'Code', 'Floor Name', 'Construction Date', 'Effect From',
              'Built-up Area', 'Rate', 'Total ARV', 'Widow & Others',
              '10% Rebate on ARV', 'Old House Discount (%)',
              '25% Disability Discount', 'Net ARV',
            ]}
            rows={era.floors.map(floor => [
              floor.code, floor.floorName, floor.dateFrom,
              floor.fromFYear ?? era.effectiveFromFyear,
              floor.builtupArea, floor.arvRate, amount(floor.yearlyARV),
              '0.00', amount(floor.aRV10PercentRebate), '0.00', '0.00', amount(floor.aRV),
            ])}
          />
        </>
      )}
      <PreviewTable
        columns={[
          'Effect From', 'ARV', 'Rate (%)', 'Property Tax', 'Composite Tax',
          'Common Water Tax', 'Personal Water Tax', 'Education Cess', 'Yearly Tax',
        ]}
        rows={(era.taxDiff ?? []).map(year => [
          year.year ? `FY:${year.year}` : '', amount(year.aRV),
          amount(year.ratePercent), amount(year.holdingTax), amount(year.compositeTax),
          amount(year.waterTax), '0.00', amount(year.educationCessTax), amount(year.totalTax),
        ])}
      />
    </View>
  ));
}

const AssessmentSummary = ({ route, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const [copiedSafNo, setCopiedSafNo] = useState(''); // ✅ add this
  const [modalVisible, setModalVisible] = useState(false);
  const data = route.params?.data;
  const masters = route.params?.masterData ?? {};
  const apartments = route.params?.apartmentList ?? [];
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [savedSafId, setSavedSafId] = useState(null);
  const [tax, setTax] = useState(null);
  const [taxLoading, setTaxLoading] = useState(Boolean(data));
  const [taxError, setTaxError] = useState('');

  useEffect(() => {
    if (!data) return;
    const controller = new AbortController();

    async function loadTax() {
      setTax(null);
      setTaxLoading(true);
      setTaxError('');
      try {
        const token = await getToken();
        const { data: result } = await axios.post(
          SAF_API_ROUTES.REVIEW_TAX,
          { ...data, swmConsumer: data.swmConsumer ?? [] },
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        if (result.status) {
          setTax(result.data);
        } else {
          const messages = Object.values(result.errors || {}).flat().join('\n');
          setTaxError(messages || result.message || 'Unable to calculate tax.');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const result = error.response?.data;
        const messages = Object.values(result?.errors || {}).flat().join('\n');
        setTaxError(messages || result?.message || 'Unable to calculate tax.');
      } finally {
        if (!controller.signal.aborted) setTaxLoading(false);
      }
    }

    loadTax();
    return () => controller.abort();
  }, [data]);

  const handleSubmit = async () => {
    if (!data || submitting.current || savedSafId) return;
    submitting.current = true;
    setLoading(true);console.log('Submitting SAF with data:', data); // ✅ log the data for debugging

    try {
      const token = await getToken();
      const response = await axios.post(SAF_API_ROUTES.APPLY_SAF, data, {
        headers: { Authorization: `Bearer ${token}` },
      });console.log('SAF submission response:', response.data); // ✅ log the response for debugging
      const result = response.data;
      if (!result.status) {
        const errors = Object.values(result.errors || {}).flat().join('\n');
        Alert.alert('SAF submission', errors || result.message || 'Unable to submit.');
        return;
      }

      setSavedSafId(result.data?.safId);
      const safNo = result.data?.safNo || '';
      setCopiedSafNo(safNo);
      if (safNo) Clipboard.setString(safNo);
      setModalVisible(true);
    } catch (error) {console.error('Error submitting SAF:', error); // ✅ log the error for debugging
      const result = error.response?.data;
      const errors = Object.values(result?.errors || {}).flat().join('\n');
      Alert.alert('SAF submission', errors || result?.message || error.message);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const handleOk = () => {
    setModalVisible(false);

    if (savedSafId) {
      navigation.navigate('SafDetails', { id: savedSafId }); // ✅ correct navigation
    }
  };

  return (
    <>
      <HeaderNavigation />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Assessment Preview</Text>
        {data ? (
          <>
            <PreviewDetails data={data} masters={masters} apartments={apartments} />
            <Section title="Tax Details">
              {taxLoading && <ActivityIndicator color={Colors.headignColor} />}
              {taxError ? <Text style={styles.error} accessibilityRole="alert">{taxError}</Text> : null}
              {!taxLoading && !taxError && <TaxHistory tax={tax} />}
            </Section>
          </>
        ) : <Text style={styles.empty}>No data to preview.</Text>}

      </ScrollView>

      <View style={[styles.actions, { paddingBottom: 12 + bottom }]}>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {data && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: loading || Boolean(savedSafId), busy: loading }}
            disabled={loading || Boolean(savedSafId)}
            style={[styles.submitButton, savedSafId && styles.disabledButton]}
            onPress={() =>
              Alert.alert('Submit assessment?', 'Confirm the SAF details before submitting.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', onPress: handleSubmit },
              ])
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Copied!</Text>
              <Text style={styles.modalText}>SAF No: {copiedSafNo}</Text>
              <TouchableOpacity style={styles.okButton} onPress={handleOk}>
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16, paddingBottom: 20 },
  title: { fontSize: 25, fontWeight: '700', color: '#10263a', marginBottom: 16 },
  section: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#10263a', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  field: { width: '50%', paddingHorizontal: 5, paddingVertical: 5 },
  fullField: { width: '100%' },
  fieldLabel: { color: '#475569', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  fieldValue: {
    color: '#10263a',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    minHeight: 34,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  subheading: { color: '#10263a', fontSize: 14, fontWeight: '700', marginVertical: 8 },
  table: { borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row', backgroundColor: '#fff' },
  tableStripe: { backgroundColor: '#f8fafc' },
  tableCell: {
    width: 118,
    paddingHorizontal: 9,
    paddingVertical: 9,
    color: '#1e293b',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#cbd5e1',
  },
  numberCell: { width: 40, textAlign: 'center' },
  lastCell: { borderRightWidth: 0 },
  tableHeading: { fontSize: 12, fontWeight: '700', backgroundColor: '#e8eef5' },
  taxEra: { gap: 8, marginBottom: 10 },
  empty: { color: '#475569' },
  error: { color: '#991b1b', backgroundColor: '#fef2f2', padding: 10, borderRadius: 6 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  backText: { color: '#10263a', fontWeight: '700' },
  submitButton: {
    flex: 2,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#14532d',
  },
  disabledButton: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // dark transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15, // rounded corners
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8, // Android shadow
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    color: '#555',
  },
  okButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25, // pill-shaped button
    elevation: 2,
  },
  okText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AssessmentSummary;
