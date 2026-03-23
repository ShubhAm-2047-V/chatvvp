import React from 'react';
import { StyleSheet, ImageBackground, View, SafeAreaView, ViewStyle, StatusBar } from 'react-native';

const SKY_BG = require('../assets/images/retro-sky.png');

interface BackgroundWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  noSafeArea?: boolean;
}

export const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  style, 
  contentContainerStyle,
  noSafeArea = false
}) => {
  const content = (
    <View style={[styles.container, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <ImageBackground source={SKY_BG} style={[styles.background, style]} resizeMode="cover">
      <StatusBar barStyle="dark-content" />
      <View style={styles.overlay} />
      {noSafeArea ? content : <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle light overlay
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
