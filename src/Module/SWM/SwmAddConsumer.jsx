import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CopyableTouchableOpacity } from '../../Components/CopyableControl';
import HeaderNavigation from '../../Components/HeaderNavigation';
import { cardHeader } from '../../style/cardHeader';
import {
  PROPERTY_VALIDATE_HOLDING_API, SWM_ADD_CONSUMER_API, SWM_MASTER_DATA_API,
  SWM_RATE_API, SWM_SUBCATEGORY_LIST_API,
} from '../../api/apiRoutes';
import { message, request, useData } from './swmRequests';

const text = value => String(value ?? '');
const month = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
const emptyOwner = key => ({ key, ownerName: '', guardianName: '', relationType: '', mobileNo: '', email: '' });
const emptyConnection = key => ({
  key, categoryTypeMasterId: '', subCategoryTypeMasterId: '', totalNoOfHouseAreaRoomTruck: '1',
  hasRestaurant: false, totalNoOfRestaurant: '0', hasGarden: false, totalNoOfGarden: '0',
  hasBanquetHall: false, totalNoOfBanquetHall: '0',
});
const relations = ['S/O', 'D/O', 'W/O', 'C/O'].map(value => ({ label: value, value }));
const facilities = [
  ['Restaurant', 'hasRestaurant', 'totalNoOfRestaurant'],
  ['Garden', 'hasGarden', 'totalNoOfGarden'],
  ['Banquet Hall', 'hasBanquetHall', 'totalNoOfBanquetHall'],
];
const options = (items, field) => (Array.isArray(items) ? items : []).map(item => ({
  label: text(item[field] ?? item.name ?? item.id), value: text(item.id),
}));
const initialProperty = {
  holdingNo: '', wardMstrId: '', houseNo: '', address: '', landmark: '',
  policeStation: '', streetName: '', locality: '', pinCode: '',
};

const connectionPayload = ({ key, ...connection }) => ({
  ...connection,
  totalNoOfHouseAreaRoomTruck: Number(connection.totalNoOfHouseAreaRoomTruck),
  totalNoOfRestaurant: connection.hasRestaurant ? Number(connection.totalNoOfRestaurant) : 0,
  totalNoOfGarden: connection.hasGarden ? Number(connection.totalNoOfGarden) : 0,
  totalNoOfBanquetHall: connection.hasBanquetHall ? Number(connection.totalNoOfBanquetHall) : 0,
});

function consumerPayload(property, owners, connections, effective) {
  return {
    ...Object.fromEntries(Object.entries(property).map(([key, value]) => [key, value.trim()])),
    dateOfEffective: effective,
    ownerDtl: owners.map(({ key, ...owner }) =>
      Object.fromEntries(Object.entries(owner).map(([field, value]) => [field, value.trim()]))),
    connectionDtl: connections.map(connectionPayload),
  };
}

function validate(property, owners, connections, effective, verifiedHolding) {
  if (!property.holdingNo.trim() || property.holdingNo.trim() !== verifiedHolding) {
    return 'Verify the holding number first.';
  }
  if (!property.wardMstrId || property.address.trim().length < 5 || !/^\d{6}$/.test(property.pinCode)) {
    return 'Select a ward, enter a full address, and provide a six-digit pin code.';
  }
  if (!effective || effective > month(new Date())) return 'Select an effective month no later than the current month.';
  for (const [index, owner] of owners.entries()) {
    if (!owner.ownerName.trim() || !owner.guardianName.trim() || !owner.relationType || !/^\d{10}$/.test(owner.mobileNo.trim())) {
      return 'Enter the name, guardian, relation, and ten-digit mobile number for owner ' + (index + 1) + '.';
    }
    if (owner.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(owner.email.trim())) {
      return 'Enter a valid email address for owner ' + (index + 1) + '.';
    }
  }
  for (const [index, item] of connections.entries()) {
    if (!item.categoryTypeMasterId || !item.subCategoryTypeMasterId ||
      !Number.isFinite(Number(item.totalNoOfHouseAreaRoomTruck)) || Number(item.totalNoOfHouseAreaRoomTruck) < 1) {
      return 'Select a category and sub-category and enter a quantity of at least 1 for connection ' + (index + 1) + '.';
    }
    for (const [label, enabled, quantity] of facilities) {
      if (item[enabled] && (!item[quantity].trim() || !Number.isFinite(Number(item[quantity])) || Number(item[quantity]) < 0)) {
        return 'Enter a valid ' + label.toLowerCase() + ' quantity for connection ' + (index + 1) + '.';
      }
    }
  }
  return '';
}

function Section({ title, children }) {
  return <View style={styles.card}><Text selectable accessibilityRole="header" style={styles.title}>{title}</Text>{children}</View>;
}

function Input({ label, value, onChange, disabled, ...props }) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.label}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label} style={styles.input}
        editable={!disabled} value={value} onChangeText={onChange} />
    </View>
  );
}

function Choice({ label, data, value, onChange, disabled }) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.label}>{label}</Text>
      <Dropdown accessibilityLabel={label} style={styles.input} data={data}
        labelField="label" valueField="value" value={value} disable={disabled}
        placeholder={'Select ' + label.replace(/ \*$/, '')} onChange={item => onChange(item.value)} />
    </View>
  );
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function EffectMonthPicker({ value, onSelect, onClose }) {
  const current = month(new Date());
  const currentYear = Number(current.slice(0, 4));
  const [year, setYear] = useState(() => Number((value || current).slice(0, 4)));
  const yearText = String(year).padStart(4, '0');

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.monthOverlay}>
        <View style={styles.monthDialog}>
          <Text selectable accessibilityRole="header" style={styles.title}>Date of Effect</Text>
          <View style={styles.monthYearBar}>
            <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel="Previous year"
              disabled={year <= 1} onPress={() => setYear(previous => previous - 1)} style={styles.monthArrow}>
              <Icon name="chevron-left" size={24} color={year <= 1 ? '#94a3b8' : '#173a7b'} />
            </CopyableTouchableOpacity>
            <Text selectable accessibilityLiveRegion="polite" style={styles.monthYear}>{yearText}</Text>
            <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel="Next year"
              disabled={year >= currentYear} onPress={() => setYear(previous => previous + 1)} style={styles.monthArrow}>
              <Icon name="chevron-right" size={24} color={year >= currentYear ? '#94a3b8' : '#173a7b'} />
            </CopyableTouchableOpacity>
          </View>
          <View style={styles.monthGrid}>
            {monthLabels.map((label, index) => {
              const selectedMonth = yearText + '-' + String(index + 1).padStart(2, '0');
              const selected = selectedMonth === value;
              const disabled = selectedMonth > current;
              return (
                <View key={label} style={styles.monthCell}>
                  <CopyableTouchableOpacity accessibilityRole="button" accessibilityLabel={label + ' ' + yearText}
                    accessibilityState={{ disabled, selected }} disabled={disabled}
                    onPress={() => onSelect(selectedMonth)}
                    style={[styles.monthButton, selected && styles.monthButtonSelected, disabled && styles.monthButtonDisabled]}>
                    <Text style={[styles.monthText, selected && styles.monthTextSelected]}>{label}</Text>
                  </CopyableTouchableOpacity>
                </View>
              );
            })}
          </View>
          <Button title="Cancel" onPress={onClose} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function ConnectionFields({ item, index, categories, effective, onChange, onRemove, onRate, disabled }) {
  const categoryQuery = useMemo(() => item.categoryTypeMasterId
    ? { categoryTypeMasterId: item.categoryTypeMasterId, all: 'all' } : undefined, [item.categoryTypeMasterId]);
  const subcategories = useData(SWM_SUBCATEGORY_LIST_API, categoryQuery);
  const rateQuery = useMemo(() => {
    if (!item.subCategoryTypeMasterId || !effective || Number(item.totalNoOfHouseAreaRoomTruck) < 1) return undefined;
    return { ...connectionPayload(item), dateOfEffective: effective };
  }, [item, effective]);
  const rate = useData(SWM_RATE_API, rateQuery);
  const quotedRate = rate?.data?.currentRate;

  useEffect(() => {
    onRate(item.key, quotedRate == null ? null : Number(quotedRate));
  }, [item.key, onRate, quotedRate]);

  return (
    <View style={styles.record}>
      <Text selectable style={styles.label}>Connection {index + 1}</Text>
      <Choice label="Category *" data={categories} value={item.categoryTypeMasterId} disabled={disabled}
        onChange={categoryTypeMasterId => onChange({
          ...emptyConnection(item.key), categoryTypeMasterId, totalNoOfHouseAreaRoomTruck: item.totalNoOfHouseAreaRoomTruck,
        })} />
      <Choice label="Sub Category *" data={options(subcategories?.data, 'subCategoryType')}
        value={item.subCategoryTypeMasterId} disabled={disabled || !subcategories?.data}
        onChange={subCategoryTypeMasterId => onChange({ subCategoryTypeMasterId })} />
      {subcategories?.error ? <Text selectable accessibilityRole="alert">{subcategories.error}</Text> : null}
      <Input label="No. of Houses / Rooms / Trucks or Area *" value={item.totalNoOfHouseAreaRoomTruck}
        keyboardType="decimal-pad" disabled={disabled}
        onChange={totalNoOfHouseAreaRoomTruck => onChange({ totalNoOfHouseAreaRoomTruck })} />
      {Number(item.categoryTypeMasterId) === 16 && facilities.map(([label, enabled, quantity]) => (
        <View key={enabled} style={styles.field}>
          <View style={styles.switchRow}>
            <Text selectable style={styles.label}>Has {label}</Text>
            <Switch accessibilityLabel={'Has ' + label} value={item[enabled]} disabled={disabled}
              onValueChange={value => onChange({ [enabled]: value, [quantity]: value ? item[quantity] : '0' })} />
          </View>
          {item[enabled] && (
            <Input label={label + ' Quantity *'} value={item[quantity]} keyboardType="decimal-pad"
              disabled={disabled} onChange={value => onChange({ [quantity]: value })} />
          )}
        </View>
      ))}
      {rateQuery && (
        <Text selectable style={styles.rate}>
          {rate?.error ? 'Monthly rate unavailable' : rate?.data?.currentRate != null
            ? 'Monthly Rate  ₹ ' + rate.data.currentRate : 'Loading monthly rate…'}
        </Text>
      )}
      {onRemove && <Button title="Remove Connection" color="#b91c1c" disabled={disabled} onPress={onRemove} />}
    </View>
  );
}

export default function SwmAddConsumer({ navigation }) {
  const [property, setProperty] = useState(initialProperty);
  const [owners, setOwners] = useState(() => [emptyOwner(1)]);
  const [connections, setConnections] = useState(() => [emptyConnection(2)]);
  const [effective, setEffective] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [verifiedHolding, setVerifiedHolding] = useState('');
  const [holdLoading, setHoldLoading] = useState(false);
  const [holdingError, setHoldingError] = useState('');
  const [rates, setRates] = useState({});
  const updateRate = useCallback((key, rate) => {
    setRates(previous => previous[key] === rate ? previous : { ...previous, [key]: rate });
  }, []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [masterRevision, setMasterRevision] = useState(0);
  const [masterQuery] = useState(() => ({}));
  const master = useData(SWM_MASTER_DATA_API, masterQuery, masterRevision);
  const currentHolding = useRef('');
  const holdingRequest = useRef(null);
  const submitting = useRef(false);
  const nextKey = useRef(3);

  useEffect(() => () => holdingRequest.current?.abort(), []);

  const setField = (name, value) => setProperty(previous => ({ ...previous, [name]: value }));
  const editHolding = value => {
    currentHolding.current = value.trim();
    holdingRequest.current?.abort();
    holdingRequest.current = null;
    setHoldLoading(false);
    setVerifiedHolding('');
    setHoldingError('');
    setField('holdingNo', value);
  };

  async function verifyHolding() {
    const holdingNo = currentHolding.current;
    if (!holdingNo || holdingNo === verifiedHolding || holdingRequest.current) return;
    const controller = new AbortController();
    holdingRequest.current = controller;
    setHoldingError('');
    setHoldLoading(true);
    try {
      const data = await request(PROPERTY_VALIDATE_HOLDING_API, { holdingNo }, controller.signal);
      if (controller.signal.aborted || currentHolding.current !== holdingNo) return;
      if (!data?.id) throw new Error('Invalid holding number.');
      setProperty(previous => ({
        ...previous, wardMstrId: text(data.wardMstrId), address: text(data.propAddress), pinCode: text(data.propPinCode),
      }));
      if (Array.isArray(data.owners) && data.owners.length) {
        setOwners(data.owners.map(owner => ({
          key: nextKey.current++, ownerName: text(owner.ownerName), guardianName: text(owner.guardianName),
          relationType: text(owner.relationType), mobileNo: text(owner.mobileNo), email: text(owner.email),
        })));
      }
      setVerifiedHolding(holdingNo);
    } catch (failure) {
      if (!controller.signal.aborted) setHoldingError(message(failure));
    } finally {
      if (holdingRequest.current === controller) {
        holdingRequest.current = null;
        setHoldLoading(false);
      }
    }
  }

  async function submit() {
    if (submitting.current || saved) return;
    const validation = validate(property, owners, connections, effective, verifiedHolding);
    if (validation) {
      Alert.alert('Check Consumer Details', validation);
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const result = await request(SWM_ADD_CONSUMER_API, consumerPayload(property, owners, connections, effective));
      setSaved(true);
      Alert.alert('Consumer Added', result?.consumerNo ? 'Consumer No. ' + result.consumerNo : 'SWM consumer registered.', [
        {
          text: result?.consumerId ? 'View Consumer' : 'OK',
          onPress: () => result?.consumerId
            ? navigation.replace('SwmConsumerDetails', { id: result.consumerId })
            : navigation.goBack(),
        },
      ], { cancelable: false });
    } catch (failure) {
      const details = message(failure);
      setError(details);
      Alert.alert('Could Not Add Consumer', details);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  const disabled = saving || saved;
  const wards = options(master?.data?.wardList, 'wardNo');
  const categories = options(master?.data?.categoryType, 'categoryType');
  const monthlyAmount = connections.reduce((total, item) => {
    const rate = rates[item.key];
    return total + (Number.isFinite(rate) ? rate : 0);
  }, 0);

  return (
    <View style={styles.screen}>
      <HeaderNavigation />
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text selectable accessibilityRole="header" style={styles.heading}>Add SWM Consumer</Text>
          {!master && <ActivityIndicator accessibilityLabel="Loading SWM form" />}
          {master?.error && (
            <Section title="Unable to Load Form">
              <Text selectable accessibilityRole="alert">{master.error}</Text>
              <Button title="Retry" onPress={() => setMasterRevision(value => value + 1)} />
            </Section>
          )}
          {master?.data && (
            <>
              <Section title="CONNECTION DETAIL">
                <Input label="Holding No. *" value={property.holdingNo} onChange={editHolding}
                  placeholder="Enter Holding No" onBlur={verifyHolding} disabled={disabled} />
                {holdLoading && <ActivityIndicator accessibilityLabel="Verifying holding number" />}
                {holdingError ? (
                  <Text selectable accessibilityRole="alert" style={styles.error}>{holdingError}</Text>
                ) : null}
                <Choice label="Ward No. *" data={wards} value={property.wardMstrId}
                  disabled={disabled} onChange={value => setField('wardMstrId', value)} />
                {[
                  ['House/Flat No.', 'houseNo'], ['Address *', 'address'], ['Landmark', 'landmark'],
                  ['Police Station', 'policeStation'], ['Street Name', 'streetName'],
                  ['Locality', 'locality'], ['Pin Code *', 'pinCode'],
                ].map(([label, name]) => (
                  <Input key={name} label={label} value={property[name]} disabled={disabled || name === 'policeStation'}
                    multiline={name === 'address'} keyboardType={name === 'pinCode' ? 'number-pad' : 'default'}
                    maxLength={name === 'pinCode' ? 6 : undefined} onChange={value => setField(name, value)} />
                ))}
              </Section>
              <Section title="OWNER DETAILS">
                {owners.map((owner, index) => {
                  const update = fields => setOwners(previous =>
                    previous.map(entry => entry.key === owner.key ? { ...entry, ...fields } : entry));
                  return (
                    <View key={owner.key} style={styles.record}>
                      <Text selectable style={styles.label}>Owner {index + 1}</Text>
                      <Input label="Owner Name *" value={owner.ownerName} disabled={disabled}
                        onChange={ownerName => update({ ownerName })} />
                      <Input label="Guardian Name *" value={owner.guardianName} disabled={disabled}
                        onChange={guardianName => update({ guardianName })} />
                      <Choice label="Relation *" data={relations} value={owner.relationType} disabled={disabled}
                        onChange={relationType => update({ relationType })} />
                      <Input label="Mobile No. *" value={owner.mobileNo} keyboardType="phone-pad" maxLength={10}
                        disabled={disabled} onChange={mobileNo => update({ mobileNo })} />
                      <Input label="Email" value={owner.email} keyboardType="email-address" autoCapitalize="none"
                        disabled={disabled} onChange={email => update({ email })} />
                      {owners.length > 1 && (
                        <Button title="Remove Owner" color="#b91c1c" disabled={disabled}
                          onPress={() => setOwners(previous => previous.filter(entry => entry.key !== owner.key))} />
                      )}
                    </View>
                  );
                })}
                <Button title="Add Owner" disabled={disabled}
                  onPress={() => {
                    const owner = emptyOwner(nextKey.current++);
                    setOwners(previous => [...previous, owner]);
                  }} />
              </Section>
              <Section title="Connection Details">
                <View style={styles.field}>
                  <Text selectable style={styles.label}>Date of Effect *</Text>
                  <CopyableTouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Date of Effect"
                    accessibilityHint="Opens the month and year picker"
                    accessibilityState={{ disabled }}
                    accessibilityValue={{ text: effective ? effective.replace('-', '/') : 'No month selected' }}
                    disabled={disabled}
                    onPress={() => setShowDate(true)}
                    style={[styles.input, styles.dateInput, disabled && styles.dateInputDisabled]}
                  >
                    <Text style={effective ? styles.dateValue : styles.datePlaceholder}>{effective ? effective.replace('-', '/') : 'YYYY/MM'}</Text>
                    <Icon name="calendar-today" size={20} color="#173a7b" />
                  </CopyableTouchableOpacity>
                </View>
                {showDate && (
                  <EffectMonthPicker
                    value={effective}
                    onClose={() => setShowDate(false)}
                    onSelect={selected => {
                      setEffective(selected);
                      setShowDate(false);
                    }}
                  />
                )}
                {connections.map((item, index) => (
                  <ConnectionFields key={item.key} item={item} index={index} categories={categories}
                    effective={effective} onRate={updateRate} disabled={disabled}
                    onChange={fields => setConnections(previous => previous.map(entry =>
                      entry.key === item.key ? { ...entry, ...fields } : entry))}
                    onRemove={connections.length > 1 ? () => setConnections(previous =>
                      previous.filter(entry => entry.key !== item.key)) : undefined} />
                ))}
                <Button title="Add Connection" disabled={disabled}
                  onPress={() => {
                    const connection = emptyConnection(nextKey.current++);
                    setConnections(previous => [...previous, connection]);
                  }} />
              </Section>
              <Text selectable style={styles.monthlyAmount}>Monthly Amount: ₹ {monthlyAmount.toFixed(2)}</Text>
              {error ? <Text selectable accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              <Button title={saving ? 'Submitting…' : 'Submit'} disabled={disabled || holdLoading} onPress={submit} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 12, gap: 12, paddingBottom: 20 },
  heading: { color: '#10263a', fontSize: 21, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 9 },
  title: { ...cardHeader, fontSize: 16, fontWeight: '700' },
  field: { gap: 4 },
  label: { color: '#334155', fontWeight: '600' },
  input: { minHeight: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6, paddingHorizontal: 10, color: '#10263a' },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#fff' },
  monthOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 20 },
  monthDialog: { width: '100%', maxWidth: 360, backgroundColor: '#fff', padding: 14, borderRadius: 10, gap: 12 },
  monthYearBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthYear: { color: '#10263a', fontSize: 19, fontWeight: '700' },
  monthArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: '25%', padding: 4 },
  monthButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#eef2f7' },
  monthButtonSelected: { backgroundColor: '#173a7b' },
  monthButtonDisabled: { opacity: 0.4 },
  monthText: { color: '#10263a', fontWeight: '600' },
  monthTextSelected: { color: '#fff' },
  dateInputDisabled: { opacity: 0.5 },
  dateValue: { color: '#10263a', fontSize: 15 },
  datePlaceholder: { color: '#64748b', fontSize: 15 },
  record: { gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rate: { color: '#15803d', fontWeight: '600' },
  monthlyAmount: { textAlign: 'center', color: '#15803d', fontSize: 16, fontWeight: '700' },
  error: { backgroundColor: '#fef2f2', color: '#991b1b', padding: 10, borderRadius: 6 },
});
