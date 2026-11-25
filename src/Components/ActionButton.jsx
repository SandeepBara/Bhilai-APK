import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../Constants/Colors';
import { CopyableTouchableOpacity } from './CopyableControl';
import { uiStyles } from '../style/theme';
const ActionButton = ({ name, label, color = "#007AFF", onPress = () => { }, show = true }) => {
    if (!show)
        return null;
    return (
        <View style={styles.buttonWrapper}>
            <CopyableTouchableOpacity
                style={[styles.button, ]} 
                onPress={onPress}
            >
                <MaterialIcons
                    name={name}
                    size={10}
                    color={color} 
                />
                <Text style={[styles.label, { color, marginTop: 4 }]}>{label}</Text>
            </CopyableTouchableOpacity>
        </View>
    );
};
export default ActionButton;

const styles = StyleSheet.create({
    buttonWrapper: {
        width: '32%', 
        marginHorizontal: '0.66%', 
        marginBottom: 10,
    },
    button: {
      ...uiStyles.primaryButton,
      width: '100%',
      height: 'auto',
      borderWidth: 1,
      borderColor: '#ddd',
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    label: {
      ...uiStyles.label,
      textAlign: 'center',
      paddingHorizontal: 2,
      flexWrap: 'wrap',
    },
});