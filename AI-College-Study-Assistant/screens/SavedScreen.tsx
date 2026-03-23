import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FadeInView from '../components/FadeInView';
import Card from '../components/Card';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS } from '../constants/theme';

export default function SavedScreen() {
  return (
    <BackgroundWrapper>
      <FadeInView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Saved Resources</Text>
          <Card translucent>
            <Text style={styles.cardTitle}>Complete React Guide</Text>
            <Text style={styles.cardDesc}>Video series</Text>
          </Card>
          <Card translucent>
            <Text style={styles.cardTitle}>Linear Algebra Cheatsheet</Text>
            <Text style={styles.cardDesc}>PDF Document</Text>
          </Card>
        </ScrollView>
      </FadeInView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 24, marginTop: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: THEME_COLORS.textLight, fontWeight: '500' },
});
