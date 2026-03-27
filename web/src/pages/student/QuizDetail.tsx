import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import type { Quiz, QuizResult } from '../../services/quizService';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Trophy, ArrowRight, BookOpen } from 'lucide-react';

const QuizDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;
      try {
        const data = await quizService.getQuizById(id);
        setQuiz(data);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSelectOption = (index: number) => {
    if (finished) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = index;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!id || selectedAnswers.includes(-1)) return;
    try {
      setSubmitting(true);
      const res = await quizService.submitQuiz(id, { answers: selectedAnswers });
      setResult(res);
      setFinished(true);
    } catch (error) {
      console.error('Quiz submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h2>
        <button onClick={() => navigate('/student/quizzes')} className="btn-primary mt-4">Back to Quizzes</button>
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="bento-card border border-indigo-500/20 p-12 text-center relative overflow-hidden mb-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-400">
              <Trophy size={48} />
            </div>
            <h1 className="text-5xl font-black text-white mb-2">
              {result.finalScore.score} / {result.finalScore.totalQuestions}
            </h1>
            <p className="text-2xl font-bold text-indigo-400 mb-6">
              {Math.round(result.finalScore.percentage)}% Correct
            </p>
            <div className="max-w-md mx-auto h-3 bg-white/5 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000"
                style={{ width: `${result.finalScore.percentage}%` }}
              ></div>
            </div>
            <p className="text-lg text-[var(--on-surface-variant)]">
              {result.finalScore.percentage >= 80 ? "Outstanding performance! You've mastered this topic." : 
               result.finalScore.percentage >= 60 ? "Good job! You have a solid understanding." : "Keep studying, you're getting there!"}
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <BookOpen className="text-indigo-400" /> Review Questions
        </h3>
        
        <div className="space-y-6">
          {result.results.map((res, idx) => (
            <div key={idx} className={`bento-card border ${res.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} p-8`}>
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">Question {idx + 1}</span>
                {res.isCorrect ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 size={20} /> Correct
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <XCircle size={20} /> Incorrect
                  </div>
                )}
              </div>
              <h4 className="text-xl font-bold text-white mb-8">{quiz.questions[idx].questionText}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quiz.questions[idx].options.map((opt, optIdx) => {
                  const isCorrect = optIdx === res.correctOptionIndex;
                  const isSelected = optIdx === res.selectedOptionIndex;
                  return (
                    <div 
                      key={optIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-white' : 
                        isSelected ? 'border-red-500 bg-red-500/20 text-white' : 
                        'border-white/5 bg-white/5 text-slate-400'
                      } flex items-center justify-between`}
                    >
                      <span className="font-medium">{opt}</span>
                      {isCorrect && <CheckCircle2 size={18} />}
                      {isSelected && !isCorrect && <XCircle size={18} />}
                    </div>
                  );
                })}
              </div>
              
              {res.explanation && (
                <div className="mt-8 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
                    <AlertCircle size={18} /> Explanation
                  </div>
                  <p className="text-slate-300 leading-relaxed">{res.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
           <button 
             onClick={() => navigate('/student/quizzes')}
             className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-indigo-500/20 group"
           >
             Continue Learning <ArrowRight className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Quiz Progress Header */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-indigo-400 font-black uppercase tracking-widest text-sm">{quiz.subject}</span>
            <h2 className="text-3xl font-black text-white mt-1">{quiz.title}</h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{currentIndex + 1}</span>
            <span className="text-slate-500 font-bold ml-1">/ {quiz.questions.length}</span>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bento-card border border-white/5 p-10 md:p-14 mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-12">
          {currentQuestion.questionText}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectOption(index)}
              className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
                selectedAnswers[currentIndex] === index 
                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10' 
                : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                  selectedAnswers[currentIndex] === index ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg font-medium">{option}</span>
              </div>
              {selectedAnswers[currentIndex] === index && (
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all disabled:opacity-0"
        >
          <ChevronLeft size={20} /> Previous
        </button>

        {currentIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(-1) || submitting}
            className="px-10 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
          >
            {submitting ? 'Submitting...' : 'Finish Quiz'} <Trophy size={20} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={selectedAnswers[currentIndex] === -1}
            className="px-10 py-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center gap-3"
          >
            Next Question <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;
