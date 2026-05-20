import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { getSocket } from '../lib/socket';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCorners } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';

import Column from './Column';
import TaskCard from './TaskCard';
import { Plus, Bell, BellOff, X, Calendar, Text, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

const Board = () => {
  const tasks = useStore(state => state.tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskAlarm, setNewTaskAlarm] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === taskId);
    if (!activeTask) return;

    if (COLUMNS.includes(overId)) {
      if (activeTask.status !== overId) {
        const socket = getSocket();
        if (socket) {
          socket.emit('task:move', { id: taskId, status: overId });
        }
      }
      return;
    }

    const overTask = tasks.find(t => t.id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      const socket = getSocket();
      if (socket) {
        socket.emit('task:move', { id: taskId, status: overTask.status });
      }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const socket = getSocket();
    if (socket) {
      socket.emit('task:create', { 
        title: newTaskTitle, 
        description: '', 
        status: 'Todo',
        startTime: newTaskStartTime || null,
        alarmEnabled: newTaskAlarm
      });
    }
    
    setNewTaskTitle('');
    setNewTaskStartTime('');
    setNewTaskAlarm(false);
    setIsAddingTask(false);
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/20 transition-all font-bold text-sm hover:scale-105 active:scale-95 group"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
            New Task
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles size={14} className="text-indigo-400" />
            {tasks.length} Active Tasks
          </div>
        </div>

        <AnimatePresence>
          {isAddingTask && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              onClick={() => setIsAddingTask(false)}
            >
              <motion.div 
                className="w-full max-w-lg glass-card rounded-[32px] p-8 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gradient">Create New Task</h3>
                    <p className="text-sm text-slate-500">Plan your next big move</p>
                  </div>
                  <button onClick={() => setIsAddingTask(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
                    <div className="relative">
                      <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input
                        autoFocus
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Due Time</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                          type="datetime-local"
                          value={newTaskStartTime}
                          onChange={(e) => setNewTaskStartTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reminders</label>
                      <button
                        type="button"
                        onClick={() => setNewTaskAlarm(!newTaskAlarm)}
                        className={cn(
                          "w-full h-[46px] rounded-2xl border flex items-center justify-center gap-3 transition-all font-bold text-xs",
                          newTaskAlarm 
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 glow-indigo" 
                            : "bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-300 hover:border-slate-700"
                        )}
                      >
                        {newTaskAlarm ? <Bell size={16} /> : <BellOff size={16} />}
                        {newTaskAlarm ? 'Alarm Active' : 'Enable Alarm'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingTask(false)} 
                      className="flex-1 py-4 text-slate-500 hover:text-white font-bold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
        <DndContext 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-8 h-full min-w-max items-start">
            {COLUMNS.map(columnId => (
              <Column 
                key={columnId} 
                id={columnId} 
                title={columnId}
                tasks={tasks.filter(t => t.status === columnId)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Board;
