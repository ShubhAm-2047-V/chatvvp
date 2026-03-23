import React from 'react';
import { TouchableOpacity } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export function HapticTab(props: BottomTabBarButtonProps) {
  return <TouchableOpacity {...(props as any)} activeOpacity={0.8} />;
}
