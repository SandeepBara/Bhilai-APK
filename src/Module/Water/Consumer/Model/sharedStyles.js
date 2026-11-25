import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Constants/Colors';
import { uiStyles } from '../../../../style/theme';

const { width, height } = Dimensions.get('window');

export const sharedStyles = StyleSheet.create({
  buttonContainer: {
    marginTop: 16,
  },
  connectedText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  printBtn: {
    ...uiStyles.primaryButton,
    marginBottom: 10,
  },
  printText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
  scanBtn: {
    ...uiStyles.primaryButton,
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  scanText: {
    ...uiStyles.buttonText,
    color: '#1E40AF',
  },
  // Printer Modal Styles
  printerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  printerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  printerModalTitle: {
    ...uiStyles.title,
  },
  closeIconBtn: {
    padding: 4,
  },
  printerList: {
    maxHeight: 400,
    padding: 16,
  },
  sectionTitle: {
    ...uiStyles.cardTitle,
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  connectedDevice: {
    backgroundColor: '#dbeafe',
    borderColor: '#1E40AF',
    borderWidth: 2,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 12,
    color: '#6b7280',
  },
  connectedTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  rescanBtn: {
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rescanText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    padding: 6,
    backgroundColor: 'white',
  },
  closeText: {
    color: '#b30000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainTitle: {
    ...uiStyles.title,
    textAlign: 'center',
    marginBottom: 8,
  },
  subTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  tinyText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
  },
  sectionContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  sectionTitle: {
    ...uiStyles.cardTitle,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    ...uiStyles.label,
    flex: 1,
  },
  value: {
    ...uiStyles.text,
    flex: 1,
    textAlign: 'right',
  },
  declaration: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },
  term: {
    fontSize: 12,
    marginVertical: 2,
    color: '#444',
  },
  note: {
    marginTop: 12,
    fontStyle: 'italic',
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  printBtn: {
    ...uiStyles.primaryButton,
    marginTop: 18,
  },
  printText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  dropdown: {
    ...uiStyles.input,
    height: 50,
  },
  row: {
    marginBottom: 12,
  },
  input: {
    ...uiStyles.input,
  },
  submitBtn: {
    backgroundColor: '#b30000',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  documentStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  viewBtn: {
    ...uiStyles.primaryButton,
    marginTop: 4,
  },
  viewBtnText: {
    ...uiStyles.primaryButtonText,
  },
  paymentModalContent: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  paymentTitle: {
    color: '#1e40af',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paymentItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  penaltyText: {
    color: '#ef4444',
  },
  advanceText: {
    color: '#10b981',
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 10,
    marginBottom: 10,
  },
  totalSectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPayableContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPayableLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  totalPayableValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  payNowButton: {
    ...uiStyles.primaryButton,
    marginTop: 10,
  },
  payNowButtonText: {
    ...uiStyles.primaryButtonText,
  },
  paymentSummarySection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  tableHeader: {
    ...uiStyles.tableHeader,
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  tableCell: {
    ...uiStyles.tableCell,
  },
  rowEven: {
    ...uiStyles.tableStripe,
  },
  rowOdd: {
    backgroundColor: '#ffffff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#b30000',
  },
  payButton: {
    ...uiStyles.primaryButton,
    marginTop: 10,
    width: 120,
    flexDirection: 'row',
  },
  payButtonText: {
    ...uiStyles.primaryButtonText,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 6,
  },
  previewImage: {
    width: '95%',
    height: '75%',
    borderRadius: 10,
  },
  downloadBtn: {
    marginTop: 15,
    backgroundColor: '#0c3c78',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  receiptContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  receiptInfo: {
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  tableHeaderRow: {
    ...uiStyles.tableHeader,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
  },
  qrAndContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  qrImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    marginTop: 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});

export default sharedStyles;
