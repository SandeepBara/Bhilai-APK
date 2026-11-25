import { StyleSheet } from 'react-native';
import Colors from '../Module/Constants/Colors';

export const uiColors = {
  text: '#10263a',
  muted: '#475569',
  border: '#cbd5e1',
  surface: Colors.white,
  page: '#f1f5f9',
  primary: Colors.primary,
  heading: Colors.headignColor,
  danger: '#b91c1c',
  errorSurface: '#fef2f2',
  tableHeader: '#e8eff7',
  tableStripe: '#f8fafc',
  secondaryButton: '#e8eff7',
};

const buttonShape = {
  minHeight: 44,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
};

export const uiStyles = StyleSheet.create({
  text: { color: uiColors.text, fontSize: 14 },
  label: { color: uiColors.muted, fontSize: 13, fontWeight: '600' },
  title: { color: uiColors.text, fontSize: 18, fontWeight: '700' },
  cardTitle: { color: uiColors.surface, backgroundColor: uiColors.heading, fontSize: 16, fontWeight: '700', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 },
  cardHeader: { backgroundColor: uiColors.heading, borderColor: uiColors.heading },
  cardHeaderText: { color: uiColors.surface, fontSize: 16, fontWeight: '700' },
  input: { minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: uiColors.border, borderRadius: 8, backgroundColor: uiColors.surface, color: uiColors.text, fontSize: 14 },
  inputError: { borderColor: uiColors.danger },
  errorText: { color: uiColors.danger, fontSize: 13 },
  tableHeader: { backgroundColor: uiColors.tableHeader },
  tableHeaderText: { color: uiColors.text, fontSize: 13, fontWeight: '700' },
  tableCell: { color: uiColors.text, fontSize: 13, paddingHorizontal: 8, paddingVertical: 8, borderColor: uiColors.border },
  tableStripe: { backgroundColor: uiColors.tableStripe },
  primaryButton: { ...buttonShape, backgroundColor: uiColors.primary },
  secondaryButton: { ...buttonShape, backgroundColor: uiColors.secondaryButton },
  dangerButton: { ...buttonShape, backgroundColor: uiColors.danger },
  buttonText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  primaryButtonText: { color: uiColors.surface, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  secondaryButtonText: { color: uiColors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  disabledButton: { opacity: 0.5 },
});
