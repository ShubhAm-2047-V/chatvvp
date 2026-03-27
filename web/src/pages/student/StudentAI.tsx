import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggeredText, FadeUpText } from '../../components/AnimatedText';

const StudentAI: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/student/ai/history');
      if (response.data && response.data.length > 0) {
        const formattedHistory: any[] = [];
        response.data.forEach((item: any) => {
          formattedHistory.push({ text: item.query, isBot: false });
          formattedHistory.push({ text: item.response, isBot: true });
        });
        setMessages(formattedHistory);
      } else {
        setMessages([{
          text: "Greetings! I am your personal AI Study Assistant. What shall we explore today?",
          isBot: true
        }]);
      }
    } catch (error) {
      console.error('Failed to fetch AI history:', error);
      setMessages([{
        text: "Greetings! I am your personal AI Study Assistant. What shall we explore today?",
        isBot: true
      }]);
    } finally {
      setFetchingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setLoading(true);

    try {
      const response = await api.post('/student/ai/ask', { query: userMessage });
      setMessages(prev => [...prev, { text: response.data.answer, isBot: true }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        text: "I encountered a transient error while processing your request. Please try again in a moment.", 
        isBot: true,
        isError: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4 overflow-hidden">
            <StaggeredText text="AI Tutor" /> <Sparkles className="text-indigo-400" size={32} />
          </h1>
          <p className="mt-4 text-lg text-[var(--on-surface-variant)]">
             <FadeUpText text="The sanctuary of immediate knowledge." delay={0.3} />
          </p>
        </div>
      </div>

      <div className="flex-1 bento-card border border-white/5 flex flex-col overflow-hidden indigo-glow shadow-2xl relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative z-10">
          {fetchingHistory ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
              <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm font-bold tracking-widest uppercase">Restoring History</p>
            </div>
          ) : (
            <>
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start gap-4 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${msg.isBot ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                      {msg.isBot ? <Bot size={20} /> : <UserIcon size={20} />}
                    </div>
                    <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed ${msg.isBot ? (msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[var(--surface-bright)] bg-opacity-30 border border-white/5 text-slate-200') : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}>
                      {msg.text.split('\n').map((line: string, i: number) => (
                        <React.Fragment key={i}>
                          {line}
                          {i !== msg.text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
              {loading && (
                <div className="flex justify-start">
                   <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Bot size={20} />
                    </div>
                    <div className="bg-[var(--surface-bright)] bg-opacity-30 border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-2">
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                       <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-white/5 bg-[var(--surface-container-low)] p-6 z-20">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question related to your studies..."
              className="flex-1 input-premium h-14 text-base"
              disabled={loading || fetchingHistory}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || fetchingHistory}
              className="btn-primary w-14 h-14 p-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StudentAI;
