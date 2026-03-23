import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Fonts } from '@/constants/theme';

interface LogoProps {
  size?: number;
  textColor?: string;
  style?: any;
}

/**
 * Reusable 'Study AI' Logo component matching the web dashboard.
 */
export const Logo: React.FC<LogoProps> = ({ size = 28, textColor = '#333', style }) => {
  return (
    <View style={[styles.container, style]}>
      <IconSymbol name="brain.head.profile" size={size} color="#0a7ea4" />
      <Text style={[styles.text, { fontSize: size * 0.8, color: textColor }]}>
        Study AI
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    // Matching the web dashboard's primary color
  },
  text: {
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
});
