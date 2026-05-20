import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Command, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getSocket } from '../lib/socket';

const VoiceCommandController: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const { tasks } = useStore();
  const socket = getSocket();

  const processCommand = useCallback((transcript: string) => {
    const command = transcript.toLowerCase();
    setLastCommand(transcript);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);

    if (command.includes('open whiteboard') || command.includes('go to whiteboard')) {
      navigate('/whiteboard');
    } else if (command.includes('open analytics') || command.includes('go to analytics')) {
      navigate('/analytics');
    } else if (command.includes('go to board') || command.includes('open board')) {
      navigate('/');
    } else if (command.includes('create task')) {
      const title = transcript.replace(/create task/i, '').trim();
      if (title && socket) {
        socket.emit('task:create', { title, description: 'Created via voice', status: 'Todo' });
      }
    } else if (command.includes('move') && command.includes('to done')) {
      const taskTitle = command.replace(/move/i, '').replace(/to done/i, '').trim();
      const task = tasks.find(t => t.title.toLowerCase().includes(taskTitle));
      if (task && socket) {
        socket.emit('task:move', { id: task.id, status: 'Done' });
      }
    }
  }, [navigate, socket, tasks]);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, processCommand]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4">
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-2 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400">
              <Command size={16} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Voice Command</p>
              <p className="text-sm text-slate-200 font-medium italic">"{lastCommand}"</p>
            </div>
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsListening(!isListening)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl group relative ${
          isListening 
            ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/40' 
            : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
        }`}
      >
        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
        
        <div className="absolute -top-12 left-0 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-800 shadow-xl">
          {isListening ? 'Listening...' : 'Enable Voice Control'}
        </div>
      </button>
    </div>
  );
};

export default VoiceCommandController;
