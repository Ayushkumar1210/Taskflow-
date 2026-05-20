import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { BellRing, X } from 'lucide-react';

const AlarmManager = () => {
  const tasks = useStore((state) => state.tasks);
  const [activeAlarm, setActiveAlarm] = useState<{ id: string; title: string } | null>(null);
  const triggeredAlarms = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      
      for (const task of tasks) {
        if (task.alarmEnabled && task.startTime) {
          const taskTime = new Date(task.startTime);
          
          // Check if it's time to ring (within the last minute to avoid missing it, 
          // but we use triggeredAlarms to avoid repeating)
          if (now >= taskTime && !triggeredAlarms.current.has(task.id)) {
            // Only trigger if it wasn't supposed to ring way in the past (e.g., > 1 hour ago)
            const timeDiff = now.getTime() - taskTime.getTime();
            if (timeDiff < 60 * 60 * 1000) { 
              triggerAlarm(task.id, task.title);
            } else {
              // Too old, just mark it as triggered
              triggeredAlarms.current.add(task.id);
            }
          }
        }
      }
    };

    const interval = setInterval(checkAlarms, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tasks]);

  const triggerAlarm = (taskId: string, title: string) => {
    triggeredAlarms.current.add(taskId);
    setActiveAlarm({ id: taskId, title });
    playAlarmSound();
  };

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playBeep = (time: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + time);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + time + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time + 0.5);
        
        oscillator.start(audioCtx.currentTime + time);
        oscillator.stop(audioCtx.currentTime + time + 0.5);
      };

      // Play a triple beep
      playBeep(0);
      playBeep(0.2);
      playBeep(0.4);

    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  if (!activeAlarm) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce-short">
      <div className="bg-slate-800 border-2 border-blue-500 rounded-xl shadow-2xl shadow-blue-500/20 p-4 flex items-start space-x-4 max-w-sm">
        <div className="bg-blue-500/20 p-3 rounded-full animate-pulse">
          <BellRing className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">Time to Start!</h3>
          <p className="text-slate-300 text-sm mb-3">
            Task: <span className="font-semibold text-white">{activeAlarm.title}</span>
          </p>
          <button 
            onClick={dismissAlarm}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 rounded-lg transition-colors text-sm"
          >
            Acknowledge
          </button>
        </div>
        <button 
          onClick={dismissAlarm}
          className="text-slate-400 hover:text-white absolute top-2 right-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AlarmManager;
