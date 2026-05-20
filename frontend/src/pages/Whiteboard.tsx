import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { getSocket } from '../lib/socket';
import { 
  Square, Circle, Type, Trash2, MousePointer2, 
  Download, Eraser, Move, ZoomIn, ZoomOut, ArrowLeft,
  StickyNote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const navigate = useNavigate();
  const socket = getSocket();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 80,
      height: window.innerHeight - 100,
      backgroundColor: '#0f172a',
    });

    fabricCanvas.current = canvas;

    // Handle incoming socket events
    if (socket) {
      socket.on('shape:create', (data: any) => {
        fabric.util.enlivenObjects([data]).then((enlivenedObjects: any[]) => {
          enlivenedObjects.forEach((obj) => {
            canvas.add(obj);
          });
          canvas.renderAll();
        });
      });

      socket.on('shape:update', (data: any) => {
        const obj = canvas.getObjects().find((o: any) => o.id === data.id);
        if (obj) {
          obj.set(data);
          canvas.renderAll();
        }
      });

      socket.on('shape:delete', (id: string) => {
        const obj = canvas.getObjects().find((o: any) => o.id === id);
        if (obj) {
          canvas.remove(obj);
          canvas.renderAll();
        }
      });

      socket.on('board:clear', () => {
        canvas.clear();
        canvas.backgroundColor = '#0f172a';
        canvas.renderAll();
      });
    }

    // Handle local events to emit to socket
    canvas.on('object:added', (e: any) => {
      if (!e.target.id) {
        e.target.id = Math.random().toString(36).substr(2, 9);
        socket?.emit('shape:create', e.target.toObject(['id']));
      }
    });

    canvas.on('object:modified', (e: any) => {
      socket?.emit('shape:update', e.target.toObject(['id']));
    });

    canvas.on('object:removed', (e: any) => {
      if (e.target.id) {
        socket?.emit('shape:delete', e.target.id);
      }
    });

    return () => {
      canvas.dispose();
      socket?.off('shape:create');
      socket?.off('shape:update');
      socket?.off('shape:delete');
      socket?.off('board:clear');
    };
  }, [socket]);

  const addRect = () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2,
      width: 100,
      height: 100,
    });
    fabricCanvas.current?.add(rect);
    setActiveTool('select');
  };

  const addCircle = () => {
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: 'transparent',
      stroke: '#10b981',
      strokeWidth: 2,
      radius: 50,
    });
    fabricCanvas.current?.add(circle);
    setActiveTool('select');
  };

  const addText = () => {
    const text = new fabric.IText('Type something...', {
      left: 200,
      top: 200,
      fontSize: 20,
      fill: '#f8fafc',
    });
    fabricCanvas.current?.add(text);
    setActiveTool('select');
  };

  const addSticky = () => {
    const group = new fabric.Group([
      new fabric.Rect({
        width: 150,
        height: 150,
        fill: '#fef08a',
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetX: 5, offsetY: 5 })
      }),
      new fabric.IText('New Note', {
        fontSize: 16,
        left: 10,
        top: 10,
        width: 130
      })
    ], {
      left: 250,
      top: 250
    });
    fabricCanvas.current?.add(group);
    setActiveTool('select');
  };

  const deleteSelected = () => {
    const activeObjects = fabricCanvas.current?.getActiveObjects();
    if (activeObjects) {
      activeObjects.forEach((obj: any) => {
        fabricCanvas.current?.remove(obj);
      });
      fabricCanvas.current?.discardActiveObject();
      fabricCanvas.current?.renderAll();
    }
  };

  const clearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire whiteboard?')) {
      fabricCanvas.current?.clear();
      fabricCanvas.current!.backgroundColor = '#0f172a';
      fabricCanvas.current?.renderAll();
      socket?.emit('board:clear');
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-bold text-slate-200">Live Whiteboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomOut size={18}/></button>
          <span className="text-xs text-slate-500 font-mono">100%</span>
          <button className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomIn size={18}/></button>
          <div className="w-px h-6 bg-slate-800 mx-2" />
          <button className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Toolbar */}
        <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-4 z-10">
          {[
            { id: 'select', icon: MousePointer2, action: () => fabricCanvas.current!.isDrawingMode = false },
            { id: 'rect', icon: Square, action: addRect },
            { id: 'circle', icon: Circle, action: addCircle },
            { id: 'text', icon: Type, action: addText },
            { id: 'sticky', icon: StickyNote, action: addSticky },
            { id: 'draw', icon: Move, action: () => {
              fabricCanvas.current!.isDrawingMode = true;
              if (fabricCanvas.current!.freeDrawingBrush) {
                fabricCanvas.current!.freeDrawingBrush.color = '#3b82f6';
                fabricCanvas.current!.freeDrawingBrush.width = 4;
              }
            }},
            { id: 'eraser', icon: Eraser, action: deleteSelected },
            { id: 'clear', icon: Trash2, action: clearCanvas, danger: true },
          ].map((tool: any) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id);
                tool.action();
              }}
              className={`p-3 rounded-xl transition-all ${
                activeTool === tool.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                  : tool.danger 
                    ? 'text-rose-500 hover:bg-rose-500/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden bg-slate-950 flex items-center justify-center p-4">
          <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-800">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
