import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

export default router;
