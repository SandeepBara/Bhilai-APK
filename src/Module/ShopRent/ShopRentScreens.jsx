import React, { useMemo, useRef, useState } from 'react';
import { Alert, Linking, Text } from 'react-native';
import Button from '../../Components/AppButton';
import { BluetoothReceiptModal } from '../../Components/BluetoothReceiptModal';
import { uiStyles } from '../../style/theme';
import {
  SHOP_RENT_DETAILS_API, SHOP_RENT_DUE_API, SHOP_RENT_GENERATE_API,
  SHOP_RENT_HISTORY_API, SHOP_RENT_MASTER_API, SHOP_RENT_RECEIPT_API, SHOP_RENT_SEARCH_API,
} from '../../api/apiRoutes';
import { Choice, Field, Panel, Result, ShopPage, ShopPagination, ShopTable, Values } from './ShopRentUI';
import { errorMessage, list, shopRentRequest, useShopRentData } from './shopRentRequests';

const isTrue = value => [true, 1, '1', 'true'].includes(value);
const emptyRequest = {};
const shopFields = [
  ['Consumer No.', 'consumerNo'], ['Ward No.', 'wardNo'], ['Area Name', 'areaName'],
  ['Shop No.', 'shopNo'], ['Nigam Reg. No.', 'regNo'], ['Holding No.', 'holdingNo'],
  ['Shop Build Type', 'shopType'], ['Samiti Name', 'samitiName'], ['Yojna Name', 'yojnaName'],
  ['Premium Amount', 'premiumAmt'], ['Pincode', 'pinCode'], ['Address', 'address'],
  ['Allotment Date', 'allotmentDate'], ['Apply Date', 'applyDate'],
];
const ownerFields = [
  ['Owner Name', 'ownerName'], ['Guardian Name', 'guardianName'],
  ['Relation', 'relationType'], ['Mobile No.', 'mobileNo'],
];
const transactionFields = [
  ['Receipt No.', 'tranNo'], ['Payment Mode', 'paymentMode'], ['Payment Date', 'tranDate'],
  ['From', 'fromDate'], ['Through', 'uptoDate'], ['Demand', 'demandAmt'],
  ['Penalty', 'penaltyAmt'], ['Amount Payable', 'payableAmt'],
];
const demandFields = [
  ['Demand From', 'demandFrom'], ['Demand Through', 'demandUpto'], ['Demand Amount', 'amount'],
  ['Penalty', 'penalty'], ['Balance', 'balance'],
];

export function ShopRentSearch({ navigation }) {
  const [masterRevision, setMasterRevision] = useState(0);
  const master = useShopRentData(SHOP_RENT_MASTER_API, emptyRequest, masterRevision);
  const [ward, setWard] = useState('');
  const [area, setArea] = useState('');
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState(null);
  const [page, setPage] = useState(1);
  const body = useMemo(() => filters && ({ ...filters, page, perPage: 10 }), [filters, page]);
  const result = useShopRentData(SHOP_RENT_SEARCH_API, body);

  const search = () => {
    setPage(1);
    setFilters({ wardId: ward ? [ward] : [], areaId: area || null, keyWord: keyword.trim() || null });
  };

  return (
    <ShopPage title="Search Shop Renter">
      <Result result={master} onRetry={() => setMasterRevision(value => value + 1)}>{data => (
        <Panel title="Search Filters">
          <Choice label="Ward No." labelKey="wardNo" value={ward} onChange={setWard}
            items={[{ id: '', wardNo: 'All Wards' }, ...list(data.wardList)]} />
          <Choice label="Area Name" labelKey="areaName" value={area} onChange={setArea}
            items={[{ id: '', areaName: 'All Areas' }, ...list(data.areaType)]} />
          <Field label="Enter Keywords" placeholder="Consumer, shop, holding, owner or mobile"
            value={keyword} onChangeText={setKeyword} returnKeyType="search" onSubmitEditing={search} />
          <Button title="Search" onPress={search} />
        </Panel>
      )}</Result>
      {body && <Result result={result}>{data => {
        const shops = list(data.data);
        return (
          <>
            {!shops.length && <Panel><Text selectable style={uiStyles.text}>No shops found.</Text></Panel>}
            {shops.map(shop => (
              <Panel key={shop.id} title={String(shop.consumerNo ?? shop.shopNo ?? 'Shop')}>
                <Values data={shop} fields={shopFields.slice(1, 6)} />
                <Values fields={ownerFields.filter(([, key]) => key === 'ownerName' || key === 'mobileNo')}
                  data={{ ...shop, ownerName: shop.ownerName ?? list(shop.owners).map(owner => owner.ownerName).join(', ') }} />
                <Button title="View Shop" onPress={() => navigation.navigate('ShopRentDetails', { id: shop.id })} />
              </Panel>
            ))}
            <ShopPagination data={data} page={page} setPage={setPage} />
          </>
        );
      }}</Result>}
    </ShopPage>
  );
}

function PaymentHistory({ transactions, onViewReceipt }) {
  const [requestedPage, setPage] = useState(1);
  const pageSize = 5;
  const total = transactions.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, lastPage);
  const offset = (page - 1) * pageSize;
  const columns = [
    ...transactionFields,
    ['Receipt', transaction => transaction.id ? (
      <Button title="View Receipt" onPress={() => onViewReceipt(transaction.id)} />
    ) : <Text selectable style={uiStyles.text}>—</Text>],
  ];

  return (
    <Panel title="Payment History">
      {total ? (
        <>
          <ShopTable columns={columns} rows={transactions.slice(offset, offset + pageSize)} />
          <ShopPagination data={{ lastPage, total }} page={page} setPage={setPage} />
        </>
      ) : <Text selectable style={uiStyles.text}>No payments found.</Text>}
    </Panel>
  );
}

export function ShopRentDetails({ route, navigation }) {
  const { id } = route.params;
  const body = useMemo(() => ({ id }), [id]);
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const result = useShopRentData(SHOP_RENT_DETAILS_API, body, revision);

  const generate = () => Alert.alert('Generate Demand', 'Generate demand for this shop?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Generate', onPress: async () => {
      if (busy.current) return;
      busy.current = true;
      setSaving(true);
      try {
        await shopRentRequest(SHOP_RENT_GENERATE_API, body);
        setRevision(value => value + 1);
        Alert.alert('Demand Generated');
      } catch (error) {
        Alert.alert('Generate Demand', errorMessage(error));
      } finally {
        busy.current = false;
        setSaving(false);
      }
    } },
  ]);

  return (
    <ShopPage title="Shop Details">
      <Result result={result}>{shop => (
        <>
          <Panel title="Shop Information">
            {isTrue(shop.lockStatus) && <Text selectable style={uiStyles.errorText}>Shop Deactivated</Text>}
            <Values data={shop} fields={shopFields} />
          </Panel>
          <Panel title="Owner Details">
            {list(shop.owners).length ? (
              <ShopTable columns={ownerFields} rows={list(shop.owners)} />
            ) : <Text selectable style={uiStyles.text}>No owners found.</Text>}
          </Panel>
          <Panel title="Rent History">
            {[...list(shop.shopRents)].sort((a, b) => String(b.effectiveDate).localeCompare(String(a.effectiveDate))).map((rent, index) => (
              <Panel key={rent.id ?? index}>
                <Values data={rent} fields={[[ 'Monthly Rate', 'monthlyRate' ], [ 'Effective Date', 'effectiveDate' ]]} />
                <Text>{isTrue(rent.isCurrent) ? 'Current' : 'Old'}</Text>
                {/^https?:\/\//i.test(rent.docPath ?? '') ? (
                  <Button title="Open Document" onPress={() => Linking.openURL(rent.docPath)
                    .catch(error => Alert.alert('Open Document', errorMessage(error)))} />
                ) : <Text selectable>{rent.docPath ?? '—'}</Text>}
              </Panel>
            ))}
          </Panel>
          <PaymentHistory transactions={list(shop.tranDtls)}
            onViewReceipt={receiptId => navigation.navigate('ShopRentReceipt', { id: receiptId })} />
          <Panel>
            {shop.propertyDetailId && (
              <Button title="View Holding" onPress={() => navigation.navigate('HoldingDetails', { id: shop.propertyDetailId })} />
            )}
            <Button title="View Demand History" onPress={() => navigation.navigate('ShopRentHistory', { id })} />
            {!isTrue(shop.lockStatus) && isTrue(shop.userPermission?.canGenerateDemand ?? true) && (
              <Button title={saving ? 'Generating…' : 'Generate Demand'} disabled={saving} onPress={generate} />
            )}
          </Panel>
        </>
      )}</Result>
    </ShopPage>
  );
}

export function ShopRentHistory({ route, navigation }) {
  const { id } = route.params;
  const [page, setPage] = useState(1);
  const body = useMemo(() => ({ id, page, perPage: 10 }), [id, page]);
  const result = useShopRentData(SHOP_RENT_HISTORY_API, body);

  return (
    <ShopPage title="Demand History">
      <Result result={result}>{data => {
        const rows = list(data.data).map(demand => ({
          ...demand,
          status: isTrue(demand.isFullPaid) ? 'Paid' : isTrue(demand.paidStatus) ? 'Partially Paid' : 'Unpaid',
        }));
        return (
          <>
            <Panel title="Demand Summary">
              <Values data={data.summary ?? {}} fields={[[ 'Total Due', 'totalDue' ]]} />
              {Number(data.summary?.totalDue) > 0 && (
                <Button title="Demand Receipt" onPress={() => navigation.navigate('ShopRentReceipt', { id, demand: true })} />
              )}
            </Panel>
            <Panel title="Demand Records">
              {rows.length ? (
                <ShopTable columns={[...demandFields, ['Status', 'status']]} rows={rows} />
              ) : <Text selectable style={uiStyles.text}>No demand history found.</Text>}
              <ShopPagination data={data} page={page} setPage={setPage} />
            </Panel>
          </>
        );
      }}</Result>
    </ShopPage>
  );
}

const receiptFields = [
  ['Department', 'department'], ['Account Description', 'accountDescription'],
  ...shopFields.slice(0, 4), ...ownerFields, ['Address', 'address'],
];
const demandTotals = [
  ['From Month', 'demandFrom'], ['Through Month', 'demandUpto'],
  ['Demand Amount', 'demandAmount'], ['Penalty', 'latePenalty'], ['Service Tax', 'serviceTax'],
  ['CGST', 'cgst'], ['SGST', 'sgst'], ['Additional Tax', 'additionalTax'], ['Advance', 'advanceAmount'],
  ['Total Payable', 'payableAmount'], ['Amount in Words', 'payableAmountInWord'],
];
const bluetoothPaymentFields = (receipt, { date, money }) => [
  ['Consumer No.', receipt.consumerNo],
  ['Area Name', receipt.areaName],
  ['Shop No.', receipt.shopNo],
  ['Owner Name', receipt.ownerName],
  ['Address', receipt.address],
  ['Dues From', date(receipt.fromDate)],
  ['Dues Upto', date(receipt.uptoDate)],
  ['Rent Demand', money(receipt.tranDtl?.demandAmt ?? receipt.monthlyDemandAmount)],
  ['Penalty', money(receipt.tranDtl?.penaltyAmt)],
  ...list(receipt.fineRebate).map(adjustment => [
    adjustment.headName || 'Adjustment',
    money(isTrue(adjustment.isRebate)
      ? -Math.abs(Number(adjustment.amount))
      : adjustment.amount),
  ]),
  ...(receipt.chequeNo && receipt.paymentMode !== 'CASH' ? [['Payment Ref.', receipt.chequeNo]] : []),
];

export function ShopRentReceipt({ route, navigation }) {
  const { id, demand } = route.params;
  const body = useMemo(() => ({ id }), [id]);
  const result = useShopRentData(demand ? SHOP_RENT_DUE_API : SHOP_RENT_RECEIPT_API, body);
  const title = demand ? 'Shop Rent Demand Receipt' : 'Shop Rent Payment Receipt';

  if (!demand && result?.data) {
    const receipt = result.data;
    return (
      <BluetoothReceiptModal visible onClose={() => navigation.goBack()}
        paymentDtls={{ ...receipt.shopDtl, ...receipt.tranDtl, ...receipt }}
        receiptTitle={title} previewTitle={title} getFields={bluetoothPaymentFields} />
    );
  }

  return (
    <ShopPage title={title}>
      <Result result={result}>{receipt => {
        const info = { ...receipt.shopDtl, ...receipt.tranDtl, ...receipt };
        const fields = [...receiptFields, ...demandTotals];
        const sections = list(receipt.demandList).map(item => ({
          data: item,
          fields: [...demandFields, ['Total Tax', 'totalTax']],
        }));
        const municipalName = receipt.ulbDtl?.ulbName ?? 'Bhilai Municipal Corporation';

        return (
          <>
            <Panel title={municipalName}>
              <Text>This is not a payment receipt.</Text>
              <Values data={info} fields={fields} />
            </Panel>
            {sections.map((section, index) => (
              <Panel key={index} title={'Demand ' + (index + 1)}>
                <Values data={section.data} fields={section.fields} />
              </Panel>
            ))}
          </>
        );
      }}</Result>
    </ShopPage>
  );
}
