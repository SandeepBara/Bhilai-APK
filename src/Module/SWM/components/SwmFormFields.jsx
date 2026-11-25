import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { styles } from '../swmFormStyles';

export function Section({ title, children }) {
  return <View style={styles.card}><Text selectable accessibilityRole="header" style={styles.title}>{title}</Text>{children}</View>;
}

export function Input({ label, value, onChange, disabled, ...props }) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.label}>{label}</Text>
      <TextInput {...props} accessibilityLabel={label} style={styles.input}
        editable={!disabled} value={value} onChangeText={onChange} />
    </View>
  );
}

export function Choice({ label, data, value, onChange, disabled }) {
  return (
    <View style={styles.field}>
      <Text selectable style={styles.label}>{label}</Text>
      <Dropdown accessibilityLabel={label} style={styles.input} data={data}
        labelField="label" valueField="value" value={value} disable={disabled}
        placeholder={'Select ' + label.replace(/ \*$/, '')} onChange={item => onChange(item.value)} />
    </View>
  );
}
