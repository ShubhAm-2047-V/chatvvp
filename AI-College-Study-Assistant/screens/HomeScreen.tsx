import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS } from '../constants/theme';

export default function HomeScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, headerSlide]);

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headerArea, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
          <Text style={styles.header}>Welcome Back!</Text>
          <Text style={styles.subheader}>Ready to crush your study goals today?</Text>
        </Animated.View>
        
        <Card translucent style={styles.heroCard} delay={200}>
          <View style={styles.heroInner}>
            <View>
              <Text style={styles.heroTitle}>Today's Focus</Text>
              <Text style={styles.heroText}>Advanced React Patterns</Text>
            </View>
            <Button 
              title="Continue" 
              onPress={() => {}} 
              type="glass"
              style={styles.heroButton} 
              textStyle={styles.heroButtonText}
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Recent Notes</Text>
        <Card translucent delay={300}>
          <Text style={styles.cardTitle}>Data Structures</Text>
          <Text style={styles.cardDesc}>Last edited 2 hours ago</Text>
        </Card>
        <Card translucent delay={400}>
          <Text style={styles.cardTitle}>Machine Learning Algorithms</Text>
          <Text style={styles.cardDesc}>Last edited yesterday</Text>
        </Card>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  headerArea: { marginBottom: 24, marginTop: 10 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 4 },
  subheader: { fontSize: 16, color: THEME_COLORS.textLight, fontWeight: '500' },
  heroCard: { 
    padding: 0, 
    overflow: 'hidden', 
    backgroundColor: 'rgba(91, 108, 255, 0.1)',
    borderColor: THEME_COLORS.primary,
  },
  heroInner: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { color: THEME_COLORS.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 },
  heroText: { color: THEME_COLORS.secondary, fontSize: 18, fontWeight: '800', maxWidth: '60%' },
  heroButton: { height: 40, paddingVertical: 0, paddingHorizontal: 16 },
  heroButtonText: { fontSize: 13 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: THEME_COLORS.secondary, marginTop: 12, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.secondary, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: THEME_COLORS.textLight, fontWeight: '500' },
});
