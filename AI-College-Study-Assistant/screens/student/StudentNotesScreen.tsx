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
} from 'react-native';
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
  const [subject, setSubject] = useState('');
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const searchBoxAnim = useRef(new Animated.Value(0)).current;

  const branches = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const subjects = ['Data Structures', 'Algorithms', 'Linear Algebra', 'Physics', 'Database Management'];

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      ]),
      Animated.timing(searchBoxAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [headerAnim, headerSlide, searchBoxAnim]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get('/student/search', {
        params: { topic: query, branch, year, subject }
      });
      setResults(response.data.data || response.data || []);
      
      await api.post('/student/activity/view-note', {
        topic: query || 'General Search',
        subject: subject || 'All'
      });
    } catch (error) {
      console.log('Search API Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <Text style={styles.cardPreview} numberOfLines={2}>{item.preview || item.formattedText}</Text>
      
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
            <Text style={styles.header}>Study Materials</Text>
            <Text style={styles.subheader}>Explore notes, videos, and AI help</Text>
        </View>
      </Animated.View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Animated.View style={[styles.searchBox, { opacity: searchBoxAnim }]}>
              <Input
                  placeholder="Search topics (e.g. Binary Search)"
                  value={query}
                  onChangeText={setQuery}
                  icon={<Ionicons name="search" size={20} color={THEME_COLORS.primary} />}
                  onSubmitEditing={handleSearch}
                  style={styles.inputStyle}
              />

              <View style={styles.filtersRow}>
                  <View style={styles.filterHalf}>
                      <Dropdown label="Branch" value={branch} options={branches} onChange={setBranch} />
                  </View>
                  <View style={styles.filterHalf}>
                      <Dropdown label="Year" value={year} options={years} onChange={setYear} />
                  </View>
              </View>

              <Button title="Find Resources" type="primary" onPress={handleSearch} style={styles.searchButton} />
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
          ) : hasSearched ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={THEME_COLORS.border} />
                <Text style={styles.emptyText}>No matches found</Text>
              </View>
          ) : (
              <View style={styles.guide}>
                  <Ionicons name="school-outline" size={48} color={THEME_COLORS.border} />
                  <Text style={styles.guideText}>Select your branch and year to see relevant materials</Text>
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
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: THEME_COLORS.textLight, marginTop: 16 },
  guide: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  guideText: { textAlign: 'center', color: THEME_COLORS.textLight, marginTop: 16, lineHeight: 22, fontWeight: '500' }
});
