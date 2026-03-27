import React, { useState, useEffect } from 'react';
import { quizService } from '../../services/quizService';
import type { Quiz } from '../../services/quizService';
import { BookOpen, ChevronRight, School, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Practice <span className="text-indigo-400">Quizzes</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)] max-w-2xl">
          Test your knowledge, identify gaps, and master your subjects with interactive practice tests.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div 
                key={quiz._id} 
                className="bento-card border border-white/5 bg-[var(--surface-container-low)] hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-indigo-500/10"
                onClick={() => navigate(`/student/quiz/${quiz._id}`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <School size={24} />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {quiz.subject}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-[var(--on-surface-variant)] text-sm line-clamp-2 mb-6">
                    {quiz.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">{quiz.questions.length} Questions</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Start Quiz <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bento-card border border-white/5 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-600 mb-6">
                <School size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Quizzes Found</h3>
              <p className="text-[var(--on-surface-variant)] max-w-md">
                There are currently no practice quizzes available for your branch and year. Check back later!
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Featured AI Quiz Generation Prompt (Mock) */}
      <div className="mt-16 bento-card border border-emerald-500/20 bg-emerald-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
               <Sparkles size={32} />
            </div>
            <div>
               <h4 className="text-xl font-bold text-white">Want a custom quiz?</h4>
               <p className="text-[var(--on-surface-variant)]">Ask the AI Tutor to generate a quiz from any of your uploaded notes.</p>
            </div>
         </div>
         <button 
            onClick={() => navigate('/student/ai')}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
         >
            Go to AI Tutor
         </button>
      </div>
    </div>
  );
};

export default QuizList;
