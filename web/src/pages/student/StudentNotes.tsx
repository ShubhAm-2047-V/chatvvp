import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, ChevronRight, Youtube, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTES_PER_PAGE = 4;

const StudentNotes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [subjects] = useState<string[]>(['Java', 'Python', 'MIC', 'DCN', 'ESS']);
  const [years] = useState<number[]>([1, 2, 3, 4]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserProfile(user);
      if (user.role === 'student' && user.year) {
        setFilterYear(user.year.toString());
      }
    }
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/student/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/student/notes/${noteId}`);
  };

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const isFiltering = searchTerm.trim().length > 0 || filterSubject !== '' || filterYear !== '';

  const filteredNotes = notes.filter(n => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
                          n.topic?.toLowerCase().includes(term) || 
                          n.subject?.toLowerCase().includes(term) ||
                          n.cleanedText?.toLowerCase().includes(term);
    const matchesSubject = filterSubject ? n.subject?.toLowerCase() === filterSubject.toLowerCase() : true;
    const matchesYear = filterYear ? n.year === Number(filterYear) : true;
    
    // Hide notes older than 2 days unless user is searching OR filtering
    const isRecent = isFiltering || new Date(n.createdAt) >= twoDaysAgo;
    
    return matchesSearch && matchesSubject && matchesYear && isRecent;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSubject, filterYear]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * NOTES_PER_PAGE,
    currentPage * NOTES_PER_PAGE
  );

  const handleSearchTrigger = () => {
    setLoading(true);
    setCurrentPage(1);
    setTimeout(() => setLoading(false), 300);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Library</h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)] italic">Access curated lecture materials and academic insights.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Filter Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-72 flex-shrink-0 space-y-8"
        >
          <div className="bento-card border border-white/5 space-y-6 sticky top-24">
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 block">Search</label>
              <div className="flex flex-col gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search topics or content..."
                    className="input-premium w-full pl-10 py-2 border-white/5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
                  />
                </div>
                <button 
                  onClick={handleSearchTrigger}
                  className="btn-primary py-2 text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                >
                  <Search size={14} />
                  Search Now
                </button>
              </div>
            </div>


            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 block">Subject</label>
              <select 
                className="input-premium w-full bg-[var(--surface-container)] border-white/5 text-sm"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {userProfile?.role === 'student' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10"
              >
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Fixed Profile</label>
                <div className="flex items-center gap-2">
                   <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded">Year {userProfile.year}</span>
                   <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">{userProfile.branch}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">Curated for your academic path.</p>
              </motion.div>
            ) : (
              <div>
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 block">Year</label>
                <select 
                  className="input-premium w-full bg-[var(--surface-container)] border-white/5 text-sm"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

          </div>
        </motion.div>

        {/* Notes Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1,2,4].map(i => <div key={i} className="h-64 bento-card animate-pulse bg-white/5"></div>)}
            </div>
          ) : filteredNotes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bento-card py-20 border-dashed border-white/10"
            >
              <BookOpen size={64} className="mx-auto text-white/10 mb-6" />
              <h3 className="text-xl font-bold text-white">No materials found</h3>
              <p className="mt-2 text-[var(--on-surface-variant)]">Try adjusting your filters or search terms.</p>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence>
                {paginatedNotes.map((note) => (
                  <motion.div 
                    layout
                    key={note._id} 
                    variants={{
                      hidden: { opacity: 0, scale: 0.9, y: 20 },
                      visible: { opacity: 1, scale: 1, y: 0 }
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="bento-card border border-white/5 flex flex-col justify-between group overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="chip chip-success !bg-indigo-500/10 !text-indigo-400">{note.subject}</span>
                        <div className="text-[var(--on-surface-variant)] flex items-center gap-1.5 text-xs">
                          <Clock size={12} />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{note.topic}</h3>
                      <p className="text-sm text-[var(--on-surface-variant)] line-clamp-3 leading-relaxed font-medium">
                        {note.cleanedText || note.formattedText || "Detailed study material available for reviewed content."}
                      </p>

                    </div>
                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"
                        >
                          <span className="text-[10px] font-bold">PDF</span>
                        </motion.div>
                        <span className="text-xs font-medium text-slate-500 italic">Curated Review</span>
                        {note.youtubeUrl && (
                          <div className="ml-3 flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/10">
                             <Youtube size={10} />
                             <span className="text-[9px] font-bold uppercase tracking-widest">Video</span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => handleNoteClick(note._id)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 group/btn"
                      >
                        Read Now
                        <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="col-span-full flex items-center justify-center gap-2 mt-10"
                >
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (idx > 0 && typeof arr[idx - 1] === 'number' && (page as number) - (arr[idx - 1] as number) > 1) {
                        acc.push('...');
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) => (
                      typeof item === 'string' ? (
                        <span key={`dots-${idx}`} className="px-2 text-slate-600 text-sm">•••</span>
                      ) : (
                        <motion.button
                          key={item}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => goToPage(item)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                            currentPage === item
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                              : 'border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {item}
                        </motion.button>
                      )
                    ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronsRight size={16} />
                  </button>

                  <span className="ml-4 text-xs text-slate-500">
                    Page {currentPage} of {totalPages} · {filteredNotes.length} notes
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

      </div>

    </div>
  );
};

export default StudentNotes;
