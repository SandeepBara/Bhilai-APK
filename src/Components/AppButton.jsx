import React from 'react';
import { Text } from 'react-native';
import { uiStyles } from '../style/theme';
import { CopyablePressable } from './CopyableControl';

export default function AppButton({
  title, color, disabled, accessibilityState, touchSoundDisabled, ...props
}) {
  const isDisabled = Boolean(disabled ?? accessibilityState?.disabled);

  return (
    <CopyablePressable
      accessibilityRole="button"
      {...props}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      android_disableSound={touchSoundDisabled}
      style={[
        uiStyles.primaryButton,
        color ? { backgroundColor: color } : null,
        isDisabled && uiStyles.disabledButton,
      ]}
    >
      <Text style={uiStyles.primaryButtonText}>{title}</Text>
    </CopyablePressable>
  );
}
