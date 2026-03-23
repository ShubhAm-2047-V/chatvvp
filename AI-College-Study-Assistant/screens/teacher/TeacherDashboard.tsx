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
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

interface TeacherStats {
  totalNotes: number;
  totalViews: number;
  totalInteractions: number;
}

export default function TeacherDashboard() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  const fetchStats = async () => {
    try {
      const response = await api.get('/teacher/my-notes');
      const notes = response.data.notes || [];
      setStats({
        totalNotes: notes.length,
        totalViews: notes.reduce((acc: number, n: any) => acc + (n.views || 0), 0),
        totalInteractions: notes.length * 5,
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Header entrance
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Pulse animation loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    
    return () => pulse.stop();
  }, [pulseAnim, headerAnim, headerSlide]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ title, value, icon, color, delay }: any) => (
    <Card translucent style={styles.statCardWrapper} delay={delay}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.primary} />}
      >
        <Animated.View style={[styles.headerWrapper, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
          <BlurView intensity={80} tint="light" style={styles.headerCard}>
            <View>
              <Text style={styles.welcomeLabel}>TEACHER CONSOLE</Text>
              <Text style={styles.welcomeMain}>Dashboard</Text>
              <Text style={styles.welcomeSub}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </BlurView>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard title="My Notes" value={stats?.totalNotes} icon="document-text" color={THEME_COLORS.primary} delay={200} />
            <StatCard title="Total Views" value={stats?.totalViews} icon="eye" color="#10B981" delay={300} />
            <StatCard title="Rank" value="#12" icon="trophy" color="#8B5CF6" delay={400} />
            <StatCard title="Credits" value={stats?.totalNotes ? stats.totalNotes * 10 : 0} icon="star" color="#F59E0B" delay={500} />
          </View>
        )}

        <Text style={styles.sectionHeading}>Teaching Tools</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionTile}
            onPress={() => navigation.navigate('UploadNote')}
            activeOpacity={0.8}
          >
            <Card translucent style={styles.actionCard} delay={600}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(91, 108, 255, 0.1)' }]}>
                <Ionicons name="camera" size={26} color={THEME_COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Upload Note</Text>
              <Text style={styles.actionDesc}>Scan PDF/Image (OCR)</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionTile}
            onPress={() => navigation.navigate('Library')}
            activeOpacity={0.8}
          >
            <Card translucent style={styles.actionCard} delay={700}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="library" size={26} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>My Library</Text>
              <Text style={styles.actionDesc}>Manage your notes</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={{ marginTop: 12 }}
            onPress={() => Alert.alert('Coming Soon', 'Dynamic video mapping is currently syncing.')}
            activeOpacity={0.8}
          >
            <Card translucent style={styles.actionInnerFull} delay={800}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.1)', marginBottom: 0, marginRight: 16 }]}>
                <Ionicons name="logo-youtube" size={26} color="#f43f5e" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>Video Resources</Text>
                <Text style={styles.actionDesc}>Connect YouTube lectures to topics</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME_COLORS.border} />
            </Card>
          </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Ionicons name="checkmark-circle" size={14} color={THEME_COLORS.textLight} />
          <Text style={styles.footerText}>Syncing with Student Portal</Text>
        </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  headerWrapper: {
    marginBottom: 24,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
  },
  headerCard: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME_COLORS.primary,
    letterSpacing: 1.5,
  },
  welcomeMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
    marginTop: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: THEME_COLORS.textLight,
    marginTop: 2,
    fontWeight: '500'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCardWrapper: {
    width: (width - 50) / 2,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  statTitle: {
    fontSize: 10,
    color: THEME_COLORS.textLight,
    marginTop: 1,
    fontWeight: '600'
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME_COLORS.textLight,
    marginTop: 32,
    marginBottom: 12,
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
  actionCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    marginBottom: 0
  },
  actionInnerFull: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    marginBottom: 0
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  actionDesc: {
    fontSize: 10,
    color: THEME_COLORS.textLight,
    marginTop: 4,
    fontWeight: '500'
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: THEME_COLORS.textLight,
    fontWeight: '600',
  },
});
