import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import Button from '../../../Components/AppButton';
import { uiStyles } from '../../../style/theme';
import { SHOP_RENT_HISTORY_API } from '../../../api/apiRoutes';
import { Panel, Result, ShopPage, ShopPagination, ShopTable, Values } from '../components/ShopRentUI';
import { list, useShopRentData } from '../shopRentRequests';
import { demandFields, isTrue } from '../shopRentFields';

export default function ShopRentHistory({ route, navigation }) {
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
