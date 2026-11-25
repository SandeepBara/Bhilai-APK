import { StyleSheet } from 'react-native';
import { cardHeader } from '../../style/cardHeader';
import { uiStyles } from '../../style/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 12, gap: 10, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 8 },
  title: { ...cardHeader, fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', padding: 5, gap: 3 },
  label: {
    ...uiStyles.label,
  },
  input: {
    ...uiStyles.input,
  },
  link: { color: '#1d4ed8', textDecorationLine: 'underline' },
  tableRow: { flexDirection: 'row', alignItems: 'stretch' },
  tableHeading: {
    ...uiStyles.tableHeader,
  },
  tableHeadingText: {
    ...uiStyles.tableHeaderText,
  },
  tableStripe: {
    ...uiStyles.tableStripe,
  },
  tableCell: {
    ...uiStyles.tableCell,
    borderWidth: StyleSheet.hairlineWidth,
  },
  record: { paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  demandOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.48)' },
  demandPanel: { width: '100%', maxWidth: 1100, height: '92%', backgroundColor: '#fff', borderRadius: 10 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  toolbarTitle: { fontSize: 20, fontWeight: '700', color: '#1e3a8a' },
  closeDemand: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeDemandText: { color: '#475569', fontSize: 28, fontWeight: '700' },
  demandContent: { padding: 14, gap: 12 },
  demandTablePanel: { borderWidth: 1, borderColor: '#2563eb', borderRadius: 8 },
  demandPageSize: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  demandPageInput: { width: 76, height: 36, paddingHorizontal: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 6 },
  demandPagination: { padding: 9, gap: 8 },
  demandPageButtons: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 5 },
  demandPageButton: { minHeight: 38, minWidth: 34, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 5, backgroundColor: '#f1f2f4' },
  demandPageButtonActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  demandPageText: { color: '#111827' },
  demandPageTextActive: { color: '#fff' },
  demandPageTextDisabled: { color: '#64748b' },
  demandTableHeading: { backgroundColor: '#f1f2f4' },
  demandCellText: { textAlign: 'center' },
  demandHeading: { fontWeight: '700', color: '#1e3a8a' },
  demandSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  demandTile: { flexBasis: 133, flexGrow: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: '#f1f2f4', borderRadius: 5, padding: 9 },
  totalHeading: { fontWeight: '700', color: '#111827' },
  payableTotal: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, backgroundColor: '#fef08a', borderRadius: 5, padding: 10 },
  payableAmount: { color: '#b91c1c', fontWeight: '700' },
  payNow: { alignSelf: 'flex-end' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
});
