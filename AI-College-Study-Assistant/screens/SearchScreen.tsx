import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Keyboard, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';

import FadeInView from '../components/FadeInView';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import Dropdown from '../components/Dropdown';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';
import { api } from '../services/api';

interface SearchResult {
  _id: string;
  topic: string;
  preview: string;
  subject: string;
  formattedText?: string;
  imageUrl?: string;
}

type RootStackParamList = {
  NoteDetail: { note: SearchResult };
};

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [subject, setSubject] = useState('');
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const branches = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const subjects = ['Data Structures', 'Algorithms', 'Linear Algebra', 'Physics', 'Database Management'];

  const handleSearch = async () => {
    Keyboard.dismiss();
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get('/student/search', {
        params: { topic: query, branch, year, subject }
      });
      setResults(response.data.data || response.data || []);
    } catch (error) {
      console.log('Search API Error:', error);
      setResults([
        { 
          _id: '1', 
          topic: 'Binary Search Trees', 
          subject: 'Data Structures', 
          preview: 'A binary search tree is a rooted binary tree data structure...',
          formattedText: "A binary search tree is a rooted binary tree...",
          imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80'
        }
      ]);
    }
    setLoading(false);
  };

  const navToDetail = (item: SearchResult) => {
    navigation.navigate('NoteDetail', { note: item });
  };

  const renderItem = ({ item, index }: { item: SearchResult; index: number }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navToDetail(item)} style={styles.resultItem}>
      <FadeInView duration={300 + (index * 50)}>
        <Card translucent style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <View style={styles.subjectBadge}>
              <Text style={styles.cardSubject}>{item.subject}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME_COLORS.textLight} />
          </View>
          <Text style={styles.cardTopic}>{item.topic}</Text>
          <Text style={styles.cardPreview} numberOfLines={2}>{item.preview || item.formattedText}</Text>
        </Card>
      </FadeInView>
    </TouchableOpacity>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.container}>
        <View style={styles.headerArea}>
          <Text style={styles.header}>Find Resources</Text>
          <View style={styles.searchBoxWrapper}>
            <BlurView intensity={60} tint="light" style={styles.searchBox}>
              <Input
                placeholder="Search topics, keywords..."
                value={query}
                onChangeText={setQuery}
                icon={<Ionicons name="search" size={20} color={THEME_COLORS.primary} />}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                style={styles.searchInput}
              />
            </BlurView>
          </View>
        </View>
        
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={
            <Card translucent style={styles.filterCard}>
              <Text style={styles.filterTitle}>Refine your search</Text>
              <View style={styles.filtersRow}>
                <View style={styles.filterHalf}>
                  <Dropdown label="Branch" value={branch} options={branches} onChange={setBranch} />
                </View>
                <View style={styles.filterHalf}>
                  <Dropdown label="Year" value={year} options={years} onChange={setYear} />
                </View>
              </View>
              <Dropdown label="Subject" value={subject} options={subjects} onChange={setSubject} />
              <Button title="Apply Filters" type="glass" onPress={handleSearch} style={styles.searchButton} />
            </Card>
          }
          ListEmptyComponent={
            hasSearched ? (
              <FadeInView style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="rgba(148, 163, 184, 0.4)" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>Try different keywords or filters</Text>
              </FadeInView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles-outline" size={64} color="rgba(148, 163, 184, 0.4)" />
                <Text style={styles.emptyText}>Ready to explore?</Text>
                <Text style={styles.emptySubtext}>Search for notes, concepts, or subjects</Text>
              </View>
            )
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
        
        {loading && (
          <BlurView intensity={30} style={StyleSheet.absoluteFill}>
            <View style={styles.centerLoader}>
              <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            </View>
          </BlurView>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { padding: 20, paddingTop: 60, paddingBottom: 10 },
  header: { fontSize: 32, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 20 },
  searchBoxWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    overflow: 'hidden',
    ...PIXEL_SHADOWS.card,
  },
  searchBox: { paddingHorizontal: 4 },
  searchInput: { borderBottomWidth: 0, marginBottom: 0, height: 56, backgroundColor: 'transparent' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  filterCard: { padding: 18, marginBottom: 24 },
  filterTitle: { fontSize: 12, fontWeight: '800', color: THEME_COLORS.textLight, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 },
  filtersRow: { flexDirection: 'row', gap: 12 },
  filterHalf: { flex: 1 },
  searchButton: { marginTop: 12 },
  resultItem: { marginBottom: 4 },
  resultCard: { padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectBadge: { backgroundColor: 'rgba(91, 108, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  cardSubject: { fontSize: 11, color: THEME_COLORS.primary, fontWeight: '900', textTransform: 'uppercase' },
  cardTopic: { fontSize: 19, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 6 },
  cardPreview: { fontSize: 14, color: THEME_COLORS.textLight, lineHeight: 22, fontWeight: '500' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: THEME_COLORS.textLight, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: THEME_COLORS.textLight, marginTop: 6, fontWeight: '500' },
  centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
