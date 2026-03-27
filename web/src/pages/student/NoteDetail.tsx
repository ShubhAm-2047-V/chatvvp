import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ChevronLeft,
  Youtube, 
  FileText, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await api.get(`/student/notes/${id}`);
      setNote(response.data);
      // Record view activity
      api.post('/student/activity/view-note', {
        noteId: response.data._id,
        topic: response.data.topic,
        subject: response.data.subject
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to fetch note:', error);
    } finally {
      setLoading(false);
    }
  };

  const explainText = async () => {
    if (!note?.formattedText && !note?.cleanedText) return;
    setAiLoading(true);
    try {
      const textToExplain = note.formattedText || note.cleanedText;
      const response = await api.post('/student/explain', { text: textToExplain });
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error('AI Explain Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-white">Note not found</h2>
        <button onClick={() => navigate('/student/notes')} className="mt-4 text-indigo-400">Back to Library</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={() => navigate('/student/notes')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-400 transition-colors mb-8 group"
      >
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Metadata & Resources */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card border border-white/5 space-y-6"
          >
            <div>
              <span className="chip chip-success !bg-indigo-500/10 !text-indigo-400 text-[10px] mb-4 uppercase tracking-widest">{note.subject}</span>
              <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">{note.topic}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Year</p>
                <p className="text-white font-bold">Year {note.year}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Branch</p>
                <p className="text-white font-bold uppercase">{note.branch}</p>
              </div>
            </div>

            {note.imageUrl && (
              <div className="pt-6">
                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-3">Original Asset</p>
                 <a 
                   href={note.imageUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all group"
                 >
                   <ExternalLink size={18} className="text-indigo-400" />
                   View Original Media
                 </a>
              </div>
            )}
          </motion.div>

          {note.youtubeUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bento-card border border-red-500/10 bg-red-500/5"
            >
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <Youtube size={20} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Video Supplement</h3>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                 <iframe
                   className="w-full h-full"
                   src={getEmbedUrl(note.youtubeUrl)}
                   title="YouTube video player"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                 ></iframe>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bento-card border border-indigo-500/20 bg-indigo-500/5 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={48} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              AI Study Assistant
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">Need a deeper explanation? My neural core can analyze this content for you.</p>
            <button 
              onClick={explainText}
              disabled={aiLoading}
              className="btn-primary w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
            >
              {aiLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Synthesizing...
                </>
              ) : (
                <>
                  <MessageSquare size={14} />
                  Explain Complex Topics
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Right: Content View */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {explanation ? (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="bento-card border border-indigo-500/30 bg-indigo-900/10 p-8 min-h-[400px]"
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">AI Insights</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enhanced Explanation</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setExplanation(null)}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Return to Notes
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed space-y-4">
                  {explanation.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card border border-white/5 p-8 min-h-[600px] bg-[var(--surface-container-low)]"
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                      <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Curated Content</h2>
                  </div>
                </div>

                <div 
                  className="prose prose-invert max-w-none text-slate-300 leading-relaxed font-medium overflow-y-auto max-h-[500px] pr-4"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#4f46e5 transparent' }}
                >
                  {(note.formattedText || note.cleanedText) ? (
                    <div className="whitespace-pre-wrap">{note.formattedText || note.cleanedText}</div>
                  ) : (
                    <p className="text-slate-500 italic">No textual content extracted yet.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
