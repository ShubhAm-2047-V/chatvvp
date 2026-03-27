import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import Card from '../components/Card';
import { THEME_COLORS, THEME_SPACING, THEME_RADIUS } from '../constants/theme';
import { quizService, Quiz } from '../services/quizService';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function QuizListScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuizzes();
  };

  const renderQuizItem = ({ item, index }: { item: Quiz, index: number }) => (
    <Card translucent delay={100 * index} style={styles.quizCard}>
      <TouchableOpacity 
        style={styles.quizInner}
        onPress={() => navigation.navigate('QuizDetail', { quizId: item._id })}
      >
        <View style={styles.quizInfo}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <Text style={styles.quizSub}>{item.subject} • {item.questions.length} Questions</Text>
          <Text style={styles.quizDesc} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.quizAction}>
          <Ionicons name="chevron-forward" size={24} color={THEME_COLORS.primary} />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.header}
        >
          <Text style={styles.title}>Practice Quizzes</Text>
          <Text style={styles.subtitle}>Test your knowledge and track progress</Text>
        </Animated.View>

        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item._id}
            renderItem={renderQuizItem}
            contentContainerStyle={styles.list}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="school-outline" size={64} color={THEME_COLORS.textLight} />
                <Text style={styles.emptyText}>No quizzes available for your profile yet.</Text>
              </View>
            }
          />
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: THEME_SPACING.lg, marginTop: 10 },
  title: { fontSize: 28, fontWeight: '800', color: THEME_COLORS.secondary, marginBottom: 4 },
  subtitle: { fontSize: 15, color: THEME_COLORS.textLight, fontWeight: '500' },
  list: { padding: THEME_SPACING.md, paddingBottom: 100 },
  quizCard: { marginBottom: THEME_SPACING.md, padding: 0 },
  quizInner: { padding: THEME_SPACING.md, flexDirection: 'row', alignItems: 'center' },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: 18, fontWeight: '700', color: THEME_COLORS.secondary, marginBottom: 4 },
  quizSub: { fontSize: 13, color: THEME_COLORS.primary, fontWeight: '600', marginBottom: 6 },
  quizDesc: { fontSize: 14, color: THEME_COLORS.textLight, lineHeight: 20 },
  quizAction: { marginLeft: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: THEME_COLORS.textLight, fontSize: 16, marginTop: 16, textAlign: 'center', maxWidth: '80%' },
});
