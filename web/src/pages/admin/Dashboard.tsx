import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, UserPlus, Trash2, ShieldCheck, Mail, LayoutGrid, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, students: 0, teachers: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('revoke user access permanently?')) {
      try {
        await api.delete(`/admin/delete-user/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/toggle-block/${userId}`);
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !currentStatus } : u));
    } catch (error) {
      console.error('Failed to toggle block status:', error);
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8"
    >
      
      <motion.div variants={itemVariants} className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <ShieldCheck size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Administrative Realm</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">System Authority</h1>
          <p className="mt-4 text-lg text-[var(--on-surface-variant)]">Control access permissions and oversee user population.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/users')}
          className="btn-primary !from-red-600 !to-red-500 !shadow-red-500/20"
        >
          <UserPlus size={20} />
          Provision Access
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatsCard 
          icon={<Users className="text-indigo-400" />} 
          label="Total Population" 
          value={stats.totalUsers} 
          subtitle="Registered personas" 
          delay={0.2}
        />
        <StatsCard 
          icon={<LayoutGrid className="text-emerald-400" />} 
          label="Instructional Staff" 
          value={stats.teachers} 
          subtitle="Curators of knowledge" 
          delay={0.3}
        />
         <StatsCard 
          icon={<Mail className="text-purple-400" />} 
          label="Active Students" 
          value={stats.students} 
          subtitle="Seekers of truth" 
          delay={0.4}
        />
      </div>

      <motion.div variants={itemVariants} className="bento-card border border-white/5 p-0 overflow-hidden">
        <div className="px-8 py-6 bg-[var(--surface-container-low)] border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Identity Registry</h3>
          <span className="chip chip-success !bg-red-500/10 !text-red-400 !border-red-500/20 text-[10px]">Secure</span>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
             <div className="p-20 text-center text-slate-500 italic animate-pulse">Accessing encrypted vault...</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user, idx) => (
                  <motion.tr 
                    key={user._id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-400 font-mono">{user.email}</td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : user.role === 'teacher' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                          {user.role}
                        </span>
                        {user.isBlocked && (
                          <span className="px-2 py-0.5 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
                        <button 
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)} 
                          className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-amber-400 hover:bg-amber-400/10'}`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          {user.isBlocked ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user._id)} 
                          className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
};

const StatsCard = ({ icon, label, value, subtitle, delay }: { icon: any, label: string, value: any, subtitle: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bento-card border border-white/5 p-8 flex flex-col justify-between group cursor-default hover:bg-[var(--surface-container-highest)]"
  >
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-indigo-500/30 group-hover:animate-pulse transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-5xl font-extrabold text-white mt-2 tracking-tighter tabular-nums">{value}</p>
      </div>
      <p className="text-sm text-[var(--on-surface-variant)] mt-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        {subtitle}
      </p>
    </div>
  </motion.div>
);

export default AdminDashboard;
