import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import Card from '../components/Card';
import Button from '../components/Button';
import { THEME_COLORS, THEME_SPACING } from '../constants/theme';
import { quizService, Quiz, QuizResult } from '../services/quizService';
import { Ionicons } from '@expo/vector-icons';

export default function QuizDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { quizId } = route.params;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizService.getQuizById(quizId);
        setQuiz(data);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await quizService.submitQuiz(quizId, { answers: selectedAnswers });
      setResult(res);
      setQuizFinished(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      </BackgroundWrapper>
    );
  }

  if (!quiz) {
    return (
      <BackgroundWrapper>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Quiz not found.</Text>
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </BackgroundWrapper>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const allAnswered = selectedAnswers.every(ans => ans !== -1);

  if (quizFinished && result) {
    return (
      <BackgroundWrapper>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Card translucent style={styles.resultCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{result.finalScore.score}/{result.finalScore.totalQuestions}</Text>
              <Text style={styles.scoreLabel}>Correct</Text>
            </View>
            <Text style={styles.percentageText}>{Math.round(result.finalScore.percentage)}%</Text>
            <Text style={styles.feedbackText}>
              {result.finalScore.percentage >= 80 ? 'Excellent work!' : 
               result.finalScore.percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
            </Text>
          </Card>

          <Text style={styles.reviewTitle}>Question Review</Text>
          {result.results.map((res, idx) => (
            <Card key={idx} translucent style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewIndex}>Question {idx + 1}</Text>
                {res.isCorrect ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                ) : (
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                )}
              </View>
              <Text style={styles.reviewQuestion}>{quiz.questions[idx].questionText}</Text>
              <View style={styles.reviewOptions}>
                {quiz.questions[idx].options.map((opt, optIdx) => (
                  <View 
                    key={optIdx} 
                    style={[
                      styles.reviewOption,
                      optIdx === res.correctOptionIndex && styles.correctOption,
                      optIdx === res.selectedOptionIndex && !res.isCorrect && styles.wrongOption
                    ]}
                  >
                    <Text style={[
                      styles.reviewOptionText,
                      (optIdx === res.correctOptionIndex || (optIdx === res.selectedOptionIndex && !res.isCorrect)) && styles.whiteText
                    ]}>{opt}</Text>
                  </View>
                ))}
              </View>
              {res.explanation && (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationTitle}>Explanation:</Text>
                  <Text style={styles.explanationText}>{res.explanation}</Text>
                </View>
              )}
            </Card>
          ))}
          <Button title="Finish" onPress={() => navigation.goBack()} style={styles.finishButton} />
        </ScrollView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>

        <View style={styles.quizHeader}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.questionCount}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</Text>
        </View>

        <Card translucent style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        </Card>

        <ScrollView contentContainerStyle={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
              ]}
              onPress={() => handleSelectOption(index)}
            >
              <View style={[
                styles.optionIndicator,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedIndicator
              ]}>
                <Text style={[
                  styles.optionIndexText,
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedIndicatorText
                ]}>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswers[currentQuestionIndex] === index && styles.selectedOptionText
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="Previous" 
            onPress={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            type="glass"
            style={styles.navButton}
          />
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button 
              title="Submit Quiz" 
              onPress={handleSubmit} 
              disabled={!allAnswered || submitting}
              style={styles.navButton}
              loading={submitting}
            />
          ) : (
            <Button 
              title="Next" 
              onPress={handleNext} 
              disabled={selectedAnswers[currentQuestionIndex] === -1}
              style={styles.navButton}
            />
          )}
        </View>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: THEME_SPACING.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: THEME_COLORS.textLight, marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: THEME_COLORS.primary },
  quizHeader: { marginBottom: 20 },
  quizTitle: { fontSize: 20, fontWeight: '800', color: THEME_COLORS.secondary, marginBottom: 4 },
  questionCount: { fontSize: 14, color: THEME_COLORS.textLight, fontWeight: '600' },
  questionCard: { marginBottom: 20, padding: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
  questionText: { fontSize: 18, lineHeight: 28, color: THEME_COLORS.secondary, fontWeight: '600' },
  optionsContainer: { paddingBottom: 20 },
  optionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  selectedOption: { 
    backgroundColor: 'rgba(91, 108, 255, 0.15)',
    borderColor: THEME_COLORS.primary
  },
  optionIndicator: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  selectedIndicator: { backgroundColor: THEME_COLORS.primary },
  optionIndexText: { color: THEME_COLORS.secondary, fontWeight: 'bold' },
  selectedIndicatorText: { color: '#FFF' },
  optionText: { flex: 1, fontSize: 16, color: THEME_COLORS.secondary, fontWeight: '500' },
  selectedOptionText: { color: THEME_COLORS.primary, fontWeight: '700' },
  footer: { flexDirection: 'row', gap: 12, paddingBottom: 20 },
  navButton: { flex: 1 },
  // Result styles
  resultContainer: { padding: THEME_SPACING.md, paddingBottom: 40 },
  resultCard: { alignItems: 'center', padding: 32, marginBottom: 24 },
  scoreCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 8, 
    borderColor: THEME_COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16
  },
  scoreText: { fontSize: 28, fontWeight: '800', color: THEME_COLORS.secondary },
  scoreLabel: { fontSize: 14, color: THEME_COLORS.textLight, fontWeight: '600' },
  percentageText: { fontSize: 36, fontWeight: '900', color: THEME_COLORS.primary, marginBottom: 8 },
  feedbackText: { fontSize: 18, color: THEME_COLORS.secondary, fontWeight: '700' },
  reviewTitle: { fontSize: 20, fontWeight: '800', color: THEME_COLORS.secondary, marginBottom: 16 },
  reviewCard: { marginBottom: 16, padding: 20 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reviewIndex: { fontSize: 14, fontWeight: '700', color: THEME_COLORS.primary },
  reviewQuestion: { fontSize: 16, color: THEME_COLORS.secondary, fontWeight: '600', marginBottom: 16 },
  reviewOptions: { gap: 8 },
  reviewOption: { padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  correctOption: { backgroundColor: '#4CAF50' },
  wrongOption: { backgroundColor: '#F44336' },
  reviewOptionText: { fontSize: 14, color: THEME_COLORS.secondary },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  explanationBox: { marginTop: 16, padding: 12, backgroundColor: 'rgba(91, 108, 255, 0.1)', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: THEME_COLORS.primary },
  explanationTitle: { fontSize: 13, fontWeight: '800', color: THEME_COLORS.primary, marginBottom: 4 },
  explanationText: { fontSize: 14, color: THEME_COLORS.secondary, lineHeight: 20 },
  finishButton: { marginTop: 24 },
});
