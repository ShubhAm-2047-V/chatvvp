import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

interface PersonalNote {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function TeacherPersonalNotes() {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await api.get('/teacher/personal-notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching personal notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please enter both title and content');
      return;
    }

    try {
      if (editingNote) {
        await api.put(`/teacher/personal-notes/${editingNote._id}`, { title, content });
      } else {
        await api.post('/teacher/personal-notes', { title, content });
      }
      setModalVisible(false);
      setTitle('');
      setContent('');
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const openEdit = (note: PersonalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const deleteNote = (id: string) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/teacher/personal-notes/${id}`);
        fetchNotes();
      }}
    ]);
  };

  const renderNote = ({ item }: { item: PersonalNote }) => (
    <Card translucent style={styles.noteCard}>
      <TouchableOpacity style={styles.cardPressable} onPress={() => openEdit(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity onPress={() => deleteNote(item._id)}>
            <Ionicons name="trash-outline" size={16} color="#f43f5e" />
          </TouchableOpacity>
        </View>
        <Text style={styles.noteSnippet} numberOfLines={5}>{item.content}</Text>
        <Text style={styles.noteDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerWrapper}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <Text style={styles.title}>Personal Notes</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => {
              setEditingNote(null);
              setTitle('');
              setContent('');
              setModalVisible(true);
          }}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME_COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="create-outline" size={64} color={THEME_COLORS.border} />
              <Text style={styles.emptyText}>No personal notes yet</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} tint="light" style={styles.modalBlur}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Personal Note'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={THEME_COLORS.secondary} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.inputTitle}
                placeholder="Note Title"
                placeholderTextColor={THEME_COLORS.textLight}
                value={title}
                onChangeText={setTitle}
              />
              
              <TextInput
                style={styles.inputBody}
                placeholder="Start writing..."
                placeholderTextColor={THEME_COLORS.textLight}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE NOTE</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </BlurView>
        </View>
      </Modal>
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
  title: { fontSize: 18, fontWeight: 'bold', color: THEME_COLORS.secondary },
  addBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 8, 
    backgroundColor: THEME_COLORS.secondary, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...PIXEL_SHADOWS.button,
    borderWidth: 1,
    borderColor: '#000'
  },
  list: { padding: 10, paddingBottom: 100 },
  noteCard: {
    padding: 0,
    margin: 6,
    flex: 1,
    height: 180,
    overflow: 'hidden',
  },
  cardPressable: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  noteTitle: { fontSize: 16, fontWeight: 'bold', color: THEME_COLORS.secondary, flex: 1, marginRight: 8 },
  noteSnippet: { fontSize: 13, color: THEME_COLORS.textLight, lineHeight: 18, marginTop: 8, fontWeight: '500' },
  noteDate: { fontSize: 9, color: THEME_COLORS.textLight, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: THEME_COLORS.textLight, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBlur: {
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden',
    height: '85%',
  },
  modalContent: { 
    flex: 1,
    padding: 24, 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderColor: THEME_COLORS.border, paddingBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME_COLORS.secondary },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.border
  },
  inputTitle: { fontSize: 20, fontWeight: 'bold', color: THEME_COLORS.secondary, marginBottom: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 10, borderWidth: 1, borderColor: THEME_COLORS.border },
  inputBody: { flex: 1, fontSize: 16, color: THEME_COLORS.secondary, lineHeight: 24, padding: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 10, borderWidth: 1, borderColor: THEME_COLORS.border, fontWeight: '500' },
  saveBtn: { 
    backgroundColor: THEME_COLORS.secondary, 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 20,
    ...PIXEL_SHADOWS.card,
    borderWidth: 2,
    borderColor: '#000',
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 1 }
});
