import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Button from '../../../Components/AppButton';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import Pagination from '../../../Components/Pagination';
import { cardHeader } from '../../../style/cardHeader';
import { uiColors, uiStyles } from '../../../style/theme';
import { list } from '../shopRentRequests';

export function ShopPage({ title, children }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.page}>
      <HeaderNavigation title={title} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Panel({ title, children }) {
  return (
    <View style={styles.panel}>
      {title && <Text selectable accessibilityRole="header" style={cardHeader}>{title}</Text>}
      {children}
    </View>
  );
}

export function Field({ label, ...props }) {
  return (
    <View>
      <Text selectable style={uiStyles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} style={uiStyles.input} {...props} />
    </View>
  );
}

export function Choice({ label, items, labelKey, value, onChange, disabled }) {
  const options = list(items).map(item => ({
    label: String(item[labelKey] ?? item.id),
    value: String(item.id),
  }));

  return (
    <View>
      <Text selectable style={uiStyles.label}>{label}</Text>
      <Dropdown
        accessibilityLabel={label} style={uiStyles.input} data={options}
        labelField="label" valueField="value" value={value}
        placeholder={label} disable={disabled} onChange={item => onChange(item.value)}
      />
    </View>
  );
}

export function Values({ data, fields }) {
  return (
    <View style={styles.grid}>
      {fields.map(([label, key]) => (
        <View key={label} style={styles.field}>
          <Text selectable style={uiStyles.label}>{label}</Text>
          <Text selectable style={uiStyles.text}>{String(data[key] ?? '—')}</Text>
        </View>
      ))}
    </View>
  );
}

export function ShopTable({ columns, rows }) {
  return (
    <ScrollView horizontal>
      <View>
        <View style={[styles.row, uiStyles.tableHeader]}>
          {columns.map(([label]) => (
            <Text selectable key={label} style={[styles.cell, uiStyles.tableHeaderText]}>{label}</Text>
          ))}
        </View>
        {rows.map((row, index) => (
          <View key={row.id ?? index} style={[styles.row, index % 2 === 1 && uiStyles.tableStripe]}>
            {columns.map(([label, field]) => (
              <View key={label} style={styles.cell}>
                {typeof field === 'function' ? field(row) : (
                  <Text selectable style={styles.cellText}>{String(row[field] ?? '—')}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function Result({ result, onRetry, children }) {
  if (!result) return <ActivityIndicator color={uiColors.primary} accessibilityLabel="Loading" />;
  if (result.error) {
    return (
      <Panel>
        <Text selectable accessibilityRole="alert" style={uiStyles.errorText}>{result.error}</Text>
        {onRetry && <Button title="Retry" onPress={onRetry} />}
      </Panel>
    );
  }
  return children(result.data);
}

export function ShopPagination({ data, page, setPage }) {
  const lastPage = Number(data.lastPage) || 1;
  if (lastPage < 2) return null;
  return (
    <Pagination
      page={page} lastPage={lastPage} total={data.total}
      onPrev={() => setPage(Math.max(1, page - 1))}
      onNext={() => setPage(Math.min(lastPage, page + 1))}
      onPageChange={setPage}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: uiColors.page },
  content: { padding: 12, gap: 10, paddingBottom: 20 },
  panel: { backgroundColor: uiColors.surface, padding: 12, borderRadius: 10, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', padding: 5, gap: 3 },
  row: { flexDirection: 'row' },
  cell: { ...uiStyles.tableCell, width: 120, borderWidth: StyleSheet.hairlineWidth },
  cellText: { color: uiColors.text, fontSize: 13 },
});
