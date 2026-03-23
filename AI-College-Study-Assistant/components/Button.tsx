import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, Animated, View, ActivityIndicator } from 'react-native';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  type?: 'primary' | 'secondary' | 'outline' | 'glass';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({ title, onPress, style, textStyle, type = 'primary', loading = false, icon }: ButtonProps) {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          type === 'primary' && styles.primary,
          type === 'secondary' && styles.secondary,
          type === 'outline' && styles.outline,
          type === 'glass' && styles.glass,
          style
        ]}
        onPress={onPress}
        disabled={loading}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={type === 'outline' ? THEME_COLORS.secondary : '#FFF'} />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[
                styles.text,
                type === 'primary' && styles.primaryText,
                type === 'secondary' && styles.secondaryText,
                type === 'outline' && styles.outlineText,
                type === 'glass' && styles.glassText,
                textStyle
              ]}>
                {title}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: THEME_COLORS.secondary,
    borderColor: '#000',
    ...PIXEL_SHADOWS.button,
  },
  secondary: {
    backgroundColor: THEME_COLORS.accent,
    borderColor: '#000',
    ...PIXEL_SHADOWS.button,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: THEME_COLORS.secondary,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.button,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: THEME_COLORS.secondary,
  },
  glassText: {
    color: THEME_COLORS.primary,
  }
});
