import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Clock, Trash2, ExternalLink, Plus, Layout } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalNotes: 0, totalViews: 0 });
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, notesRes] = await Promise.all([
        api.get('/teacher/stats'),
        api.get('/teacher/my-notes')
      ]);
      setStats(statsRes.data);
      setMyNotes(notesRes.data);
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Are you certain you want to remove this material permanently?')) {
      try {
        await api.delete(`/teacher/notes/${noteId}`);
        setMyNotes(myNotes.filter(n => n._id !== noteId));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Layout size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Faculty Access</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Teacher Console</h1>
          <p className="mt-4 text-lg text-[var(--on-surface-variant)]">Orchestrate learning materials and analyze engagement.</p>
        </div>
        <button 
          onClick={() => navigate('/teacher/add-notes')}
          className="btn-primary"
        >
          <Plus size={20} />
          Publish New Material
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <StatsCard 
          icon={<BookOpen className="text-indigo-400" />} 
          label="Notes Published" 
          value={stats.totalNotes} 
          subtitle="Materials accessible to students" 
        />
        <StatsCard 
          icon={<BarChart3 className="text-emerald-400" />} 
          label="Total Readership" 
          value={stats.totalViews} 
          subtitle="Cumulative student views" 
        />
      </div>

      <div className="bento-card border border-white/5 overflow-hidden p-0">
        <div className="px-8 py-6 bg-[var(--surface-container-low)] border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Published Assets</h3>
          <span className="chip chip-success text-[10px]">{myNotes.length} Total</span>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="p-20 text-center text-slate-500 italic">Syncing materials...</div>
          ) : myNotes.length === 0 ? (
            <div className="p-20 text-center text-slate-500">Your editorial queue is currently empty.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Title</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Engagement</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Published</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myNotes.map((note) => (
                  <tr key={note._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-white">{note.title}</td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400">{note.topic}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-sm font-medium text-slate-200">{note.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 text-[11px] font-mono">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => window.open(note.fileUrl, '_blank')} className="text-indigo-400 hover:text-white transition-colors" title="View Source">
                          <ExternalLink size={18} />
                        </button>
                        <button onClick={() => handleDelete(note._id)} className="text-red-400 hover:text-white transition-colors" title="Delete Material">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

const StatsCard = ({ icon, label, value, subtitle }: { icon: any, label: string, value: any, subtitle: string }) => (
  <div className="bento-card border border-white/5 p-8 flex flex-col justify-between group cursor-default">
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-5xl font-extrabold text-white mt-2 tabular-nums tracking-tighter">{value}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
        <Clock size={14} />
        {subtitle}
      </div>
    </div>
  </div>
);

const TrendingUp = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default TeacherDashboard;
