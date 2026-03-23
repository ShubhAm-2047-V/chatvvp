/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform, StyleSheet } from 'react-native';

export const THEME_COLORS = {
  primary: '#5b6cff',
  secondary: '#0f172a',
  accent: '#f43f5e',
  background: '#f8fafc',
  text: '#0f172a',
  textLight: '#64748b',
  border: '#e2e8f0',
  glassBg: 'rgba(255, 255, 255, 0.6)',
  inputBg: 'rgba(255, 255, 255, 0.7)',
};

export const PIXEL_SHADOWS = StyleSheet.create({
  card: {
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
});

export const GLASS_STYLES = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    backgroundColor: THEME_COLORS.glassBg,
    overflow: 'hidden',
    ...PIXEL_SHADOWS.card,
  },
  blur: {
    padding: 20,
  },
});

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
