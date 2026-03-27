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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRoute } from '@react-navigation/native';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import { api } from '../../services/api';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIHistoryItem {
  _id: string;
  query: string;
  createdAt: string;
}

export default function StudentAIScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm ChatVVP, your AI Study Assistant. Ask me anything about your subjects, topics, or any doubts you have!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const flatListRef = useRef<FlatList>(null);
  
  const historyAnim = useRef(new Animated.Value(height)).current;

  const route = useRoute<any>();

  useEffect(() => {
    if (route.params?.query) {
        sendMessage(route.params.query);
    }
  }, [route.params?.query]);

  useEffect(() => {
    if (showHistory) {
      fetchAIHistory();
      Animated.spring(historyAnim, { toValue: height * 0.3, useNativeDriver: true, tension: 50, friction: 8 }).start();
    } else {
      Animated.spring(historyAnim, { toValue: height, useNativeDriver: true }).start();
    }
  }, [showHistory]);

  const fetchAIHistory = async () => {
    try {
      const response = await api.get('/student/history');
      const filtered = response.data.filter((item: any) => 
        ['ai_chat', 'ai_explain', 'search'].includes(item.type)
      );
      setAiHistory(filtered);
    } catch (error) {
      console.error('Error fetching AI history:', error);
    }
  };

  const sendMessage = async (textToUse?: string) => {
    const finalInput = textToUse || input;
    if (!finalInput.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: finalInput.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowHistory(false);
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
        intensity={item.sender === 'user' ? 20 : 60} 
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
          <View>
            <Text style={styles.title}>ChatVVP Assistant</Text>
            <Text style={styles.subtitle}>Ask anything to clear your doubts</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={() => setShowHistory(!showHistory)}>
            <Ionicons name="time-outline" size={22} color={THEME_COLORS.primary} />
          </TouchableOpacity>
        </BlurView>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <BlurView intensity={80} tint="light" style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            placeholderTextColor={THEME_COLORS.textLight}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={18} color="#FFF" />}
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>

      {/* History Sub-panel */}
      <Animated.View style={[styles.historyPanel, { transform: [{ translateY: historyAnim }] }]}>
        <BlurView intensity={95} tint="light" style={styles.historyBlur}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Your Previous Queries</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close-circle" size={28} color={THEME_COLORS.textLight} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={aiHistory}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.historyItem}
                onPress={() => {
                  setInput(item.query);
                  setShowHistory(false);
                }}
              >
                <Ionicons name="search-outline" size={16} color={THEME_COLORS.textLight} />
                <Text style={styles.historyItemText} numberOfLines={1}>{item.query}</Text>
                <Ionicons name="arrow-forward" size={14} color={THEME_COLORS.border} />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 20 }}
          />
        </BlurView>
      </Animated.View>
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
  subtitle: { fontSize: 11, color: THEME_COLORS.textLight, fontWeight: 'bold', textTransform: 'uppercase' },
  historyBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME_COLORS.primary },
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
    flexDirection: 'row', 
    padding: 12, 
    paddingBottom: 80, // Account for absolute tab bar (65) + margin
    alignItems: 'center', 
    borderTopWidth: 2, 
    borderColor: THEME_COLORS.primary, 
    ...PIXEL_SHADOWS.card 
  },
  input: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 15, borderWidth: 1, borderColor: THEME_COLORS.border, color: THEME_COLORS.secondary },
  sendBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: THEME_COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginLeft: 12, ...PIXEL_SHADOWS.button },
  
  historyPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.7, zIndex: 1000 },
  historyBlur: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', borderTopWidth: 2, borderColor: THEME_COLORS.primary },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: THEME_COLORS.border },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: THEME_COLORS.secondary },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: THEME_COLORS.border },
  historyItemText: { flex: 1, marginLeft: 12, fontSize: 14, color: THEME_COLORS.secondary }
});
