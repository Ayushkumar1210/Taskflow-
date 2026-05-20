import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Replace/Add Subtasks
router.post('/:id/subtasks', authenticateToken, async (req, res) => {
  const id = req.params.id as string;
  const { subtasks } = req.body; // Array of strings (titles)

  try {
    // Delete existing subtasks
    await prisma.subtask.deleteMany({ where: { taskId: id } });
    
    // Add new subtasks
    if (subtasks && subtasks.length > 0) {
      await prisma.subtask.createMany({
        data: subtasks.map((title: string) => ({
          title,
          taskId: id
        }))
      });
    }
    
    // Fetch updated task
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, avatarColor: true } },
        assignedTo: { select: { id: true, username: true, avatarColor: true } },
        subtasks: true
      }
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subtasks' });
  }
});

// Toggle Subtask Completion
router.patch('/subtasks/:subtaskId', authenticateToken, async (req, res) => {
  const subtaskId = req.params.subtaskId as string;
  const { completed } = req.body;

  try {
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { completed }
    });
    res.json(subtask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subtask' });
  }
});

// Get operations feed
router.get('/operations', authenticateToken, async (req, res) => {
  try {
    const operations = await prisma.operation.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch operations' });
  }
});

export default router;
