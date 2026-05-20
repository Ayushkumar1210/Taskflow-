import { create } from 'zustand';

export type User = {
  id: string;
  username: string;
  email: string;
  avatarColor: string;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  startTime?: string | null;
  alarmEnabled?: boolean;
  createdById: string;
  createdBy: User;
  assignedToId: string | null;
  assignedTo: User | null;
  subtasks: Subtask[];
};

export type Operation = {
  id: string;
  userId: string;
  username: string;
  action: string;
  taskTitle: string;
  timestamp: string;
};

interface StoreState {
  user: User | null;
  token: string | null;
  tasks: Task[];
  operations: Operation[];
  onlineUsers: User[];
  setUser: (user: User | null, token: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  setOperations: (ops: Operation[]) => void;
  addOperation: (op: Operation) => void;
  setOnlineUsers: (users: User[]) => void;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useStore = create<StoreState>((set) => ({
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    document.documentElement.classList.toggle('light', newTheme === 'light');
    return { theme: newTheme };
  }),
  user: (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  })(),
  token: (() => {
    const t = localStorage.getItem('token');
    return t && t !== 'undefined' ? t : null;
  })(),

  tasks: [],
  operations: [],
  onlineUsers: [],
  
  setUser: (user, token) => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user, token });
  },
  
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  setOperations: (operations) => set({ operations }),
  addOperation: (op) => set((state) => ({
    operations: [op, ...state.operations].slice(0, 50)
  })),
  
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, tasks: [], operations: [], onlineUsers: [] });
  }
}));
