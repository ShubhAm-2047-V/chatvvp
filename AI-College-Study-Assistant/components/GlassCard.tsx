import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, ViewStyle, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { GLASS_STYLES } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurStyle?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  blurStyle,
  intensity = 50,
  tint = 'light',
  delay = 0
}) => {
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

  return (
    <Animated.View style={[GLASS_STYLES.card, style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <BlurView intensity={intensity} tint={tint} style={[GLASS_STYLES.blur, blurStyle]}>
        {children}
      </BlurView>
    </Animated.View>
  );
};
