import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscriptions.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import optimizerRoutes from './routes/optimizer.js';
import settingsRoutes from './routes/settings.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

export const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, configurable in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// General Rate Limiting
app.use('/api', apiRateLimiter);

// Route Declarations
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/optimizer', optimizerRoutes);
app.use('/api/settings', settingsRoutes);

// Direct Project Archive Download Route
app.get('/download/subscription-expense-optimizer.zip', (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'subscription-expense-optimizer.zip');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'subscription-expense-optimizer.zip');
  } else {
    res.status(404).json({ error: 'Project archive not present on server.' });
  }
});

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling
app.use(errorHandler);
