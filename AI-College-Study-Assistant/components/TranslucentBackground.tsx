import React from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const SKY_BG = require('../assets/images/retro-sky.png');

interface TranslucentBackgroundProps {
  children: React.ReactNode;
  blurIntensity?: number;
  overlayColor?: string;
  noSafeArea?: boolean;
}

export default function TranslucentBackground({
  children,
  blurIntensity = 20,
  overlayColor = 'rgba(255, 255, 255, 0.4)',
  noSafeArea = false
}: TranslucentBackgroundProps) {
  const Content = (
    <View style={styles.content}>
      {children}
    </View>
  );

  return (
    <ImageBackground source={SKY_BG} style={styles.background} resizeMode="cover">
      <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFill}>
        <View style={[styles.overlay, { backgroundColor: overlayColor }]} />
        {noSafeArea ? Content : (
          <SafeAreaView style={styles.safeArea}>
            {Content}
          </SafeAreaView>
        )}
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
