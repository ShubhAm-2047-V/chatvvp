import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  translucent?: boolean;
  delay?: number;
}

export default function Card({ children, style, translucent = false, delay = 0 }: CardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  if (translucent) {
    return (
      <Animated.View style={[styles.glassCard, style, animatedStyle]}>
        <BlurView intensity={50} tint="light" style={styles.blurPadding}>
          {children}
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.card, style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    ...PIXEL_SHADOWS.card,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME_COLORS.border,
  },
  glassCard: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    backgroundColor: THEME_COLORS.glassBg,
    overflow: 'hidden',
    ...PIXEL_SHADOWS.card,
    marginBottom: 16,
  },
  blurPadding: {
    padding: 16,
  },
});
