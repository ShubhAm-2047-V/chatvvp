import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  translucent?: boolean;
  delay?: number;
}

export default function Card({ children, style, translucent = false, delay = 0 }: CardProps) {
  const enteringAnimation = FadeInDown.delay(delay).springify().damping(20).stiffness(150);

  if (translucent) {
    return (
      <Animated.View 
        entering={enteringAnimation}
        exiting={FadeOut}
        layout={Layout.springify()}
        style={[styles.glassCard, style]}
      >
        <BlurView intensity={50} tint="light" style={styles.blurPadding}>
          {children}
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View 
      entering={enteringAnimation}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[styles.card, style]}
    >
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
