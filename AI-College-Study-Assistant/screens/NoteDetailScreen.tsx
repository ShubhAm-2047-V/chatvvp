import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import FadeInView from '../components/FadeInView';
import Button from '../components/Button';
import Card from '../components/Card';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../constants/theme';
import { api } from '../services/api';

export default function NoteDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { note } = (route.params as any) || { note: {} };

  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState('');

  const [loadingYt, setLoadingYt] = useState(false);
  const [errorYt, setErrorYt] = useState('');

  const handleExplainAI = async () => {
    setLoadingAi(true);
    setErrorAi('');
    setAiExplanation('');
    try {
      const response = await api.post('/student/explain', { noteId: note._id });
      setAiExplanation(response.data.explanation || response.data || 'No explanation generated.');
    } catch (error) {
      console.log('AI API Error:', error);
      setErrorAi('Failed to load AI explanation.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleWatchYouTube = async () => {
    setLoadingYt(true);
    setErrorYt('');
    try {
      const response = await api.get('/student/youtube', {
        params: { subject: note.subject || '', topic: note.topic || '' },
      });
      const videos = response.data?.videos;
      const videoUrl = Array.isArray(videos) && videos.length > 0 ? videos[0].url : null;

      if (videoUrl) {
        await Linking.openURL(videoUrl);
      } else {
        const fallback = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${note.subject || ''} ${note.topic || ''}`)}`;
        await Linking.openURL(fallback);
      }
    } catch (error) {
      console.log('YouTube API Error:', error);
      setErrorYt('Failed to fetch YouTube link.');
    } finally {
      setLoadingYt(false);
    }
  };

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerWrapper}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={THEME_COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{note.topic || 'Note Detail'}</Text>
        </BlurView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <FadeInView duration={300}>
          <View style={styles.subjectPill}>
            <Text style={styles.subjectPillText}>{note.subject || 'General'}</Text>
          </View>
          <Text style={styles.title}>{note.topic}</Text>

          <View style={styles.actionsRow}>
            <Button 
                title={loadingAi ? "..." : "Explain with AI"} 
                onPress={handleExplainAI} 
                style={styles.actionBtnContainer} 
                type="glass"
              />
            <Button 
                title={loadingYt ? "..." : "Watch Video"} 
                onPress={handleWatchYouTube} 
                style={[styles.actionBtnContainer, styles.ytBtn]} 
                textStyle={styles.ytBtnText}
                type="glass"
              />
          </View>

          {errorAi ? <Text style={styles.errorText}>{errorAi}</Text> : null}
          {errorYt ? <Text style={styles.errorText}>{errorYt}</Text> : null}
        </FadeInView>

        <FadeInView duration={400}>
          {aiExplanation ? (
            <Card translucent style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={20} color={THEME_COLORS.primary} />
                <Text style={styles.aiTitle}>AI Explanation</Text>
              </View>
              <Text style={styles.aiText}>{aiExplanation}</Text>
            </Card>
          ) : null}

          <Text style={styles.sectionTitle}>Note Content</Text>
          <Card translucent style={styles.contentCard}>
            <Text style={styles.content}>
              {note.formattedText || note.preview || 'No note content available.'}
            </Text>
          </Card>
          
          {note.imageUrl ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>Original Image</Text>
              <Image source={{ uri: note.imageUrl }} style={styles.image} resizeMode="cover" />
            </View>
          ) : null}
        </FadeInView>
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
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 16, 
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME_COLORS.primary },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, flex: 1, color: THEME_COLORS.secondary },
  scroll: { padding: 20, paddingBottom: 100 },
  subjectPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(91, 108, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: THEME_COLORS.primary },
  subjectPillText: { color: THEME_COLORS.primary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 20, lineHeight: 36 },
  image: { width: '100%', height: 260, borderRadius: 14, marginBottom: 20, borderWidth: 2, borderColor: THEME_COLORS.primary },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtnContainer: { flex: 1 },
  ytBtn: { borderColor: '#f43f5e' },
  ytBtnText: { color: '#f43f5e' },
  errorText: { color: '#f43f5e', fontSize: 13, marginBottom: 12, fontWeight: '600' },
  aiCard: { backgroundColor: 'rgba(245, 243, 255, 0.8)', borderColor: THEME_COLORS.primary, marginBottom: 24, padding: 20 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  aiTitle: { fontSize: 14, fontWeight: '800', color: THEME_COLORS.primary, textTransform: 'uppercase' },
  aiText: { fontSize: 15, color: THEME_COLORS.secondary, lineHeight: 26, fontWeight: '500' },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: THEME_COLORS.textLight, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  contentCard: { padding: 20, marginBottom: 24 },
  content: { fontSize: 16, color: THEME_COLORS.secondary, lineHeight: 26, fontWeight: '400' }
});
