import { StyleSheet } from 'react-native';
import { cardHeader } from '../../style/cardHeader';
import { uiStyles } from '../../style/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 12, gap: 12, paddingBottom: 20 },
  heading: { color: '#10263a', fontSize: 21, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, gap: 9 },
  title: { ...cardHeader, fontSize: 16, fontWeight: '700' },
  field: { gap: 4 },
  label: {
    ...uiStyles.label,
  },
  input: {
    ...uiStyles.input,
  },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#fff' },
  monthOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 20 },
  monthDialog: { width: '100%', maxWidth: 360, backgroundColor: '#fff', padding: 14, borderRadius: 10, gap: 12 },
  monthYearBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthYear: { color: '#10263a', fontSize: 19, fontWeight: '700' },
  monthArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: '25%', padding: 4 },
  monthButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#eef2f7' },
  monthButtonSelected: { backgroundColor: '#173a7b' },
  monthButtonDisabled: { opacity: 0.4 },
  monthText: { color: '#10263a', fontWeight: '600' },
  monthTextSelected: { color: '#fff' },
  dateInputDisabled: { opacity: 0.5 },
  dateValue: { color: '#10263a', fontSize: 15 },
  datePlaceholder: { color: '#64748b', fontSize: 15 },
  record: { gap: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#cbd5e1' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rate: { color: '#15803d', fontWeight: '600' },
  monthlyAmount: { textAlign: 'center', color: '#15803d', fontSize: 16, fontWeight: '700' },
  error: { backgroundColor: '#fef2f2', color: '#991b1b', padding: 10, borderRadius: 6 },
});
