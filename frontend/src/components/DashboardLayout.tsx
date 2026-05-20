import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Flame,
  ArrowRight,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, tasks } = useStore();
  const [search, setSearch] = useState('');

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const productivityScore = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gradient-mesh overflow-hidden relative">
      {/* Top Header */}
      <header className="h-16 flex-none flex items-center justify-between px-8 border-b border-white/5 glass z-10 sticky top-0">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks, docs, or people..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-500 font-sans">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] text-slate-500 font-sans">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 text-xs font-bold glow-indigo">
            <Flame size={14} className="animate-pulse" />
            7 Day Streak
          </div>
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0f172a]" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95">
            <Plus size={18} />
            Create
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Welcome */}
          <section className="relative overflow-hidden rounded-3xl border border-white/5 glass p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 flex-1">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest"
                >
                  <Sparkles size={14} />
                  Dashboard Overview
                </motion.div>
                <h2 className="text-4xl font-extrabold text-gradient">
                  Good morning, {user?.username}! 👋
                </h2>
                <p className="text-slate-400 max-w-md leading-relaxed">
                  "The only way to do great work is to love what you do." — Steve Jobs
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800" />
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      +12
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">Your team is online</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center space-y-2 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Productivity Score</div>
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                      <motion.circle 
                        cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251.2}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * productivityScore) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-indigo-500" 
                      />
                    </svg>
                    <span className="absolute text-2xl font-black text-white">{productivityScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Tasks Completed', value: completedTasks, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Weekly Target', value: '85%', icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Time Tracked', value: '24h', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
              { label: 'Daily Streak', value: '7', icon: Flame, color: 'text-rose-400', bg: 'bg-rose-400/10' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-3xl group cursor-pointer hover:border-indigo-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <button className="text-slate-600 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                  <span className="text-xs text-emerald-400 font-bold">+12%</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Children (Board/Board Content) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                Current Workspace
                <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded border border-slate-700 uppercase font-bold">Standard</span>
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white bg-slate-900/50 rounded-lg border border-slate-800 transition-all">
                  <Activity size={16} />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-all text-xs font-bold">
                  View Settings
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sparkles: React.FC<{ size?: number, className?: string }> = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export default DashboardLayout;
