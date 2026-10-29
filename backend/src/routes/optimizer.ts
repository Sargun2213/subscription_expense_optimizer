import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { generateSavingsRecommendations } from '../utils/recommendations.js';
import { calculateMonthlyCost, calculateAnnualCost, roundCurrency } from '../utils/calculations.js';

const router = Router();
router.use(authenticateToken);

const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required').max(100),
  description: z.string().max(250).optional(),
  selectedSubscriptionIds: z.array(z.string()).min(1, 'Select at least one subscription for the scenario')
});

// GET /api/optimizer/recommendations - Generate and sync recommendations
router.get('/recommendations', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch user's subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId }
    });

    // Run the rule-based recommendation engine
    const generated = generateSavingsRecommendations(subscriptions);

    // Sync recommendations into database so user review/dismiss status persists
    const existingDbRecs = await prisma.savingsRecommendation.findMany({
      where: { userId }
    });

    const existingMap = new Map(existingDbRecs.map((r) => [`${r.subscriptionId}-${r.type}`, r]));

    // Insert or keep existing status
    for (const rec of generated) {
      const key = `${rec.subscriptionId}-${rec.type}`;
      if (!existingMap.has(key)) {
        await prisma.savingsRecommendation.create({
          data: {
            userId,
            subscriptionId: rec.subscriptionId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
            suggestedAction: rec.suggestedAction,
            estimatedMonthlySavings: rec.estimatedMonthlySavings,
            estimatedAnnualSavings: rec.estimatedAnnualSavings,
            assumptions: rec.assumptions,
            isReviewed: false,
            isDismissed: false
          }
        });
      }
    }

    // Return active recommendations (not dismissed by user), with subscription details
    const activeRecommendations = await prisma.savingsRecommendation.findMany({
      where: {
        userId,
        isDismissed: false
      },
      include: {
        subscription: true
      },
      orderBy: { estimatedMonthlySavings: 'desc' }
    });

    // Compute aggregate potential savings
    let totalPotentialMonthlySavings = 0;
    for (const r of activeRecommendations) {
      totalPotentialMonthlySavings += r.estimatedMonthlySavings;
    }
    totalPotentialMonthlySavings = roundCurrency(totalPotentialMonthlySavings);

    // Current monthly spend
    const activeSubs = subscriptions.filter((s) => s.status.toUpperCase() === 'ACTIVE');
    const currentMonthlySpend = roundCurrency(
      activeSubs.reduce((acc, s) => acc + calculateMonthlyCost(s.costAmount, s.billingFrequency, s.status), 0)
    );

    res.json({
      recommendations: activeRecommendations,
      summary: {
        count: activeRecommendations.length,
        currentMonthlySpend,
        totalPotentialMonthlySavings,
        totalPotentialAnnualSavings: roundCurrency(totalPotentialMonthlySavings * 12),
        optimizedMonthlySpend: roundCurrency(Math.max(0, currentMonthlySpend - totalPotentialMonthlySavings))
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/optimizer/recommendations/:id/review - Mark recommendation as reviewed
router.post('/recommendations/:id/review', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.savingsRecommendation.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    const updated = await prisma.savingsRecommendation.update({
      where: { id },
      data: { isReviewed: !existing.isReviewed }
    });

    res.json({
      message: `Recommendation marked as ${updated.isReviewed ? 'reviewed' : 'unreviewed'}.`,
      recommendation: updated
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/optimizer/recommendations/:id/dismiss - Dismiss a recommendation
router.post('/recommendations/:id/dismiss', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.savingsRecommendation.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Recommendation not found' });
      return;
    }

    const updated = await prisma.savingsRecommendation.update({
      where: { id },
      data: { isDismissed: true }
    });

    res.json({
      message: 'Recommendation dismissed.',
      recommendation: updated
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/optimizer/scenarios - List saved savings scenarios
router.get('/scenarios', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const scenarios = await prisma.savingsScenario.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Parse selectedSubscriptionIds JSON and attach basic details
    const parsedScenarios = scenarios.map((sc) => {
      let ids: string[] = [];
      try {
        ids = JSON.parse(sc.selectedSubscriptionIds);
      } catch {
        ids = sc.selectedSubscriptionIds.split(',').filter(Boolean);
      }
      return {
        ...sc,
        subscriptionIds: ids
      };
    });

    res.json({ scenarios: parsedScenarios });
  } catch (err) {
    next(err);
  }
});

// POST /api/optimizer/scenarios - Create a savings scenario
router.post('/scenarios', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description, selectedSubscriptionIds } = scenarioSchema.parse(req.body);

    // Fetch targeted subscriptions to verify ownership and calculate actual savings
    const targetedSubs = await prisma.subscription.findMany({
      where: {
        userId,
        id: { in: selectedSubscriptionIds },
        status: { notIn: ['CANCELLED', 'CANCELED'] }
      }
    });

    let projectedMonthlySavings = 0;
    let projectedAnnualSavings = 0;

    for (const sub of targetedSubs) {
      projectedMonthlySavings += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      projectedAnnualSavings += calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
    }

    projectedMonthlySavings = roundCurrency(projectedMonthlySavings);
    projectedAnnualSavings = roundCurrency(projectedAnnualSavings);

    const scenario = await prisma.savingsScenario.create({
      data: {
        userId,
        name,
        description: description || null,
        selectedSubscriptionIds: JSON.stringify(selectedSubscriptionIds),
        projectedMonthlySavings,
        projectedAnnualSavings
      }
    });

    res.status(201).json({
      message: 'Savings scenario saved successfully',
      scenario: {
        ...scenario,
        subscriptionIds: selectedSubscriptionIds,
        targetedSubscriptionsCount: targetedSubs.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/optimizer/scenarios/:id - Delete a scenario
router.delete('/scenarios/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.savingsScenario.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      res.status(404).json({ error: 'Scenario not found' });
      return;
    }

    await prisma.savingsScenario.delete({
      where: { id }
    });

    res.json({ message: 'Scenario deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
