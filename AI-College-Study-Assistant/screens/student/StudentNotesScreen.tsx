import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  Linking,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Dropdown from '../../components/Dropdown';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

interface SearchResult {
  _id: string;
  topic: string;
  preview: string;
  subject: string;
  formattedText?: string;
  imageUrl?: string;
  youtubeUrl?: string;
}

export default function StudentNotesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [allNotes, setAllNotes] = useState<SearchResult[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const searchBoxAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfileAndNotes();
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      ]),
      Animated.timing(searchBoxAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadProfileAndNotes = async () => {
    setLoading(true);
    try {
      const savedBranch = await AsyncStorage.getItem('branch');
      const savedYear = await AsyncStorage.getItem('year');
      if (savedBranch) setBranch(savedBranch);
      if (savedYear) setYear(savedYear);

      const response = await api.get('/student/notes');
      const notes = response.data || [];
      setAllNotes(notes);
      setResults(notes);
    } catch (error: any) {
      console.log('Error loading notes:', error);
      const msg = error.response?.data?.message || 'Failed to load notes. Please check your connection.';
      Alert.alert('Problem Loading Notes', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    const term = query.toLowerCase();
    const filtered = allNotes.filter(n => 
      !term || 
      n.topic?.toLowerCase().includes(term) || 
      n.subject?.toLowerCase().includes(term) ||
      n.formattedText?.toLowerCase().includes(term)
    );
    setResults(filtered);
  };

  // Auto-search as user types for better experience
  useEffect(() => {
    const term = query.toLowerCase();
    const filtered = allNotes.filter(n => 
      !term || 
      n.topic?.toLowerCase().includes(term) || 
      n.subject?.toLowerCase().includes(term) ||
      n.formattedText?.toLowerCase().includes(term)
    );
    setResults(filtered);
  }, [query, allNotes]);

  const watchVideo = async (item: SearchResult) => {
    if (item.youtubeUrl) {
      Linking.openURL(item.youtubeUrl);
      api.post('/student/activity/watch-video', {
        videoUrl: item.youtubeUrl,
        topic: item.topic,
        subject: item.subject
      });
    } else {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.topic + ' ' + item.subject)}`;
      Linking.openURL(url);
    }
  };

  const navToDetail = (item: SearchResult) => {
    navigation.navigate('NoteDetail', { note: item });
    api.post('/student/activity/view-note', {
      noteId: item._id,
      topic: item.topic,
      subject: item.subject
    });
  };

  const renderItem = ({ item, index }: { item: SearchResult; index: number }) => (
    <Card translucent style={styles.resultCard} delay={index * 100}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTopic} numberOfLines={1}>{item.topic}</Text>
        <Text style={styles.cardSubject}>{item.subject}</Text>
      </View>
      <Text style={styles.cardPreview} numberOfLines={2}>{item.formattedText || item.topic + " material"}</Text>
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.noteBtn]} onPress={() => navToDetail(item)}>
          <Ionicons name="document-text" size={14} color="#FFF" />
          <Text style={styles.actionBtnText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionBtn, styles.videoBtn]} onPress={() => watchVideo(item)}>
          <Ionicons name="logo-youtube" size={14} color="#FFF" />
          <Text style={styles.actionBtnText}>Video</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.aiBtn]} 
          onPress={() => navigation.navigate('AI', { query: `Explain ${item.topic} in ${item.subject}` })}
        >
          <Ionicons name="sparkles" size={14} color="#FFF" />
          <Text style={styles.actionBtnText}>Explain</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <Animated.View style={[styles.headerWrapper, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.headerArea}>
            <Text style={styles.header}>Study Library</Text>
            <Text style={styles.subheader}>Curated for your academic success</Text>
        </View>
      </Animated.View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Animated.View style={[styles.searchBox, { opacity: searchBoxAnim }]}>
              <View style={styles.profileBadge}>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeLabel}>Year</Text>
                  <Text style={styles.badgeValue}>{year || 'N/A'}</Text>
                </View>
                <View style={[styles.badgeItem, { borderLeftWidth: 1, borderColor: '#eee' }]}>
                  <Text style={styles.badgeLabel}>Branch</Text>
                  <Text style={styles.badgeValue}>{branch || 'General'}</Text>
                </View>
              </View>

              <Input
                  placeholder="Search topics or subjects..."
                  value={query}
                  onChangeText={setQuery}
                  icon={<Ionicons name="search" size={20} color={THEME_COLORS.primary} />}
                  onSubmitEditing={handleSearch}
                  style={styles.inputStyle}
              />
          </Animated.View>

          <View style={styles.resultsContainer}>
          {loading ? (
              <ActivityIndicator size="large" color={THEME_COLORS.primary} style={styles.loader} />
          ) : results.length > 0 ? (
              <>
              <Text style={styles.resultsCount}>{results.length} resources found</Text>
              {results.map((item, index) => (
                  <View key={item._id} style={{ marginBottom: 4 }}>
                      {renderItem({ item, index })}
                  </View>
              ))}
              </>
          ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={THEME_COLORS.border} />
                <Text style={styles.emptyText}>{query ? 'No matches found' : 'No materials available yet'}</Text>
                {!query && <Text style={styles.emptySub}>Check back later for new content from your teachers.</Text>}
              </View>
          )}
          </View>
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    borderBottomWidth: 2,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
    zIndex: 10,
    backgroundColor: '#FFF'
  },
  headerArea: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: THEME_COLORS.secondary },
  subheader: { fontSize: 13, color: THEME_COLORS.textLight, marginTop: 4, fontWeight: '500' },
  searchBox: { padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderBottomWidth: 1, borderColor: THEME_COLORS.border },
  profileBadge: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#eee',
    overflow: 'hidden'
  },
  badgeItem: { 
    flex: 1, 
    padding: 10, 
    alignItems: 'center' 
  },
  badgeLabel: { 
    fontSize: 9, 
    color: THEME_COLORS.textLight, 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  },
  badgeValue: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: THEME_COLORS.primary,
    marginTop: 2
  },
  inputStyle: { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
  filtersRow: { flexDirection: 'row', gap: 10 },
  filterHalf: { flex: 1 },
  searchButton: { marginTop: 12 },
  resultsContainer: { padding: 16 },
  resultsCount: { fontSize: 12, color: THEME_COLORS.textLight, marginBottom: 16, fontWeight: '800', textTransform: 'uppercase' },
  loader: { marginTop: 40 },
  resultCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTopic: { fontSize: 17, fontWeight: 'bold', color: THEME_COLORS.secondary, flex: 1 },
  cardSubject: { fontSize: 10, fontWeight: '800', backgroundColor: 'rgba(91, 108, 255, 0.1)', color: THEME_COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: THEME_COLORS.primary },
  cardPreview: { fontSize: 13, color: THEME_COLORS.textLight, marginBottom: 16, lineHeight: 20, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 4, ...PIXEL_SHADOWS.button, borderWidth: 1, borderColor: '#000' },
  noteBtn: { backgroundColor: THEME_COLORS.primary },
  videoBtn: { backgroundColor: '#f43f5e' },
  aiBtn: { backgroundColor: THEME_COLORS.secondary },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: THEME_COLORS.secondary, marginTop: 16, textAlign: 'center' },
  emptySub: { fontSize: 13, color: THEME_COLORS.textLight, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  guide: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  guideText: { textAlign: 'center', color: THEME_COLORS.textLight, marginTop: 16, lineHeight: 22, fontWeight: '500' }
});
