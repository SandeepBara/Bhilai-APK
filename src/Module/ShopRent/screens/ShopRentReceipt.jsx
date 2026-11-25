import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { BluetoothReceiptModal } from '../../../Components/BluetoothReceiptModal';
import { SHOP_RENT_DUE_API, SHOP_RENT_RECEIPT_API } from '../../../api/apiRoutes';
import { Panel, Result, ShopPage, Values } from '../components/ShopRentUI';
import { list, useShopRentData } from '../shopRentRequests';
import { demandFields, isTrue, ownerFields, shopFields } from '../shopRentFields';

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

export default function ShopRentReceipt({ route, navigation }) {
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
