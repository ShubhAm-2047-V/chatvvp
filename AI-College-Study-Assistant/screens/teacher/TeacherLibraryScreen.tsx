import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

interface Note {
  _id: string;
  subject: string;
  topic: string;
  imageUrl: string;
  createdAt: string;
  formattedText?: string;
}

export default function TeacherLibraryScreen({ navigation }: any) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/teacher/my-notes');
      const allNotes = response.data.notes || [];
      setNotes(allNotes.filter((n: any) => n.imageUrl));
    } catch (error) {
      console.error('Error fetching teacher notes:', error);
      Alert.alert('Error', 'Could not load your library.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/teacher/my-notes/${id}`);
              setNotes(notes.filter(n => n._id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note.');
            }
          }
        }
      ]
    );
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <Card 
      translucent 
      style={styles.noteCard}
    >
      <TouchableOpacity 
        style={styles.cardPressable}
        onPress={() => navigation.navigate('NoteDetail', { note: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <Image source={{ uri: item.imageUrl }} style={styles.noteImage} />
          <BlurView intensity={60} tint="dark" style={styles.dateBadge}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </Text>
          </BlurView>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.tagRow}>
            <View style={styles.subjectTag}>
              <Text style={styles.subjectText}>{item.subject}</Text>
            </View>
          </View>
          
          <Text style={styles.topicText} numberOfLines={1}>{item.topic}</Text>
          
          <View style={styles.cardFooter}>
            <TouchableOpacity 
               style={styles.viewBtn}
               onPress={() => navigation.navigate('NoteDetail', { note: item })}
            >
              <Text style={styles.viewBtnText}>VIEW</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => deleteNote(item._id)}
            >
              <Ionicons name="trash-outline" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerWrapper}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <View>
            <Text style={styles.title}>Resources for Students</Text>
            <Text style={styles.subtitle}>Manage your shared notes</Text>
          </View>
          <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('UploadNote')}>
            <Ionicons name="camera" size={22} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          renderItem={renderNoteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={64} color={THEME_COLORS.border} />
              <Text style={styles.emptyTitle}>No notes found</Text>
              <Text style={styles.emptySub}>Your scanned notes will appear here.</Text>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  subtitle: {
    fontSize: 11,
    color: THEME_COLORS.textLight,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase'
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...PIXEL_SHADOWS.button,
    borderWidth: 1,
    borderColor: '#000'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  noteCard: {
    padding: 0,
    marginBottom: 4,
    overflow: 'hidden',
  },
  cardPressable: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: 110,
    height: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRightWidth: 1,
    borderColor: THEME_COLORS.border
  },
  noteImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: 'center',
  },
  dateText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  subjectTag: {
    backgroundColor: 'rgba(91, 108, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary,
  },
  subjectText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME_COLORS.primary,
    textTransform: 'uppercase',
  },
  topicText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME_COLORS.border,
  },
  viewBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME_COLORS.secondary,
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.textLight,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: THEME_COLORS.textLight,
    marginTop: 4,
    fontWeight: '500'
  },
});
