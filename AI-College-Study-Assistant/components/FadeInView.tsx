import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  duration?: number;
}

export default function FadeInView({ children, style, duration = 500 }: FadeInViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  return (
    <Animated.View style={[{ opacity: fadeAnim, flex: 1 }, style]}>
      {children}
    </Animated.View>
  );
}
