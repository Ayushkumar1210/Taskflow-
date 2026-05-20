import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket) return socket;
  const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const socketURL = apiURL.replace(/\/api\/?$/, '');
  socket = io(socketURL, {
    auth: { token }
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
