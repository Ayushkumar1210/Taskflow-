import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../store/useStore';
import TaskCard from './TaskCard';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { MoreHorizontal, Plus } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const getStatusColor = (title: string) => {
    switch (title) {
      case 'Todo': return 'from-slate-400 to-slate-600 shadow-slate-500/20';
      case 'In Progress': return 'from-indigo-400 to-blue-600 shadow-indigo-500/20';
      case 'Review': return 'from-purple-400 to-pink-600 shadow-purple-500/20';
      case 'Done': return 'from-emerald-400 to-teal-600 shadow-emerald-500/20';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col w-[320px] h-full max-h-full"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full bg-gradient-to-br shadow-lg ring-4 ring-slate-900/50",
            getStatusColor(title)
          )} />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase font-display">{title}</h3>
          <span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-lg border border-white/5">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Plus size={14} />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      
      {/* Task List Container */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto p-3 rounded-2xl transition-all duration-300 custom-scrollbar flex flex-col gap-4 border border-white/5",
          isOver ? 'bg-indigo-500/10 ring-2 ring-indigo-500/20 ring-inset scale-[1.01]' : 'bg-white/[0.02]'
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex-1 min-h-[200px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-6 gap-3 group cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all">
            <div className="p-3 bg-white/5 rounded-full text-slate-600 group-hover:text-indigo-400 transition-colors">
              <Plus size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 group-hover:text-slate-300">No tasks here</p>
              <p className="text-[10px] text-slate-600">Drag or click to add</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Column;
