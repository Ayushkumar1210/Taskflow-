import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { initSocket, disconnectSocket } from '../lib/socket';
import api from '../lib/api';
import Board from '../components/Board';
import Sidebar from '../components/Sidebar';
import DashboardLayout from '../components/DashboardLayout';
import AlarmManager from '../components/AlarmManager';

const Dashboard = () => {
  const { token, setTasks, setOperations, setOnlineUsers, addOperation, addTask, updateTask, deleteTask } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [tasksRes, opsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/tasks/operations')
        ]);
        setTasks(tasksRes.data);
        setOperations(opsRes.data);
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };

    fetchInitialData();

    const socket = initSocket(token);

    socket.on('user:presence', (users) => {
      setOnlineUsers(users);
    });

    socket.on('task:created', (task) => {
      addTask(task);
    });

    socket.on('task:updated', (task) => {
      updateTask(task);
    });

    socket.on('task:moved', (task) => {
      updateTask(task);
    });

    socket.on('task:deleted', (id) => {
      deleteTask(id);
    });

    socket.on('operation:add', (op) => {
      addOperation(op);
    });

    return () => {
      socket.off('user:presence');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:moved');
      socket.off('task:deleted');
      socket.off('operation:add');
      disconnectSocket();
    };
  }, [token, navigate, setTasks, setOperations, setOnlineUsers, addOperation, addTask, updateTask, deleteTask]);

  return (
    <div className="h-screen flex overflow-hidden bg-[#030712] font-sans">
      <Sidebar />
      <DashboardLayout>
        <Board />
      </DashboardLayout>
      <AlarmManager />
    </div>
  );
};

export default Dashboard;
