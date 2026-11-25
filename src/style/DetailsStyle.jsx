// AssessmentStyles.js
import { StyleSheet } from 'react-native';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

import Colors from '../Module/Constants/Colors';
import { uiStyles } from './theme';

export default StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f4faff' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  banner: {
    backgroundColor: '#e6f0ff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  bannerText: { fontSize: 14 },
  appId: { color: '#ff6600', fontWeight: 'bold' },
  statusText: { marginTop: 5, fontSize: 14 },
  expired: { color: 'red', fontWeight: 'bold' },
  active: { color: 'green', fontWeight: 'bold' },

  sectionTitle: {
    ...uiStyles.cardTitle,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: Colors.headignColor,
    borderBottomWidth: 0,
    elevation: 6,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    alignSelf: 'stretch',
  },

  section: {
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingBottom: responsiveWidth(4),
    marginTop: responsiveHeight(2),
    borderTopWidth: 0,
    borderColor: Colors.cardBorder || '#f0f0f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 1,
    alignSelf: 'stretch',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: responsiveHeight(0.5),
    paddingVertical: responsiveHeight(0.8),
    paddingHorizontal: responsiveWidth(2),
    borderBottomWidth: 1,
    borderBottomColor: Colors.rowDivider || '#eee',
  },
  label: {
    ...uiStyles.label,
    flex: 1,
    minWidth: responsiveWidth(25),
  },
  value: {
    ...uiStyles.text,
    flex: 1,
    textAlign: 'right',
    minWidth: responsiveWidth(25),
  },

  // ===== OWNER TABLE STYLES =====
  ownerHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },
  ownerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  ownerCol: {
    ...uiStyles.tableCell,
    width: responsiveWidth(25),
    textAlign: 'center',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  ownerColData: {
    width: responsiveWidth(25),
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: responsiveFontSize(1.6),
    color: '#000',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  // ===== DOCUMENT/PAYMENT TABLE STYLES =====
  docHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
    backgroundColor: '#f2f2f2',
  },

  docRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  docCol: {
    ...uiStyles.tableCell,
    width: responsiveWidth(25),
    textAlign: 'center',
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  docColData: {
    width: responsiveWidth(25),
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    color: '#000',
    fontSize: responsiveFontSize(1.6),
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  // ===== PAYMENT ROW STYLES =====
  paymentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#FFFFFF',
  },
  paymentCol: {
    ...uiStyles.tableCell,
    width: responsiveWidth(25),
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  remarksTableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },

  remarksHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },

  remarksHeaderCol: {
    width: responsiveWidth(25),
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: responsiveFontSize(1.7),
    color: '#000',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  remarksRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  remarksColRole: {
    width: responsiveWidth(20),
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: responsiveFontSize(1.5),
    color: '#000',
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  // remarksColRemark: {
  //   width: responsiveWidth(35),
  //   textAlign: 'left',
  //   paddingHorizontal: 8,
  //   paddingVertical: 12,
  //   fontSize: responsiveFontSize(1.5),
  //   color: '#000',
  //   borderRightWidth: 1,
  //   borderRightColor: '#ddd',
  // },

  // remarksColTime: {
  //   width: responsiveWidth(25),
  //   textAlign: 'center',
  //   paddingHorizontal: 8,
  //   paddingVertical: 12,
  //   fontSize: responsiveFontSize(1.4),
  //   color: '#666',
  //   borderRightWidth: 1,
  //   borderRightColor: '#ddd',
  // },

  // remarksColAction: {
  //   width: responsiveWidth(20),
  //   textAlign: 'center',
  //   paddingHorizontal: 8,
  //   paddingVertical: 12,
  //   fontSize: responsiveFontSize(1.5),
  //   color: '#007AFF',
  //   fontWeight: '600',
  //   borderRightWidth: 1,
  //   borderRightColor: '#ddd',
  // },

  // ===== BUTTON STYLES =====
  viewBtn: {
    ...uiStyles.primaryButton,
    width: 50,
    height: 35,
    marginTop: responsiveHeight(1),
    marginLeft: responsiveWidth(2),
  },

  viewBtnText: {
    ...uiStyles.primaryButtonText,
  },

  // Helper style to remove right border from last column
  lastCol: {
    borderRightWidth: 0,
  },

  noRemarksContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginTop: 10,
  },
  noRemarksText: {
    color: '#999',
    fontSize: responsiveFontSize(1.6),
    fontStyle: 'italic',
  },

  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },

  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  actionBtn: {
    ...uiStyles.primaryButton,
    width: 85,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionBtnText: {
    ...uiStyles.primaryButtonText,
  },

  imageContainer: {
    marginTop: responsiveHeight(1.5),
    padding: responsiveWidth(2),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  imageLabel: {
    fontSize: responsiveFontSize(2),
    fontWeight: '600',
    marginBottom: responsiveHeight(1),
    color: '#222',
  },

  image: {
    width: responsiveWidth(60),
    height: responsiveHeight(25),
  },

  noImageText: {
    fontSize: responsiveFontSize(1.7),
    color: '#777',
    paddingVertical: responsiveHeight(4),
  },
});
