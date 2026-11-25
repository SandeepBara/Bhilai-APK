import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../../Components/AppButton';
import { CopyableTouchableOpacity } from '../../../Components/CopyableControl';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import { PROPERTY_VALIDATE_HOLDING_API, SWM_ADD_CONSUMER_API, SWM_MASTER_DATA_API } from '../../../api/apiRoutes';
import ConnectionFields from '../components/ConnectionFields';
import EffectMonthPicker from '../components/EffectMonthPicker';
import { Choice, Input, Section } from '../components/SwmFormFields';
import { consumerPayload, emptyConnection, emptyOwner, initialProperty, options, relations, text, validate } from '../swmConsumerForm';
import { message, request, useData } from '../swmRequests';
import { styles } from '../swmFormStyles';

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
