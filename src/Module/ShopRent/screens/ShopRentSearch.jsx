import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';
import Button from '../../../Components/AppButton';
import { uiStyles } from '../../../style/theme';
import { SHOP_RENT_MASTER_API, SHOP_RENT_SEARCH_API } from '../../../api/apiRoutes';
import { Choice, Field, Panel, Result, ShopPage, ShopPagination, Values } from '../components/ShopRentUI';
import { list, useShopRentData } from '../shopRentRequests';
import { ownerFields, shopFields } from '../shopRentFields';

const emptyRequest = {};

export default function ShopRentSearch({ navigation }) {
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
