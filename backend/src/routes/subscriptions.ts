import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { calculateMonthlyCost, calculateAnnualCost, calculateNextRenewalDate } from '../utils/calculations.js';

const router = Router();
router.use(authenticateToken);

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Subscription name is required').max(100).trim(),
  category: z.string().min(1, 'Category is required').max(50).trim(),
  costAmount: z.number().positive('Cost amount must be greater than zero'),
  currency: z.string().min(3).max(4).default('USD'),
  billingFrequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']),
  billingStartDate: z.string().or(z.date()).transform((val) => new Date(val)),
  nextBillingDate: z.string().or(z.date()).optional().transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED', 'PENDING_CANCELLATION']).default('ACTIVE'),
  paymentMethod: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  usageAssessment: z.enum(['ACTIVE', 'MODERATE', 'LOW', 'UNUSED']).default('ACTIVE')
});

// List subscriptions for the authenticated user
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category, status, search, sortBy = 'nextBillingDate', order = 'asc' } = req.query;

    const whereClause: any = { userId };

    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = category;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClause.name = {
        contains: search.trim()
      };
    }

    const validSortFields = ['name', 'costAmount', 'nextBillingDate', 'createdAt', 'category'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'nextBillingDate';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      orderBy: {
        [sortField]: sortOrder
      }
    });

    // Decorate each item with calculated normalized monthly and annual costs
    const enriched = subscriptions.map((sub) => {
      const normalizedMonthly = calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      const normalizedAnnual = calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
      return {
        ...sub,
        normalizedMonthly,
        normalizedAnnual
      };
    });

    res.json({
      subscriptions: enriched,
      totalCount: enriched.length
    });
  } catch (err) {
    next(err);
  }
});

// Create subscription
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validated = subscriptionSchema.parse(req.body);

    // If nextBillingDate was not provided, calculate it from billingStartDate and frequency
    const nextDate = validated.nextBillingDate || calculateNextRenewalDate(validated.billingStartDate, validated.billingFrequency);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        name: validated.name,
        category: validated.category,
        costAmount: validated.costAmount,
        currency: validated.currency,
        billingFrequency: validated.billingFrequency,
        billingStartDate: validated.billingStartDate,
        nextBillingDate: nextDate,
        status: validated.status,
        paymentMethod: validated.paymentMethod || null,
        notes: validated.notes || null,
        usageAssessment: validated.usageAssessment
      }
    });

    const normalizedMonthly = calculateMonthlyCost(subscription.costAmount, subscription.billingFrequency, subscription.status);
    const normalizedAnnual = calculateAnnualCost(subscription.costAmount, subscription.billingFrequency, subscription.status);

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        ...subscription,
        normalizedMonthly,
        normalizedAnnual
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get single subscription
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId }
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found or access denied.' });
      return;
    }

    const normalizedMonthly = calculateMonthlyCost(subscription.costAmount, subscription.billingFrequency, subscription.status);
    const normalizedAnnual = calculateAnnualCost(subscription.costAmount, subscription.billingFrequency, subscription.status);

    res.json({
      subscription: {
        ...subscription,
        normalizedMonthly,
        normalizedAnnual
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update subscription
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.subscription.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Subscription not found or access denied.' });
      return;
    }

    const validated = subscriptionSchema.partial().parse(req.body);

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.category && { category: validated.category }),
        ...(validated.costAmount !== undefined && { costAmount: validated.costAmount }),
        ...(validated.currency && { currency: validated.currency }),
        ...(validated.billingFrequency && { billingFrequency: validated.billingFrequency }),
        ...(validated.billingStartDate && { billingStartDate: validated.billingStartDate }),
        ...(validated.nextBillingDate && { nextBillingDate: validated.nextBillingDate }),
        ...(validated.status && { status: validated.status }),
        ...(validated.paymentMethod !== undefined && { paymentMethod: validated.paymentMethod }),
        ...(validated.notes !== undefined && { notes: validated.notes }),
        ...(validated.usageAssessment && { usageAssessment: validated.usageAssessment })
      }
    });

    const normalizedMonthly = calculateMonthlyCost(updated.costAmount, updated.billingFrequency, updated.status);
    const normalizedAnnual = calculateAnnualCost(updated.costAmount, updated.billingFrequency, updated.status);

    res.json({
      message: 'Subscription updated successfully',
      subscription: {
        ...updated,
        normalizedMonthly,
        normalizedAnnual
      }
    });
  } catch (err) {
    next(err);
  }
});

// Delete subscription
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.subscription.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Subscription not found or access denied.' });
      return;
    }

    await prisma.subscription.delete({
      where: { id }
    });

    res.json({ message: 'Subscription deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
