import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderNavigation from '../../../Components/HeaderNavigation';
import Pagination from '../../../Components/Pagination';
import { CopyableText } from '../../../Components/CopyableControl';
import { rows } from '../swmRequests';
import { styles } from '../swmStyles';

export function Page({ children }) {
  return (
    <View style={styles.screen}>
      <HeaderNavigation />
      <SafeAreaView edges={['bottom']} style={styles.screen}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function Card({ title, children }) {
  return (
    <View style={styles.card}>
      {title ? <Text selectable accessibilityRole="header" style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function Fields({ fields }) {
  return (
    <View style={styles.grid}>
      {fields.map(([label, value, onPress]) => (
        <View key={label} style={styles.field}>
          <Text selectable style={styles.label}>{label}</Text>
          {onPress ? (
            <CopyableText accessibilityRole="link" style={styles.link} onPress={onPress}>{value}</CopyableText>
          ) : <Text selectable>{value ?? '—'}</Text>}
        </View>
      ))}
    </View>
  );
}

export function PagedResults({ result, page, onPage, renderRow }) {
  if (!result) return <ActivityIndicator accessibilityLabel="Loading records" />;
  if (result.error) return <Text selectable accessibilityRole="alert">{result.error}</Text>;
  const items = rows(result.data?.data);
  const lastPage = Number(result.data?.lastPage) || 1;

  return (
    <>
      {items.map(renderRow)}
      {!items.length && <Text selectable>No records found.</Text>}
      {lastPage > 1 && (
        <Pagination page={page} lastPage={lastPage} total={Number(result.data.total) || items.length}
          onPrev={() => onPage(page - 1)} onNext={() => onPage(page + 1)} onPageChange={onPage} />
      )}
    </>
  );
}
