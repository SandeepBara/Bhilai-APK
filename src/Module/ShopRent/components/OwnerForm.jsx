import React from 'react';
import Button from '../../../Components/AppButton';
import { Choice, Field, Panel } from './ShopRentUI';

const relationTypes = ['S/O', 'D/O', 'W/O', 'C/O'].map(id => ({ id }));

export default function OwnerForm({ owner, number, disabled, onChange, onRemove }) {
  return (
    <Panel title={'Owner ' + number}>
      <Field label="Owner Name" value={owner.ownerName} editable={!disabled}
        onChangeText={value => onChange('ownerName', value)} />
      <Field label="Guardian Name" value={owner.guardianName} editable={!disabled}
        onChangeText={value => onChange('guardianName', value)} />
      <Choice label="Relation" items={relationTypes} labelKey="id" value={owner.relationType}
        disabled={disabled} onChange={value => onChange('relationType', value)} />
      <Field label="Mobile No." value={owner.mobileNo} keyboardType="number-pad" maxLength={10}
        editable={!disabled} onChangeText={value => onChange('mobileNo', value)} />
      {onRemove && <Button title="Remove Owner" disabled={disabled} onPress={onRemove} />}
    </Panel>
  );
}
