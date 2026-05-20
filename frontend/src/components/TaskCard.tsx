import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task, useStore } from '../store/useStore';
import { 
  Trash2, 
  GripVertical, 
  Clock, 
  Sparkles, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../lib/socket';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isOverlay }) => {
  const { updateTask } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const socket = getSocket();
    if (socket) {
      socket.emit('task:delete', task.id);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await api.patch(`/tasks/subtasks/${subtaskId}`, { completed: !completed });
      const updatedSubtasks = task.subtasks.map(s => 
        s.id === subtaskId ? { ...s, completed: !completed } : s
      );
      updateTask({ ...task, subtasks: updatedSubtasks });
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleAIDiscover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBreakingDown(true);
    try {
      const response = await api.post('/ai/breakdown', { title: task.title });
      const { subtasks } = response.data;
      const updatedTaskRes = await api.post(`/tasks/${task.id}/subtasks`, { subtasks });
      updateTask(updatedTaskRes.data);
      setIsExpanded(true);
    } catch (err) {
      console.error('AI Breakdown failed', err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const completedCount = task.subtasks?.filter(s => s.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine priority based on title keywords for UI variety
  const getPriority = () => {
    const title = task.title.toLowerCase();
    if (title.includes('urgent') || title.includes('fix') || title.includes('critical')) return { label: 'High', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' };
    if (title.includes('maybe') || title.includes('later')) return { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
    return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
  };

  const priority = getPriority();

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-[120px] bg-indigo-500/5 border-2 border-dashed border-indigo-500/30 rounded-2xl" 
      />
    );
  }

  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        "group relative glass-card rounded-2xl transition-all duration-300 overflow-hidden",
        isOverlay ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-indigo-500 border-indigo-500/50' : 'hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:shadow-2xl'
      )}
    >
      {/* Priority Glow */}
      <div className={cn("absolute top-0 left-0 w-full h-1 opacity-50", priority.bg.replace('/10', ''))} />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-2 flex-1">
            <div 
              {...attributes} 
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors"
            >
              <GripVertical size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 leading-snug group-hover:text-white transition-colors">
                {task.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider", priority.color, priority.bg, priority.border)}>
                  {priority.label}
                </span>
                {totalCount > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <CheckSquare size={10} />
                    {completedCount}/{totalCount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn(
                  "h-full relative",
                  progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                )}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              <div 
                className="h-6 w-6 rounded-full ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                style={{ backgroundColor: task.createdBy?.avatarColor || '#64748b' }}
              >
                {task.createdBy?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
              {task.startTime && (
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                  <Clock size={12} className="text-indigo-400" />
                  {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalCount === 0 ? (
              <button
                onClick={handleAIDiscover}
                disabled={isBreakingDown}
                className="p-1.5 glass hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 transition-all group/ai"
              >
                {isBreakingDown ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles size={14} className="group-hover/ai:rotate-12 transition-transform" />
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-500 hover:text-white glass rounded-xl transition-all"
              >
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks Dropdown */}
      <AnimatePresence>
        {isExpanded && totalCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-950/50 border-t border-white/5 px-4 py-3 space-y-2.5"
          >
            {task.subtasks.map((sub) => (
              <div 
                key={sub.id} 
                className="flex items-center gap-3 group/sub cursor-pointer"
                onClick={() => handleToggleSubtask(sub.id, sub.completed)}
              >
                <div className={cn(
                  "w-4 h-4 rounded border transition-all flex items-center justify-center",
                  sub.completed ? "bg-emerald-500 border-emerald-500" : "bg-slate-900 border-slate-700 group-hover/sub:border-indigo-500"
                )}>
                  {sub.completed && <CheckSquare size={10} className="text-white" />}
                </div>
                <span className={cn(
                  "text-[11px] font-medium transition-all",
                  sub.completed ? 'text-slate-500 line-through' : 'text-slate-300'
                )}>
                  {sub.title}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;
