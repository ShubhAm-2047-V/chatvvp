import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

interface ActivityItem {
  _id: string;
  type: 'search' | 'ai_chat' | 'ai_explain' | 'view_note' | 'watch_video';
  topic?: string;
  subject?: string;
  query?: string;
  createdAt: string;
  metadata?: {
    videoUrl?: string;
  };
}

export default function StudentHistoryScreen() {
  const [history, setHistory] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'ai' | 'note'>('all');
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  const fetchHistory = async () => {
    try {
      const response = await api.get('/student/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, headerSlide]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'video') return item.type === 'watch_video';
    if (filter === 'ai') return ['ai_chat', 'ai_explain', 'search'].includes(item.type);
    if (filter === 'note') return item.type === 'view_note';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'watch_video': return 'play-circle';
      case 'ai_chat':
      case 'ai_explain': return 'chatbubble-ellipses';
      case 'search': return 'search';
      case 'view_note': return 'document-text';
      default: return 'time';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'watch_video': return '#EF4444';
      case 'ai_chat':
      case 'ai_explain': return THEME_COLORS.primary;
      case 'search': return '#3B82F6';
      case 'view_note': return '#10B981';
      default: return THEME_COLORS.textLight;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'watch_video': return 'Watched Video';
      case 'view_note': return 'Viewed Note';
      case 'ai_chat':
      case 'ai_explain': return 'AI Conversation';
      case 'search': return 'AI Search';
      default: return 'Activity';
    }
  };

  const renderItem = ({ item, index }: { item: ActivityItem; index: number }) => (
    <Card translucent style={styles.activityCard} delay={200 + index * 100}>
      <View style={[styles.iconContainer, { backgroundColor: getColor(item.type) + '15' }]}>
        <Ionicons name={getIcon(item.type) as any} size={20} color={getColor(item.type)} />
      </View>
      <View style={styles.content}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.topic || item.query || 'Study Session'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.itemType, { color: getColor(item.type) }]}>{getLabel(item.type)}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.itemDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={THEME_COLORS.border} />
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <Animated.View style={[styles.headerWrapper, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <View>
            <Text style={styles.title}>Your Learning Journey</Text>
            <Text style={styles.subtitle}>Relive your progress</Text>
          </View>
        </BlurView>
        <BlurView intensity={60} tint="light" style={styles.filterBar}>
          {(['all', 'note', 'ai', 'video'] as const).map((f) => (
            <TouchableOpacity 
              key={f}
              style={[styles.filterBtn, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME_COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => renderItem({ item, index })}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={THEME_COLORS.border} />
              <Text style={styles.emptyText}>No history found for this category</Text>
            </View>
          }
        />
      )}
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 2,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
    zIndex: 10,
  },
  header: { padding: 20, paddingTop: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: THEME_COLORS.secondary },
  subtitle: { fontSize: 13, color: THEME_COLORS.textLight, marginTop: 4, fontWeight: '500' },
  filterBar: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)'
  },
  filterBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10, 
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: THEME_COLORS.border
  },
  activeFilter: { backgroundColor: THEME_COLORS.secondary, borderColor: '#000' },
  filterText: { fontSize: 10, fontWeight: '800', color: THEME_COLORS.textLight },
  activeFilterText: { color: '#FFF' },
  list: { padding: 16, paddingBottom: 100 },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  itemType: { fontSize: 10, fontWeight: '800' },
  dot: { color: THEME_COLORS.border },
  itemDate: { fontSize: 10, color: THEME_COLORS.textLight },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: THEME_COLORS.textLight, fontWeight: 'bold' }
});
