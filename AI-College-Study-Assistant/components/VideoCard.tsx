import React from 'react';
import { StyleSheet, View, Text, Linking, Platform } from 'react-native';
import Card from './Card';
import { YouTubeButton } from './YouTubeButton';
import { Ionicons } from '@expo/vector-icons';

interface VideoCardProps {
  title: string;
  subject: string;
  topic: string;
  url: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({ title, subject, topic, url }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-youtube" size={32} color="#FF0000" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {subject} • {topic}
          </Text>
        </View>
        <YouTubeButton
          videoUrl={url}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            minWidth: 140,
          }}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
});
