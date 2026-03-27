import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Clock, 
  Search, 
  BookOpen, 
  Sparkles, 
  ChevronRight,
  Calendar,
  Layers,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/student/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return <Search className="text-amber-400" size={18} />;
      case 'view_note': return <BookOpen className="text-emerald-400" size={18} />;
      case 'ai_explain': return <Sparkles className="text-indigo-400" size={18} />;
      case 'ai_chat': return <Bot className="text-purple-400" size={18} />;
      default: return <Clock className="text-slate-400" size={18} />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'search': return 'Search Discovery';
      case 'view_note': return 'Material Review';
      case 'ai_explain': return 'Neural Analysis';
      case 'ai_chat': return 'AI Consultation';
      default: return 'General Activity';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
          Academic Timeline <Clock className="text-indigo-400" size={32} />
        </h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)] italic">Chronicle of your pursuit for knowledge.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bento-card animate-pulse bg-white/5 border border-white/5"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-24 bento-card border border-dashed border-white/10">
          <Layers size={64} className="mx-auto text-white/10 mb-6" />
          <h3 className="text-xl font-bold text-white">No history recorded yet</h3>
          <p className="mt-2 text-slate-500 italic">Your academic journey begins with your first search.</p>
          <button 
            onClick={() => navigate('/student/notes')}
            className="mt-8 btn-primary px-8 py-3 rounded-xl text-sm"
          >
            Explore Library
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/20 via-white/5 to-transparent hidden md:block"></div>

          {history.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-0 md:pl-20 group"
            >
              {/* Timeline Dot */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--surface-bright)] border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors z-10 hidden md:block shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>

              <div 
                className="bento-card border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-6"
                onClick={() => {
                  if (item.type === 'view_note' && item.refId) {
                    navigate(`/student/notes/${item.refId}`);
                  }
                }}
                style={{ cursor: item.type === 'view_note' ? 'pointer' : 'default' }}
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/5 group-hover:border-indigo-500/20 transition-colors`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{getActivityLabel(item.type)}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium italic">
                        <Calendar size={10} />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white truncate pr-4">
                      {item.type === 'search' ? `Searched for "${item.query}"` : 
                       item.type === 'view_note' ? `Reviewed "${item.topic || 'Untitled Note'}"` :
                       item.type === 'ai_explain' ? `Deep analysis on content snippet` :
                       item.type === 'ai_chat' ? `Consulted AI: "${item.query}"` :
                       'Engagement recorded'}
                    </h3>
                    {item.subject && (
                      <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">Subject: {item.subject}</p>
                    )}
                  </div>
                </div>

                {item.type === 'view_note' && (
                  <div className="flex items-center gap-2 text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span className="text-xs font-bold uppercase tracking-widest">Revisit</span>
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
