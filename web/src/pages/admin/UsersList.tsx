import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, User, Shield, CheckCircle2, AlertCircle, Upload, FileSpreadsheet, Download, BookOpen, GraduationCap } from 'lucide-react';
import * as xlsx from 'xlsx';

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student',
    branch: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ created: number, skipped: number, errors: string[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/create-user', formData);
      setSuccess(true);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'student',
        branch: '',
        year: ''
      });
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) return;
    
    setBulkLoading(true);
    setError('');
    setBulkResult(null);
    
    const formData = new FormData();
    formData.append('file', bulkFile);
    
    try {
      const response = await api.post('/admin/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(response.data);
      setSuccess(true);
      setBulkFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk provisioning failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      { name: 'John Doe', email: 'john@student.com', branch: 'CS', year: 2, rollno: 'CS201' },
      { name: 'Jane Smith', email: 'jane@student.com', branch: 'IT', year: 1, rollno: 'IT105' }
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template");
    xlsx.writeFile(wb, "Student_Bulk_Upload_Template.xlsx");
  };

  return (
    <div className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      
      <div className="mb-12">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-400 transition-colors mb-4 group"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Registry
        </button>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Provision Identity</h1>
        <p className="mt-4 text-lg text-[var(--on-surface-variant)]">Forge new credentials for students or instructors.</p>
      </div>

      <div className="glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 blur-[100px] pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex gap-4 animate-shake">
              <AlertCircle className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex gap-4 animate-fade-in">
              <CheckCircle2 className="text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300 font-medium">Action successful. Refreshing vault...</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Full Identity Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="text"
                  required
                  className="input-premium w-full pl-12 h-13 focus:ring-red-500/50"
                  placeholder="e.g. Julian Goldie"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Access Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="email"
                  required
                  className="input-premium w-full pl-12 h-13 focus:ring-red-500/50"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Secret Key / Password</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="password"
                  required
                  className="input-premium w-full pl-12 h-13 focus:ring-red-500/50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Permissions Level</label>
              <select
                required
                className="input-premium w-full h-13 bg-transparent focus:ring-red-500/50"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="student" className="bg-[var(--surface-container)]">Student Access</option>
                <option value="teacher" className="bg-[var(--surface-container)]">Teacher Authority</option>
                <option value="admin" className="bg-[var(--surface-container)]">Administrator Authority</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Branch</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                    <input
                      type="text"
                      required
                      className="input-premium w-full pl-12 h-13 focus:ring-red-500/50"
                      placeholder="e.g. CS, IT, ME"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] pl-1">Academic Year</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                    <select
                      required
                      className="input-premium w-full pl-12 h-13 bg-transparent focus:ring-red-500/50"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                    >
                      <option value="" className="bg-[var(--surface-container)]">Select Year</option>
                      <option value="1" className="bg-[var(--surface-container)]">First Year</option>
                      <option value="2" className="bg-[var(--surface-container)]">Second Year</option>
                      <option value="3" className="bg-[var(--surface-container)]">Third Year</option>
                      <option value="4" className="bg-[var(--surface-container)]">Fourth Year</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'teacher' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-bold text-red-100 uppercase tracking-[0.2em] pl-1">Primary Teaching Subject</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-400 transition-colors" />
                  <input
                    type="text"
                    required
                    className="input-premium w-full pl-12 h-13 focus:ring-red-500/50"
                    placeholder="e.g. Mathematics, Java, Python"
                    value={(formData as any).subject || ''}
                    onChange={(e) => setFormData({...formData, subject: e.target.value} as any)}
                  />
                </div>
              </div>
            )}

            {formData.role === 'admin' && (
              <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 animate-fade-in">
                <p className="text-xs text-red-300 italic">Administrators have full system overrides. Use caution when provisioning this authority level.</p>
              </div>
            )}


          </div>

          <div className="pt-8 flex gap-4">
             <button
              type="button"
              onClick={() => navigate('/admin')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 !from-red-600 !to-red-500 !shadow-red-500/20"
            >
              {loading ? 'Provisioning...' : 'Seal Identity'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-12 mb-24">
        <h2 className="text-2xl font-bold text-white mb-6">Bulk Provisioning</h2>
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group indigo-glow">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
               <FileSpreadsheet size={40} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-1">Upload Excel Dossier</h3>
              <p className="text-sm text-[var(--on-surface-variant)] mb-4 leading-relaxed">Provision multiple student identities via spreadsheet formatting.</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl"
                >
                  <Download size={14} />
                  Get Template
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto space-y-4">
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="bulk-file-input"
              />
              <label 
                htmlFor="bulk-file-input"
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all min-w-[200px] ${bulkFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}
              >
                <Upload size={24} className={bulkFile ? 'text-emerald-400' : 'text-slate-500'} />
                <span className={`text-xs font-bold mt-2 ${bulkFile ? 'text-emerald-300' : 'text-slate-400'} truncate max-w-[150px]`}>
                  {bulkFile ? bulkFile.name : 'Select Spreadsheet'}
                </span>
              </label>

              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkLoading}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${!bulkFile || bulkLoading ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 active:scale-95'}`}
              >
                {bulkLoading ? 'Processing...' : 'Provision Bulk Identities'}
              </button>
            </div>
          </div>

          {bulkResult && (
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in relative z-10">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-black text-emerald-400">{bulkResult.created}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Created</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-black text-amber-400">{bulkResult.skipped}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Skipped</p>
              </div>
              {bulkResult.errors?.length > 0 && (
                <div className="col-span-2 sm:col-span-2 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                   <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1 flex items-center gap-2">
                     <AlertCircle size={12} />
                     Sample Errors
                   </p>
                   <p className="text-xs text-red-300/60 leading-tight italic line-clamp-2">{bulkResult.errors[0]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default UsersList;
