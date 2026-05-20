import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

const OperationFeed = () => {
  const operations = useStore(state => state.operations);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom or keep scroll if user scrolled up
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [operations]);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {operations.slice().reverse().map((op) => (
        <div key={op.id} className="relative pl-6 pb-4 last:pb-0 group">
          {/* Timeline Line */}
          <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-700 group-last:hidden"></div>
          
          <div className="flex items-start space-x-3 relative">
            <div className="absolute left-[-24px] top-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-slate-800 z-10"></div>
            
            <div className="flex-1 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 p-3 rounded-lg shadow-sm transition-colors">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-blue-400">{op.username}</span>{' '}
                {op.action}{' '}
                <span className="font-medium text-slate-200">"{op.taskTitle}"</span>
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                {formatTime(op.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      <div ref={feedEndRef} />
      
      {operations.length === 0 && (
        <div className="text-center text-sm text-slate-500 mt-10">
          No activities yet
        </div>
      )}
    </div>
  );
};

export default OperationFeed;
