import React, { useEffect, useMemo } from 'react';
import { Switch, Text, View } from 'react-native';
import Button from '../../../Components/AppButton';
import { SWM_RATE_API, SWM_SUBCATEGORY_LIST_API } from '../../../api/apiRoutes';
import { Choice, Input } from './SwmFormFields';
import { connectionPayload, emptyConnection, facilities, options } from '../swmConsumerForm';
import { useData } from '../swmRequests';
import { styles } from '../swmFormStyles';

export default function ConnectionFields({ item, index, categories, effective, onChange, onRemove, onRate, disabled }) {
  const categoryQuery = useMemo(() => item.categoryTypeMasterId
    ? { categoryTypeMasterId: item.categoryTypeMasterId, all: 'all' } : undefined, [item.categoryTypeMasterId]);
  const subcategories = useData(SWM_SUBCATEGORY_LIST_API, categoryQuery);
  const rateQuery = useMemo(() => {
    if (!item.subCategoryTypeMasterId || !effective || Number(item.totalNoOfHouseAreaRoomTruck) < 1) return undefined;
    return { ...connectionPayload(item), dateOfEffective: effective };
  }, [item, effective]);
  const rate = useData(SWM_RATE_API, rateQuery);
  const quotedRate = rate?.data?.currentRate;

  useEffect(() => {
    onRate(item.key, quotedRate == null ? null : Number(quotedRate));
  }, [item.key, onRate, quotedRate]);

  return (
    <View style={styles.record}>
      <Text selectable style={styles.label}>Connection {index + 1}</Text>
      <Choice label="Category *" data={categories} value={item.categoryTypeMasterId} disabled={disabled}
        onChange={categoryTypeMasterId => onChange({
          ...emptyConnection(item.key), categoryTypeMasterId, totalNoOfHouseAreaRoomTruck: item.totalNoOfHouseAreaRoomTruck,
        })} />
      <Choice label="Sub Category *" data={options(subcategories?.data, 'subCategoryType')}
        value={item.subCategoryTypeMasterId} disabled={disabled || !subcategories?.data}
        onChange={subCategoryTypeMasterId => onChange({ subCategoryTypeMasterId })} />
      {subcategories?.error ? <Text selectable accessibilityRole="alert">{subcategories.error}</Text> : null}
      <Input label="No. of Houses / Rooms / Trucks or Area *" value={item.totalNoOfHouseAreaRoomTruck}
        keyboardType="decimal-pad" disabled={disabled}
        onChange={totalNoOfHouseAreaRoomTruck => onChange({ totalNoOfHouseAreaRoomTruck })} />
      {Number(item.categoryTypeMasterId) === 16 && facilities.map(([label, enabled, quantity]) => (
        <View key={enabled} style={styles.field}>
          <View style={styles.switchRow}>
            <Text selectable style={styles.label}>Has {label}</Text>
            <Switch accessibilityLabel={'Has ' + label} value={item[enabled]} disabled={disabled}
              onValueChange={value => onChange({ [enabled]: value, [quantity]: value ? item[quantity] : '0' })} />
          </View>
          {item[enabled] && (
            <Input label={label + ' Quantity *'} value={item[quantity]} keyboardType="decimal-pad"
              disabled={disabled} onChange={value => onChange({ [quantity]: value })} />
          )}
        </View>
      ))}
      {rateQuery && (
        <Text selectable style={styles.rate}>
          {rate?.error ? 'Monthly rate unavailable' : rate?.data?.currentRate != null
            ? 'Monthly Rate  ₹ ' + rate.data.currentRate : 'Loading monthly rate…'}
        </Text>
      )}
      {onRemove && <Button title="Remove Connection" color="#b91c1c" disabled={disabled} onPress={onRemove} />}
    </View>
  );
}
