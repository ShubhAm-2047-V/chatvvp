import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Animated, Easing } from 'react-native';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalNotes: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Pulse animation loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ title, value, icon, color, delay }: any) => (
    <Card translucent style={styles.cardWrapper} delay={delay}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#FFF" />
      </View>
      <View>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerSpacer} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Header Card */}
        <Card translucent style={styles.headerCardWrapper} delay={100}>
          <View>
            <Text style={styles.welcomeLabel}>CONTROL CENTER</Text>
            <Text style={styles.welcomeMain}>System Overview</Text>
            <Text style={styles.welcomeSub}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.statusText}>LIVE</Text>
          </View>
        </Card>

        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard title="Students" value={stats?.totalStudents} icon="people" color="#6366f1" delay={200} />
            <StatCard title="Teachers" value={stats?.totalTeachers} icon="school" color="#10b981" delay={300} />
            <StatCard title="All Notes" value={stats?.totalNotes} icon="document-text" color="#8b5cf6" delay={400} />
            <StatCard title="Active Now" value={stats?.activeUsers} icon="flash" color="#f59e0b" delay={500} />
          </View>
        )}

        <Text style={styles.sectionHeading}>Management Tools</Text>
        
        <View style={styles.actionGrid}>
          {/* User Management Tile */}
          <TouchableOpacity 
            style={styles.actionTile}
            onPress={() => navigation.navigate('Users')}
            activeOpacity={0.9}
          >
            <Card translucent style={styles.actionInner} delay={600}>
              <View style={[styles.actionIconBg, { backgroundColor: THEME_COLORS.primary + '20' }]}>
                <Ionicons name="people" size={28} color={THEME_COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Manage Users</Text>
              <Text style={styles.actionDesc}>Edit, block, or delete</Text>
            </Card>
          </TouchableOpacity>

          {/* Analytics Tile */}
          <TouchableOpacity 
            style={styles.actionTile}
            onPress={() => Alert.alert('Premium View', 'Detailed analytics are synchronized with production data.')}
            activeOpacity={0.9}
          >
            <Card translucent style={styles.actionInner} delay={700}>
              <View style={[styles.actionIconBg, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="analytics" size={28} color="#10b981" />
              </View>
              <Text style={styles.actionLabel}>Performance</Text>
              <Text style={styles.actionDesc}>System health logs</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Bottom Banner */}
        <View style={styles.footerInfo}>
          <Ionicons name="shield-checkmark" size={16} color={THEME_COLORS.textLight} />
          <Text style={styles.footerText}>Secure Administrative Session</Text>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  headerSpacer: {
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerCardWrapper: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME_COLORS.primary,
    letterSpacing: 1.5,
  },
  welcomeMain: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
    marginTop: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: THEME_COLORS.textLight,
    marginTop: 2,
    fontWeight: '600'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    ...PIXEL_SHADOWS.card
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    width: (width - 52) / 2,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    ...PIXEL_SHADOWS.button
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  statTitle: {
    fontSize: 11,
    color: THEME_COLORS.textLight,
    marginTop: 1,
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME_COLORS.textLight,
    marginTop: 36,
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionTile: {
    flex: 1,
  },
  actionInner: {
    padding: 20,
    height: 160,
    justifyContent: 'center'
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
    ...PIXEL_SHADOWS.card
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  actionDesc: {
    fontSize: 11,
    color: THEME_COLORS.textLight,
    marginTop: 4,
    fontWeight: '600'
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: THEME_COLORS.textLight,
    fontWeight: '700',
  },
});
