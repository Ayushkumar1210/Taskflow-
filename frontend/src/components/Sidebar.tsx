import React from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  Layers, 
  LogOut, 
  Moon,
  Sun,
  Zap,
  Calendar
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Board', icon: LayoutDashboard, path: '/' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Whiteboard', icon: Layers, path: '/whiteboard' },
    { name: 'Calendar', icon: Calendar, path: '#' },
  ];

  return (
    <aside className="w-64 flex-none border-r border-slate-800/50 flex flex-col glass relative z-20">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="text-white h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold font-display text-gradient-primary">TaskFlow</h1>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full"
                />
              )}
              <item.icon size={18} className={cn(isActive ? "text-indigo-400" : "group-hover:scale-110 transition-transform")} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Extra Sections */}
      <div className="px-6 py-4 space-y-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Team Spaces</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors p-2 rounded-lg hover:bg-slate-800/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Product Design
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors p-2 rounded-lg hover:bg-slate-800/30">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            Engineering
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-800/50 space-y-3">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm font-medium">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </div>
          <div className={cn(
            "w-8 h-4 rounded-full relative transition-colors",
            theme === 'dark' ? "bg-indigo-500" : "bg-slate-700"
          )}>
            <motion.div 
              animate={{ x: theme === 'dark' ? 16 : 2 }}
              className="absolute top-1 w-2 h-2 rounded-full bg-white"
            />
          </div>
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-700/30">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: user?.avatarColor }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
