import React, { Children, forwardRef, isValidElement } from 'react';
import {
  Alert,
  Pressable,
  Text,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

function collectText(children, insideText = false) {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') {
      return insideText ? String(child) : '';
    }
    if (!isValidElement(child)) return '';
    return collectText(child.props.children, insideText || child.type === Text);
  }).filter(text => text !== '').join(insideText ? '' : ' ');
}

function copyableControl(Component, isText = false) {
  return forwardRef(function CopyableControl({
    children, onLongPress, accessibilityLabel, ...props
  }, ref) {
    const text = collectText(children, isText).trim() || accessibilityLabel;
    const copy = () => Alert.alert('Copy text?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Copy', onPress: () => Clipboard.setString(text) },
    ]);

    return (
      <Component
        {...props}
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        onLongPress={onLongPress ?? (text ? copy : undefined)}
        {...(isText ? { selectable: false } : {})}
      >
        {children}
      </Component>
    );
  });
}

export const CopyableText = copyableControl(Text, true);
export const CopyablePressable = copyableControl(Pressable);
export const CopyableTouchableHighlight = copyableControl(TouchableHighlight);
export const CopyableTouchableNativeFeedback = copyableControl(TouchableNativeFeedback);
export const CopyableTouchableOpacity = copyableControl(TouchableOpacity);
export const CopyableTouchableWithoutFeedback = copyableControl(TouchableWithoutFeedback);
