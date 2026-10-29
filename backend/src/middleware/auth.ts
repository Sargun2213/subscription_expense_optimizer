import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-for-subscription-expense-optimizer-2026';

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please log in.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid session or user account no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token expired or invalid. Please log in again.' });
  }
}
