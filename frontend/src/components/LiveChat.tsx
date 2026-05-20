import React, { useState, useEffect, useRef } from 'react';
import { useStore, type User } from '../store/useStore';
import { getSocket } from '../lib/socket';
import { Send, Smile, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  userId: string;
  user: User;
  timestamp: string;
}

const LiveChat: React.FC = () => {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<{ userId: string, username: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message:receive', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('typing:start', (data: { userId: string, username: string }) => {
      if (data.userId === user?.id) return;
      setTypingUsers(prev => {
        if (prev.find(u => u.userId === data.userId)) return prev;
        return [...prev, data];
      });
    });

    socket.on('typing:stop', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      socket.off('message:receive');
      socket.off('typing:start');
      socket.off('typing:stop');
    };
  }, [socket, user?.id]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    socket.emit('message:send', { text: input });
    socket.emit('typing:stop');
    setInput('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket) return;

    if (e.target.value.length > 0) {
      socket.emit('typing:start');
    } else {
      socket.emit('typing:stop');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/50">
      <div className="p-4 bg-slate-800/60 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Team Chat</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <MessageSquare size={32} strokeWidth={1} />
            <p className="text-xs">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-2 max-w-[90%] ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}>
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 mt-1"
                style={{ backgroundColor: msg.user.avatarColor }}
              >
                {msg.user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-2 ${msg.userId === user?.id ? 'justify-end' : ''}`}>
                  <span className="text-[10px] font-medium text-slate-400">{msg.user.username}</span>
                  <span className="text-[8px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.userId === user?.id 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                    : 'bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600/50 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-[10px] text-slate-400 italic bg-slate-800/40 border-t border-slate-700/30">
          {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      <div className="p-3 bg-slate-800/60 border-t border-slate-700/50">
        <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-700/50 rounded-xl focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
          <button className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors">
            <Smile size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs px-1 text-slate-100 placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
