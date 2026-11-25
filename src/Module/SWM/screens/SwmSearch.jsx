import React, { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Button from '../../../Components/AppButton';
import { WARD_LIST_API, SWM_SEARCH_API } from '../../../api/apiRoutes';
import { Card, Fields, Page, PagedResults } from '../components/SwmUI';
import { rows, useData } from '../swmRequests';
import { styles } from '../swmStyles';

const PAGE_SIZE = 10;

export default function SwmSearch({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [wardId, setWardId] = useState(null);
  const [query, setQuery] = useState(undefined);
  const wards = useData(WARD_LIST_API, null);
  const result = useData(SWM_SEARCH_API, query);
  const search = () => setQuery({ wardId: wardId == null ? [] : [wardId], keyWord: keyword.trim(), page: 1, perPage: PAGE_SIZE });

  return (
    <Page>
      <Card title="Search SWM Consumer">
        <Text selectable style={styles.label}>Ward No.</Text>
        <Dropdown style={styles.input}
          data={rows(wards?.data).map(ward => ({ label: String(ward.wardNo ?? ''), value: ward.id }))}
          accessibilityLabel="Ward No." placeholder="Select Ward" labelField="label" valueField="value"
          value={wardId} onChange={item => setWardId(item.value)} />
        {wards?.error ? <Text selectable accessibilityRole="alert">{wards.error}</Text> : null}
        <Text selectable style={styles.label}>Enter Keywords</Text>
        <TextInput style={styles.input} accessibilityLabel="Enter Keywords"
          placeholder="Consumer No., owner name, or mobile" value={keyword} onChangeText={setKeyword}
          returnKeyType="search" onSubmitEditing={search} />
        <Button title="Search" onPress={search} />
      </Card>
      {query && (
        <PagedResults result={result} page={query.page}
          onPage={page => setQuery({ ...query, page })}
          renderRow={(item, index) => (
            <Card key={item.id ?? index} title={item.consumerNo ?? 'Consumer'}>
              <Fields fields={[
                ['Ward No.', item.wardNo], ['Holding No.', item.holdingNo],
                ['Owner Name', item.ownerName], ['Guardian Name', item.guardianName],
                ['Mobile No.', item.mobileNo], ['Address', item.address],
              ]} />
              <Button title="View" disabled={item.id == null}
                onPress={() => navigation.navigate('SwmConsumerDetails', { id: item.id })} />
            </Card>
          )} />
      )}
    </Page>
  );
}
