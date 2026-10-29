import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-for-subscription-expense-optimizer-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100).trim(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  preferredCurrency: z.string().min(3).max(4).default('USD')
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

// Register
router.post('/register', authRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        preferredCurrency: validated.preferredCurrency,
        preferences: {
          create: {
            emailNotifications: true,
            renewalAlertDays: 3,
            weeklyDigest: false,
            theme: 'light'
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        preferredCurrency: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', authRateLimiter, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferredCurrency: user.preferredCurrency
      }
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req: Request, res: Response): void => {
  res.json({ message: 'Logout successful' });
});

// Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
        preferences: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
