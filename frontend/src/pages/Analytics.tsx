import React from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, Users as UsersIcon, ArrowLeft, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Analytics: React.FC = () => {
  const { tasks, onlineUsers } = useStore();
  const navigate = useNavigate();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'Todo').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;

  const statusData = [
    { name: 'Todo', value: todoTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { name: 'Review', value: reviewTasks, color: '#a855f7' },
    { name: 'Done', value: completedTasks, color: '#10b981' },
  ];

  const userTasks = tasks.reduce((acc: any, task) => {
    const username = task.assignedTo?.username || 'Unassigned';
    acc[username] = (acc[username] || 0) + 1;
    return acc;
  }, {});

  const workloadData = Object.entries(userTasks).map(([name, value]) => ({ name, value }));

  // Mock velocity data
  const velocityData = [
    { day: 'Mon', completed: 4, created: 6 },
    { day: 'Tue', completed: 7, created: 5 },
    { day: 'Wed', completed: 5, created: 8 },
    { day: 'Thu', completed: 12, created: 10 },
    { day: 'Fri', completed: 8, created: 4 },
    { day: 'Sat', completed: 3, created: 2 },
    { day: 'Sun', completed: 2, created: 1 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-400 text-sm">Real-time productivity insights for your team</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-800 transition-all">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Completed', value: completedTasks, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Active Users', value: onlineUsers.length, icon: UsersIcon, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Completion Rate', value: `${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((kpi, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${kpi.bg} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
            <div className="relative flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{kpi.label}</p>
                <h3 className="text-3xl font-bold mt-1">{kpi.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Velocity */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            Task Velocity
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                <Area type="monotone" dataKey="created" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle size={20} className="text-indigo-400" />
            Task Distribution
          </h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                <span className="text-xs text-slate-200 ml-auto font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <UsersIcon size={20} className="text-indigo-400" />
            Team Workload
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={32}>
                  {workloadData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
