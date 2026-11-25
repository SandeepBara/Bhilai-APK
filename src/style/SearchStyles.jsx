// SearchStyles.js
import { StyleSheet } from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Colors from '../Module/Constants/Colors';
import { uiStyles } from './theme';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  seacrhCont: {
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    marginVertical: responsiveHeight(2),
    marginHorizontal: responsiveWidth(3),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderRadius: 5,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: responsiveHeight(10),
    elevation: 5,
    backgroundColor: Colors.background,
  },
  searchhead: {
    ...uiStyles.cardHeader,
    paddingVertical: responsiveHeight(1),
    paddingHorizontal: responsiveWidth(1),
    marginBottom: responsiveHeight(1),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 5,
    overflow: 'visible',
  },
  text: {
    color: Colors.background,
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveHeight(1),
    marginRight: responsiveWidth(5),
  },
  optionLabel: {
    fontSize: responsiveFontSize(1.9),
    color: Colors.textPrimary,
    marginLeft: responsiveWidth(1.5),
  },
  circle: {
    width: responsiveWidth(6),
    height: responsiveWidth(6),
    borderRadius: responsiveWidth(3),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselected: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderColor,
  },
  selected: {
    backgroundColor: Colors.borderColor,
    borderColor: Colors.borderColor,
  },
  innerDot: {
    width: responsiveWidth(2.5),
    height: responsiveWidth(2.5),
    borderRadius: responsiveWidth(1.25),
    backgroundColor: Colors.background,
  },
  dropdown: {
    ...uiStyles.input,
    height: responsiveHeight(5),
    width: responsiveWidth(40),
    marginRight: responsiveWidth(2),
  },
  input: {
    ...uiStyles.input,
    width: responsiveWidth(40),
    height: responsiveHeight(5),
  },
  selectWardKey: {
    flexDirection: 'row',
    marginTop: responsiveHeight(1.5),
  },
  button: {
    ...uiStyles.primaryButton,
    marginTop: responsiveHeight(2),
  },
  buttonText: {
    ...uiStyles.buttonText,
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(2),
    marginHorizontal: responsiveWidth(3),
    marginVertical: responsiveHeight(1),
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: responsiveHeight(0.8),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  label: {
    ...uiStyles.label,
    width: '45%',
  },
  value: {
    ...uiStyles.text,
    width: '55%',
    textAlign: 'right',
    fontWeight: '600',
  },
  viewButton: {
    ...uiStyles.primaryButton,
    marginTop: responsiveHeight(1),
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    ...uiStyles.primaryButtonText,
  },
});

export default styles;
