import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NotebookPen, Plus, Trash2, Edit3, Save, X, Tag } from 'lucide-react';

interface PersonalNote {
  _id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
}

const PersonalNotes: React.FC = () => {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', color: '#4F46E5' });

  const colors = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Slate', value: '#475569' }
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/teacher/personal-notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch personal notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await api.put(`/teacher/personal-notes/${editingNote._id}`, formData);
      } else {
        await api.post('/teacher/personal-notes', formData);
      }
      fetchNotes();
      closeModal();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this note permanently?')) {
      try {
        await api.delete(`/teacher/personal-notes/${id}`);
        setNotes(notes.filter(n => n._id !== id));
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const openModal = (note?: PersonalNote) => {
    if (note) {
      setEditingNote(note);
      setFormData({ title: note.title, content: note.content, color: note.color });
    } else {
      setEditingNote(null);
      setFormData({ title: '', content: '', color: '#4F46E5' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', color: '#4F46E5' });
  };

  return (
    <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
            Private Notepad <NotebookPen className="text-indigo-400" size={32} />
          </h1>
          <p className="mt-4 text-lg text-[var(--on-surface-variant)]">Your secure repository for teaching strategies and insights.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary !h-14 !px-8"
        >
          <Plus size={20} />
          Append Note
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 italic">Syncing with encrypted vault...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-32 text-center bento-card border-dashed border-2 border-white/5">
          <NotebookPen size={64} className="mx-auto text-white/10 mb-6" />
          <p className="text-xl text-slate-400 font-medium">Your notepad is currently blank.</p>
          <p className="text-sm text-slate-500 mt-2">Begin capturing your first instructional insight.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notes.map((note) => (
            <div 
              key={note._id} 
              className="bento-card relative group hover:scale-[1.02] transition-all p-8 flex flex-col justify-between"
              style={{ borderLeft: `4px solid ${note.color}` }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white truncate pr-10">{note.title}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal(note)}
                      className="text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(note._id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <Tag size={12} style={{ color: note.color }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] p-10 relative z-10 animate-fade-in indigo-glow">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {editingNote ? 'Refine Note' : 'New Insight'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">Title</label>
                <input
                  type="text"
                  required
                  className="input-premium w-full h-13"
                  placeholder="Note Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">Content</label>
                <textarea
                  required
                  rows={6}
                  className="input-premium w-full !h-auto py-4 no-scrollbar"
                  placeholder="Detailed observations..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">Theme Color</label>
                <div className="flex gap-4">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Discard
                </button>
                <button type="submit" className="btn-primary flex-1">
                  <Save size={20} />
                  Authorize Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalNotes;
