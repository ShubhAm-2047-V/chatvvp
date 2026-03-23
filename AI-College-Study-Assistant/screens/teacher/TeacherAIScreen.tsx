import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function TeacherAIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI teaching assistant. How can I help you with your lesson planning or research today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    Keyboard.dismiss();

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await api.post('/student/chat', { 
        prompt: userMessage.text,
        history: history 
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || "I'm sorry, I couldn't process that request.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Connection lost. Please check your internet and try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageRow, item.sender === 'user' ? styles.userRow : styles.aiRow]}>
      <BlurView 
        intensity={item.sender === 'user' ? 30 : 60} 
        tint={item.sender === 'user' ? 'dark' : 'light'} 
        style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}
      >
        <Text style={[styles.text, item.sender === 'user' ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </BlurView>
    </View>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.headerWrapper}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <Text style={styles.title}>AI Teaching Assistant</Text>
          <Text style={styles.subtitle}>Powered by Gemini 2.0</Text>
        </BlurView>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <BlurView intensity={80} tint="light" style={styles.inputArea}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor={THEME_COLORS.textLight}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.disabledSend]} 
              onPress={sendMessage}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
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
  },
  title: { fontSize: 18, fontWeight: 'bold', color: THEME_COLORS.secondary },
  subtitle: { fontSize: 11, color: THEME_COLORS.primary, fontWeight: '800', textTransform: 'uppercase' },
  list: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 16, width: '100%' },
  userRow: { alignItems: 'flex-end' },
  aiRow: { alignItems: 'flex-start' },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 14, borderWidth: 1.5, overflow: 'hidden' },
  userBubble: { backgroundColor: THEME_COLORS.secondary, borderColor: '#000' },
  aiBubble: { backgroundColor: THEME_COLORS.glassBg, borderColor: THEME_COLORS.primary },
  text: { fontSize: 14, lineHeight: 22 },
  userText: { color: '#FFF', fontWeight: '500' },
  aiText: { color: THEME_COLORS.secondary, fontWeight: '500' },
  inputArea: { 
    padding: 12, 
    borderTopWidth: 2, 
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 10, 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME_COLORS.border
  },
  input: { flex: 1, fontSize: 15, color: THEME_COLORS.secondary, maxHeight: 100 },
  sendBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 8, 
    backgroundColor: THEME_COLORS.secondary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginLeft: 12,
    ...PIXEL_SHADOWS.button
  },
  disabledSend: { backgroundColor: THEME_COLORS.textLight }
});
