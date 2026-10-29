import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { calculateMonthlyCost, calculateAnnualCost } from '../utils/calculations.js';

const router = Router();
router.use(authenticateToken);

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  preferredCurrency: z.string().min(3).max(4).optional(),
  timezone: z.string().max(50).optional()
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  renewalAlertDays: z.number().int().min(1).max(30).optional(),
  weeklyDigest: z.boolean().optional(),
  theme: z.enum(['light', 'dark']).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

const deleteAccountSchema = z.object({
  confirmPassword: z.string().min(1, 'Password confirmation is required')
});

// GET /api/settings/profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

// PUT /api/settings/profile
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validated = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: {
        id: true,
        email: true,
        name: true,
        preferredCurrency: true,
        timezone: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/preferences
router.put('/preferences', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validated = updatePreferencesSchema.parse(req.body);

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated
      }
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences: updated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/change-password
router.put('/change-password', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Current password does not match.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/settings/export-csv - Export user subscriptions as CSV
router.get('/export-csv', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV string
    const headers = [
      'ID',
      'Name',
      'Category',
      'Cost Amount',
      'Currency',
      'Billing Frequency',
      'Normalized Monthly Cost',
      'Normalized Annual Cost',
      'Billing Start Date',
      'Next Billing Date',
      'Status',
      'Payment Method',
      'Usage Assessment',
      'Notes'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = subscriptions.map((sub) => {
      const mCost = calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      const aCost = calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
      return [
        sub.id,
        sub.name,
        sub.category,
        sub.costAmount.toFixed(2),
        sub.currency,
        sub.billingFrequency,
        mCost.toFixed(2),
        aCost.toFixed(2),
        new Date(sub.billingStartDate).toISOString().split('T')[0],
        new Date(sub.nextBillingDate).toISOString().split('T')[0],
        sub.status,
        sub.paymentMethod || '',
        sub.usageAssessment,
        sub.notes || ''
      ].map(escapeCsv).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="subscriptions_export_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/settings/account - Delete user account and all cascading data
router.delete('/account', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { confirmPassword } = deleteAccountSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(confirmPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Incorrect password. Account deletion cancelled.' });
      return;
    }

    // Cascade delete user and all associated records (subscriptions, recommendations, preferences, scenarios)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Account and all associated records have been permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
