import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, TrendingUp, Clock, ChevronRight, User as UserIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({ notesViewed: 0, aiInteractions: 0, studyHours: 12 });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUserName(JSON.parse(userStr).name);

    const fetchDashboardData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/student/stats'),
          api.get('/student/history')
        ]);
        setStats({ ...statsRes.data, studyHours: 12 });
        setRecentNotes(historyRes.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Greeting */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-glow">
          Good morning, <span className="text-indigo-400">{userName || 'Alex'}</span>.
        </h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)] max-w-2xl">
          You're in your flow state. You've completed <span className="text-emerald-400 font-bold">75%</span> of your weekly study goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Workspace (Bento Grid) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Tutor Bento Card */}
          <div className="bento-card card-3d-hover holographic-border glitch-hover border border-indigo-500/20 relative overflow-hidden group p-8 min-h-[300px] flex flex-col justify-between indigo-glow shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Tutor</h3>
              </div>
              <p className="text-[var(--on-surface-variant)] mb-8">Ask about calculus, history, or anything in your notes.</p>
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask me anything..."
                  className="input-premium w-full h-14 pl-6 pr-16 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && navigate('/student/ai')}
                />
                <button 
                  onClick={() => navigate('/student/ai')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white hover:bg-indigo-400 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatsCard 
              icon={<Clock className="text-indigo-400" />} 
              label="Study Hours" 
              value={`${stats.studyHours}h`} 
              subtitle="Keep the momentum" 
            />
            <StatsCard 
              icon={<TrendingUp className="text-emerald-400" />} 
              label="Questions Asked" 
              value={stats.aiInteractions} 
              subtitle="Curiosity is power" 
            />
          </div>
        </div>

        {/* Sidebar: Recent Materials */}
        <div className="space-y-8">
          <div className="bento-card bg-[var(--surface-container-low)] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Library</h3>
              <button 
                onClick={() => navigate('/student/notes')}
                className="text-sm font-bold text-indigo-400 hover:text-indigo-300"
              >
                View all
              </button>
            </div>
            
            <div className="space-y-4">
              {recentNotes.length > 0 ? (
                recentNotes.map((note, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--surface-container-high)] hover:bg-[var(--surface-bright)] transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <BookOpen size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{note.title}</p>
                        <p className="text-xs text-[var(--on-surface-variant)] mt-1">{note.topic}</p>
                        <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-400 h-full w-[65%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <BookOpen size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-sm text-[var(--on-surface-variant)]">Your library is empty.</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Widget */}
          <div className="bento-card bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
             <div className="flex items-center gap-3 mb-2">
                <UserIcon size={18} className="text-indigo-400" />
                <span className="text-sm font-bold text-white">Daily Streak</span>
             </div>
             <p className="text-3xl font-extrabold text-white">05 <span className="text-lg text-[var(--on-surface-variant)]">Days</span></p>
          </div>
        </div>

      </div>

    </div>
  );
};

const StatsCard = ({ icon, label, value, subtitle }: { icon: any, label: string, value: any, subtitle: string }) => (
  <div className="bento-card card-3d-hover holographic-border glitch-hover border border-white/5 p-8 flex flex-col justify-between shadow-xl">
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">{label}</p>
      <p className="text-4xl font-extrabold text-white mt-1">{value}</p>
      <p className="text-sm text-[var(--on-surface-variant)] mt-2">{subtitle}</p>
    </div>
  </div>
);

export default StudentDashboard;
