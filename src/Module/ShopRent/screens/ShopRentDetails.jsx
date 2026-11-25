import React, { useMemo, useRef, useState } from 'react';
import { Alert, Linking, Text } from 'react-native';
import Button from '../../../Components/AppButton';
import { uiStyles } from '../../../style/theme';
import { SHOP_RENT_DETAILS_API, SHOP_RENT_GENERATE_API } from '../../../api/apiRoutes';
import PaymentHistory from '../components/PaymentHistory';
import { Panel, Result, ShopPage, ShopTable, Values } from '../components/ShopRentUI';
import { errorMessage, list, shopRentRequest, useShopRentData } from '../shopRentRequests';
import { isTrue, ownerFields, shopFields } from '../shopRentFields';

export default function ShopRentDetails({ route, navigation }) {
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
