import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';

const StudentNotes: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [subjects] = useState<string[]>(['Java', 'Python', 'MIC', 'DCN', 'ESS']);
  const [years] = useState<number[]>([1, 2, 3, 4]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

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

  const handleNoteClick = async (noteId: string, fileUrl: string) => {
    try {
      await api.post(`/student/notes/${noteId}/view`);
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Failed to record view:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject ? n.subject?.toLowerCase() === filterSubject.toLowerCase() : true;
    const matchesYear = filterYear ? n.year === Number(filterYear) : true;
    return matchesSearch && matchesSubject && matchesYear;
  });

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Library</h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)]">Access curated lecture materials and academic insights.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Filter Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-8">
          <div className="bento-card border border-white/5 space-y-6">
            <div>
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 block">Search</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Keywords..."
                  className="input-premium w-full pl-10 py-2 border-white/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Fixed Profile</label>
                <div className="flex items-center gap-2">
                   <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded">Year {userProfile.year}</span>
                   <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">{userProfile.branch}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">Curated for your academic path.</p>
              </div>
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
        </div>

        {/* Notes Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1,2,4].map(i => <div key={i} className="h-64 bento-card animate-pulse bg-white/5"></div>)}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center bento-card py-20 border-dashed border-white/10">
              <BookOpen size={64} className="mx-auto text-white/10 mb-6" />
              <h3 className="text-xl font-bold text-white">No materials found</h3>
              <p className="mt-2 text-[var(--on-surface-variant)]">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <div key={note._id} className="bento-card border border-white/5 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="chip chip-success">{note.topic}</span>
                      <div className="text-[var(--on-surface-variant)] flex items-center gap-1.5 text-xs">
                        <Clock size={12} />
                        {new Date(note.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{note.title}</h3>
                    <p className="text-sm text-[var(--on-surface-variant)] line-clamp-3 leading-relaxed">{note.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <span className="text-[10px] font-bold">PDF</span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">2.4 MB</span>
                    </div>
                    <button 
                      onClick={() => handleNoteClick(note._id, note.fileUrl)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold text-sm flex items-center gap-1 group/btn"
                    >
                      Read Now
                      <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default StudentNotes;
