import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS, Fonts } from '../constants/theme';

export default function LoadingScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.container}>
        <Animated.View style={[
          styles.logoContainer, 
          { 
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim
          }
        ]}>
            <Image 
                source={require('../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.branding}>CHAT. VVP</Text>
        </Animated.View>
        <View style={styles.loaderContainer}>
            <View style={styles.loaderBar}>
                <Animated.View style={styles.loaderFill} />
            </View>
            <Text style={styles.loadingText}>Initializing study sanctuary...</Text>
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 20,
    ...PIXEL_SHADOWS.card,
  },
  branding: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME_COLORS.secondary,
    letterSpacing: 3,
    fontFamily: Fonts.rounded,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%',
  },
  loaderBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loaderFill: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
  },
  loadingText: {
    fontSize: 12,
    color: THEME_COLORS.textLight,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
