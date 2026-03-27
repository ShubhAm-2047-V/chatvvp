import React from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ViewStyle, StyleProp } from 'react-native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({ children, style, delay = 0 }) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(600)}
      exiting={FadeOut.duration(400)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedScreenWrapper;
