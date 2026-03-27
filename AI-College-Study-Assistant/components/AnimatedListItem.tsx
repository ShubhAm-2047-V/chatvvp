import React from 'react';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  style?: ViewStyle | ViewStyle[];
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ children, index, style }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify().damping(20).stiffness(150)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedListItem;
