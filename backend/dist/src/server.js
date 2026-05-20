"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const ai_1 = __importDefault(require("./routes/ai"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/ai', ai_1.default);
// Socket.io middleware for auth
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return next(new Error('Authentication error'));
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
    const broadcastOperation = (action, taskTitle) => __awaiter(void 0, void 0, void 0, function* () {
        const operation = yield prisma.operation.create({
            data: {
                userId: user.id,
                username: user.username,
                action,
                taskTitle
            }
        });
        io.emit('operation:add', operation);
    });
    socket.on('task:create', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { title, description, status, startTime, alarmEnabled } = data;
        try {
            const task = yield prisma.task.create({
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
        }
        catch (e) {
            console.error(e);
        }
    }));
    socket.on('task:update', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, title, description, assignedToId, startTime, alarmEnabled } = data;
        try {
            const task = yield prisma.task.update({
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
        }
        catch (e) {
            console.error(e);
        }
    }));
    socket.on('task:move', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, status } = data;
        try {
            const task = yield prisma.task.update({
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
        }
        catch (e) {
            console.error(e);
        }
    }));
    socket.on('task:delete', (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const task = yield prisma.task.delete({ where: { id } });
            io.emit('task:deleted', id);
            broadcastOperation('deleted', task.title);
        }
        catch (e) {
            console.error(e);
        }
    }));
    // Chat events
    socket.on('message:send', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const message = yield prisma.chatMessage.create({
                data: {
                    text: data.text,
                    userId: user.id
                },
                include: {
                    user: { select: { id: true, username: true, avatarColor: true } }
                }
            });
            io.emit('message:receive', message);
        }
        catch (e) {
            console.error(e);
        }
    }));
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
