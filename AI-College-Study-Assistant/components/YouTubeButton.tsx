import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Linking, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YouTubeButtonProps {
  videoUrl?: string;
  style?: any;
}

/**
 * YouTube button component - opens video URL in external browser/app.
 */
export const YouTubeButton: React.FC<YouTubeButtonProps> = ({ videoUrl, style }) => {
  // Hide button if videoUrl is missing
  if (!videoUrl || videoUrl.trim() === '') {
    return null;
  }

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
      } else {
        console.warn(`Cannot open URL: ${videoUrl}`);
      }
    } catch (error) {
      console.error('Error opening YouTube link:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.inner}>
        <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
        <Text style={styles.text}>Watch on YouTube</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
