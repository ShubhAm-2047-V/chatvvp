import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Layout, BookOpen, MessageSquare, ShieldCheck, User as UserIcon, Clock, School } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50">
      <div className="glass-panel rounded-3xl py-3 px-6 shadow-2xl flex items-center justify-between indigo-glow">
        
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 group"
          title="Go Back"
        >
          <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <span className="text-sm font-medium hidden lg:block">Back</span>
        </button>
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 transition-transform group-hover:scale-110">
              <img src="/logo.png" alt="Chat.VVP Logo" className="w-full h-full object-contain rounded-lg shadow-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                CHAT.<span className="text-indigo-400">VVP</span>
              </span>
              <span className="text-[8px] text-slate-400 font-medium tracking-tighter uppercase">
                College Study Assistant
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {role === 'student' && (
              <>
                <NavLink to="/student" icon={<Layout size={18} />} label="Dashboard" active={isActive('/student')} />
                <NavLink to="/student/notes" icon={<BookOpen size={18} />} label="Library" active={isActive('/student/notes')} />
                <NavLink to="/student/quizzes" icon={<School size={18} />} label="Practice" active={isActive('/student/quizzes')} />
                <NavLink to="/student/ai" icon={<MessageSquare size={18} />} label="AI Tutor" active={isActive('/student/ai')} />
                <NavLink to="/student/history" icon={<Clock size={18} />} label="History" active={isActive('/student/history')} />
              </>
            )}
            {role === 'teacher' && (
              <>
                <NavLink to="/teacher" icon={<Layout size={18} />} label="Dashboard" active={isActive('/teacher')} />
                <NavLink to="/teacher/add-notes" icon={<BookOpen size={18} />} label="Upload" active={isActive('/teacher/add-notes')} />
                <NavLink to="/teacher/ai" icon={<MessageSquare size={18} />} label="AI Assistant" active={isActive('/teacher/ai')} />
                <NavLink to="/teacher/personal-notes" icon={<UserIcon size={18} />} label="Personal" active={isActive('/teacher/personal-notes')} />
              </>
            )}
            {role === 'admin' && (
              <>
                <NavLink to="/admin" icon={<ShieldCheck size={18} />} label="Security" active={isActive('/admin')} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">{role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--surface-bright)] border border-[var(--outline-variant)] flex items-center justify-center text-indigo-400">
            <UserIcon size={20} />
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>

      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <motion.div
    whileHover={{ scale: 1.1, x: 5 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-indigo-500/20 text-indigo-300 font-bold text-glow' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  </motion.div>
);

export default Navbar;
