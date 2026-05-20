import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatarColor
      }
    });

    const token = jwt.sign({ id: user.id, username: user.username, avatarColor: user.avatarColor }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatarColor } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.username, avatarColor: user.avatarColor }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, avatarColor: user.avatarColor } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
