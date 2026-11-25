import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text } from 'react-native';
import MonthPicker, { ACTION_DATE_SET } from 'react-native-month-year-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Button from '../../../Components/AppButton';
import { PROPERTY_VALIDATE_HOLDING_API, SHOP_RENT_ADD_API, SHOP_RENT_MASTER_API, Ulb_Api } from '../../../api/apiRoutes';
import { getUserDetails } from '../../../utils/auth';
import OwnerForm from '../components/OwnerForm';
import { Choice, Field, Panel, Result, ShopPage } from '../components/ShopRentUI';
import { errorMessage, shopRentRequest, useShopRentData } from '../shopRentRequests';

const emptyRequest = {};
const maxSize = 5 * 1024 * 1024;
const month = date => String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0');

const propertyChoices = [
  ['Area Name', 'areaId', 'areaType', 'areaName'],
  ['Ward No.', 'wardMstrId', 'wardList', 'wardNo'],
  ['Shop Build Type', 'shopTypeId', 'shopType', 'shopType'],
  ['Samiti Name', 'samitiId', 'samiti', 'samitiName'],
  ['Yojna Name', 'yojnaId', 'yojna', 'yojnaName'],
];
const propertyFields = [
  ['Holding No.', 'holdingNo'],
  ['Shop No.', 'shopNo'],
  ['Nigam Reg. No.', 'regNo'],
  ['Premium Amount', 'premiumAmt', 'decimal-pad'],
  ['Address', 'address'],
  ['Pincode', 'pinCode', 'number-pad'],
  ['Monthly Rate Amount', 'monthlyRate', 'decimal-pad'],
];
const documentTypes = [
  { id: 'application/pdf', name: 'PDF', extension: 'pdf' },
  { id: 'image/jpeg', name: 'JPG', extension: 'jpg' },
  { id: 'image/png', name: 'PNG', extension: 'png' },
  { id: 'image/bmp', name: 'BMP', extension: 'bmp' },
];
const newOwner = id => ({ id, ownerName: '', guardianName: '', relationType: '', mobileNo: '' });

function validate(form, owners, effectiveDate, document) {
  if (!form.areaId || !form.wardMstrId || !form.shopNo?.trim() || !form.shopTypeId) {
    return 'Select an area, ward and shop build type, and enter the shop number.';
  }
  if ((form.address?.trim().length ?? 0) < 5 || !/^\d{6}$/.test(form.pinCode ?? '')) {
    return 'Enter an address of at least five characters and a six-digit pincode.';
  }
  if (!effectiveDate || month(effectiveDate) > month(new Date()) ||
      !Number.isFinite(Number(form.monthlyRate)) || Number(form.monthlyRate) < 1) {
    return 'Select an effective month through the current month and enter a monthly rate of at least 1.';
  }
  if (!document) return 'Select a supporting document.';
  for (const [index, owner] of owners.entries()) {
    if (!owner.ownerName.trim() || !/^\d{10}$/.test(owner.mobileNo.trim()) ||
        (owner.guardianName.trim() && !owner.relationType)) {
      return 'Check the name, mobile number and guardian relation for owner ' + (index + 1) + '.';
    }
  }
  return '';
}

function appendFields(payload, fields, prefix) {
  for (const [key, raw] of Object.entries(fields)) {
    const value = String(raw ?? '').trim();
    if (value) payload.append(prefix ? prefix + '[' + key + ']' : key, value);
  }
}

export default function ShopRentAdd({ navigation }) {
  const [masterRevision, setMasterRevision] = useState(0);
  const master = useShopRentData(SHOP_RENT_MASTER_API, emptyRequest, masterRevision);
  const [form, setForm] = useState({});
  const [defaultPin, setDefaultPin] = useState('');
  const [owners, setOwners] = useState([newOwner(1)]);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [documentType, setDocumentType] = useState(documentTypes[0].id);
  const [document, setDocument] = useState(null);
  const [saving, setSaving] = useState(false);
  const nextOwner = useRef(2);
  const submitting = useRef(false);
  const fullForm = { ...form, pinCode: form.pinCode ?? defaultPin };

  useEffect(() => {
    let active = true;
    getUserDetails().then(user => user?.ulbId && shopRentRequest(Ulb_Api(user.ulbId), {})).then(ulb => {
      if (active && ulb?.pincode) setDefaultPin(String(ulb.pincode));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const updateOwner = (id, key, value) => setOwners(current =>
    current.map(owner => owner.id === id ? { ...owner, [key]: value } : owner));

  const pickDocument = async () => {
    const type = documentTypes.find(item => item.id === documentType);
    try {
      const uri = await ReactNativeBlobUtil.android.getContentIntent(type.id);
      if (uri) setDocument({ uri, type });
    } catch (error) {
      Alert.alert('Supporting Document', errorMessage(error));
    }
  };

  const submit = async () => {
    if (submitting.current) return;
    const validation = validate(fullForm, owners, effectiveDate, document);
    if (validation) {
      Alert.alert('Add Shop Rent', validation);
      return;
    }

    submitting.current = true;
    setSaving(true);
    const path = ReactNativeBlobUtil.fs.dirs.CacheDir + '/shop-rent-' + Date.now() + '.' + document.type.extension;
    try {
      const holdingNo = form.holdingNo?.trim();
      if (holdingNo) await shopRentRequest(PROPERTY_VALIDATE_HOLDING_API, { holdingNo });

      await ReactNativeBlobUtil.MediaCollection.copyToInternal(document.uri, path);
      const file = await ReactNativeBlobUtil.fs.stat(path);
      if (Number(file.size) > maxSize) throw new Error('The supporting document must be 5 MB or smaller.');

      const payload = new FormData();
      appendFields(payload, { ...fullForm, effectiveDate: month(effectiveDate) });
      owners.forEach(({ id, ...owner }, index) => appendFields(payload, owner, 'ownerDtl[' + index + ']'));
      payload.append('document', {
        uri: 'file://' + path,
        name: 'supporting-document.' + document.type.extension,
        type: document.type.id,
      });

      const shop = await shopRentRequest(SHOP_RENT_ADD_API, payload);
      setForm({});
      setOwners([newOwner(nextOwner.current++)]);
      setEffectiveDate(null);
      setDocument(null);
      Alert.alert('Shop Added', shop?.consumerNo ? 'Consumer No. ' + shop.consumerNo : 'Shop registration saved.', [
        { text: 'OK' },
        ...(shop?.shopId ? [{ text: 'View Shop', onPress: () => navigation.navigate('ShopRentDetails', { id: shop.shopId }) }] : []),
      ]);
    } catch (error) {
      Alert.alert('Add Shop Rent', errorMessage(error));
    } finally {
      ReactNativeBlobUtil.fs.unlink(path).catch(() => {});
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <ShopPage title="Add Shop Rent">
      <Result result={master} onRetry={() => setMasterRevision(value => value + 1)}>{data => (
        <>
          <Panel title="Shop Information">
            {propertyChoices.map(([label, key, source, labelKey]) => (
              <Choice key={key} label={label} items={data[source]} labelKey={labelKey}
                value={form[key]} disabled={saving} onChange={value => update(key, value)} />
            ))}
            {propertyFields.map(([label, key, keyboardType]) => (
              <Field key={key} label={label} keyboardType={keyboardType} editable={!saving}
                value={fullForm[key] ?? ''} onChangeText={value => update(key, value)} />
            ))}
            <Button title={effectiveDate ? 'Effect From ' + month(effectiveDate) : 'Select Effective Month'}
              onPress={() => setShowDate(true)} disabled={saving} />
            {showDate && (
              <MonthPicker value={effectiveDate ?? new Date()} maximumDate={new Date()}
                onChange={(event, date) => {
                  setShowDate(false);
                  if (event === ACTION_DATE_SET && date) setEffectiveDate(date);
                }} />
            )}
          </Panel>
          {owners.map((owner, index) => (
            <OwnerForm key={owner.id} owner={owner} number={index + 1} disabled={saving}
              onChange={(field, value) => updateOwner(owner.id, field, value)}
              onRemove={owners.length > 1
                ? () => setOwners(current => current.filter(item => item.id !== owner.id))
                : undefined} />
          ))}
          <Button title="Add Owner" disabled={saving} onPress={() => {
            const owner = newOwner(nextOwner.current++);
            setOwners(current => [...current, owner]);
          }} />
          <Panel title="Supporting Document">
            <Choice label="File Type" items={documentTypes} labelKey="name" value={documentType} disabled={saving}
              onChange={value => {
                setDocumentType(value);
                setDocument(null);
              }} />
            <Button title="Choose File" disabled={saving} onPress={pickDocument} />
            {document && <Text selectable>{document.type.name} selected</Text>}
          </Panel>
          <Button title={saving ? 'Saving…' : 'Submit'} disabled={saving} onPress={submit} />
        </>
      )}</Result>
    </ShopPage>
  );
}
