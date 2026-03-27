import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronLeft, Youtube, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const AddNotes: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewNote, setPreviewNote] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    branch: '',
    year: '',
    topic: '',
    youtubeUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    
    const data = new FormData();
    data.append('file', file);
    data.append('subject', formData.subject);
    data.append('branch', formData.branch);
    data.append('year', formData.year);
    data.append('topic', formData.topic);
    if (formData.youtubeUrl) {
      data.append('youtubeUrl', formData.youtubeUrl);
    }

    try {
      const res = await api.post('/teacher/upload-note', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setPreviewNote(res.data.note);
      setShowPreview(true);
      // Redirection removed to allow preview
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.response?.data?.message || 'Failed to process upload. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (showPreview && previewNote) {
    return (
      <div className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Extraction Preview</h1>
          <p className="text-[var(--on-surface-variant)]">Review the AI-formatted results before finalizing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bento-card border border-white/5 p-6">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Material Profile</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Subject</p>
                  <p className="text-white font-bold">{previewNote.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Topic</p>
                  <p className="text-white font-bold">{previewNote.topic}</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Branch</p>
                    <p className="text-white font-bold">{previewNote.branch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Year</p>
                    <p className="text-white font-bold">Year {previewNote.year}</p>
                  </div>
                </div>
                {previewNote.youtubeUrl && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <Youtube size={16} />
                      <span className="text-[10px] font-bold uppercase">Video Link Integrated</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{previewNote.youtubeUrl}</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => navigate('/teacher')}
              className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
            >
              <CheckCircle2 size={20} />
              Finalize & Close
            </button>
          </div>

          {/* Content Main View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bento-card border border-white/5 p-8 min-h-[600px] relative overflow-hidden bg-[var(--surface-container-low)]">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={120} />
             </div>
             
             <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4">Extracted Content</h2>
                <div className="prose prose-invert max-w-none">
                  {previewNote.formattedText ? (
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                      {previewNote.formattedText}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">No formatted text available. Raw content below:</div>
                  )}
                  {!previewNote.formattedText && previewNote.cleanedText && (
                    <div className="mt-4 whitespace-pre-wrap text-slate-400">
                      {previewNote.cleanedText}
                    </div>
                  )}
                </div>
             </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <div className="mb-12 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-400 transition-colors mb-4 group"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Console
          </button>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Publish Material</h1>
          <p className="mt-4 text-[var(--on-surface-variant)] text-lg">Upload documents to initiate AI-powered text extraction and formatting.</p>
        </div>
      </div>

      <div className="bento-card border border-indigo-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex gap-4 animate-shake">
              <AlertCircle className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex gap-4 animate-fade-in">
              <CheckCircle2 className="text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300 font-medium">Material synchronized successfully. Redirecting...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1">Course / Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="input-premium w-full h-13"
                placeholder="e.g. Theoretical Physics"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1">Topic Header</label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="input-premium w-full h-13"
                placeholder="e.g. Quantum Entanglement"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1">Department</label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="input-premium w-full h-13"
                placeholder="e.g. Physical Sciences"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1">Academic Year</label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="input-premium w-full h-13 bg-transparent"
              >
                <option value="" className="bg-[var(--surface-container)]">Select Tenure</option>
                <option value="1" className="bg-[var(--surface-container)]">Year I</option>
                <option value="2" className="bg-[var(--surface-container)]">Year II</option>
                <option value="3" className="bg-[var(--surface-container)]">Year III</option>
                <option value="4" className="bg-[var(--surface-container)]">Year IV</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
              <Youtube size={14} /> Supplemental Video URL (Optional)
            </label>
            <input
              type="url"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
              className="input-premium w-full h-13"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] pl-1">Study Material Source</label>
            <div className={`relative group border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 ${file ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-white/5 hover:border-indigo-500/20'}`}>
              <input 
                id="file-upload" 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                accept="image/*,.pdf" 
              />
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-xl ${file ? 'bg-indigo-500 text-white' : 'bg-[var(--surface-bright)] text-slate-500'}`}>
                  {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {file ? file.name : "Drop study asset here"}
                </h3>
                <p className="text-sm text-slate-500">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF documents or high-resolution images (max 5MB)"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-white/5">
             <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-slate-600">
                <FileText size={14} />
                AUTO-OCR ENABLED
             </div>
             <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="btn-secondary"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="btn-primary"
                >
                  {loading ? 'Orchestrating...' : 'Unleash Content'}
                </button>
             </div>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AddNotes;
