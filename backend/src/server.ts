import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import aiRoutes from './routes/ai';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io middleware for auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return next(new Error('Authentication error'));
    socket.data.user = decoded;
    next();
  });
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  const user = socket.data.user;
  
  connectedUsers.set(user.id, {
    id: user.id,
    username: user.username,
    avatarColor: user.avatarColor,
    socketId: socket.id
  });

  io.emit('user:presence', Array.from(connectedUsers.values()));

  const broadcastOperation = async (action: string, taskTitle: string) => {
    const operation = await prisma.operation.create({
      data: {
        userId: user.id,
        username: user.username,
        action,
        taskTitle
      }
    });
    io.emit('operation:add', operation);
  };

  socket.on('task:create', async (data) => {
    const { title, description, status, startTime, alarmEnabled } = data;
    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'Todo',
          startTime: startTime ? new Date(startTime) : null,
          alarmEnabled: alarmEnabled || false,
          createdById: user.id
        },
        include: {
          createdBy: { select: { id: true, username: true, avatarColor: true } },
          assignedTo: { select: { id: true, username: true, avatarColor: true } },
          subtasks: true
        }
      });
      io.emit('task:created', task);
      broadcastOperation('created', task.title);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('task:update', async (data) => {
    const { id, title, description, assignedToId, startTime, alarmEnabled } = data;
    try {
      const task = await prisma.task.update({
        where: { id },
        data: { 
          title, 
          description, 
          assignedToId,
          startTime: startTime !== undefined ? (startTime ? new Date(startTime) : null) : undefined,
          alarmEnabled: alarmEnabled !== undefined ? alarmEnabled : undefined
        },
        include: {
          createdBy: { select: { id: true, username: true, avatarColor: true } },
          assignedTo: { select: { id: true, username: true, avatarColor: true } },
          subtasks: true
        }
      });
      io.emit('task:updated', task);
      broadcastOperation('updated', task.title);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('task:move', async (data) => {
    const { id, status } = data;
    try {
      const task = await prisma.task.update({
        where: { id },
        data: { status },
        include: {
          createdBy: { select: { id: true, username: true, avatarColor: true } },
          assignedTo: { select: { id: true, username: true, avatarColor: true } },
          subtasks: true
        }
      });
      io.emit('task:moved', task);
      broadcastOperation(`moved to ${status}`, task.title);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('task:delete', async (id) => {
    try {
      const task = await prisma.task.delete({ where: { id } });
      io.emit('task:deleted', id);
      broadcastOperation('deleted', task.title);
    } catch (e) {
      console.error(e);
    }
  });

  // Chat events
  socket.on('message:send', async (data) => {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          text: data.text,
          userId: user.id
        },
        include: {
          user: { select: { id: true, username: true, avatarColor: true } }
        }
      });
      io.emit('message:receive', message);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('typing:start', () => {
    socket.broadcast.emit('typing:start', { userId: user.id, username: user.username });
  });

  socket.on('typing:stop', () => {
    socket.broadcast.emit('typing:stop', { userId: user.id });
  });

  // Whiteboard events
  socket.on('shape:create', (shape) => {
    socket.broadcast.emit('shape:create', shape);
  });

  socket.on('shape:update', (shape) => {
    socket.broadcast.emit('shape:update', shape);
  });

  socket.on('shape:delete', (shapeId) => {
    socket.broadcast.emit('shape:delete', shapeId);
  });

  socket.on('board:clear', () => {
    socket.broadcast.emit('board:clear');
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(user.id);
    io.emit('user:presence', Array.from(connectedUsers.values()));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
