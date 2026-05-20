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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all tasks
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tasks = yield prisma.task.findMany({
            include: {
                createdBy: {
                    select: { id: true, username: true, avatarColor: true }
                },
                assignedTo: {
                    select: { id: true, username: true, avatarColor: true }
                },
                subtasks: true
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
}));
// Replace/Add Subtasks
router.post('/:id/subtasks', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { subtasks } = req.body; // Array of strings (titles)
    try {
        // Delete existing subtasks
        yield prisma.subtask.deleteMany({ where: { taskId: id } });
        // Add new subtasks
        if (subtasks && subtasks.length > 0) {
            yield prisma.subtask.createMany({
                data: subtasks.map((title) => ({
                    title,
                    taskId: id
                }))
            });
        }
        // Fetch updated task
        const task = yield prisma.task.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, username: true, avatarColor: true } },
                assignedTo: { select: { id: true, username: true, avatarColor: true } },
                subtasks: true
            }
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update subtasks' });
    }
}));
// Toggle Subtask Completion
router.patch('/subtasks/:subtaskId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subtaskId = req.params.subtaskId;
    const { completed } = req.body;
    try {
        const subtask = yield prisma.subtask.update({
            where: { id: subtaskId },
            data: { completed }
        });
        res.json(subtask);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update subtask' });
    }
}));
// Get operations feed
router.get('/operations', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const operations = yield prisma.operation.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(operations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch operations' });
    }
}));
exports.default = router;
