import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
  calculateMonthlyCost,
  calculateAnnualCost,
  roundCurrency,
  isPaymentUpcoming
} from '../utils/calculations.js';
import { generateSavingsRecommendations } from '../utils/recommendations.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Fetch all user's subscriptions
    const allSubs = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextBillingDate: 'asc' }
    });

    const activeSubs = allSubs.filter((s) => s.status.toUpperCase() === 'ACTIVE');

    // Primary currency (from active subscriptions or user default)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true }
    });
    const defaultCurrency = user?.preferredCurrency || 'USD';

    // 1. Calculate Monthly and Annual Recurring Costs (only Active subscriptions)
    let totalMonthlyRecurring = 0;
    let totalAnnualRecurring = 0;

    for (const sub of activeSubs) {
      totalMonthlyRecurring += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      totalAnnualRecurring += calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
    }
    totalMonthlyRecurring = roundCurrency(totalMonthlyRecurring);
    totalAnnualRecurring = roundCurrency(totalAnnualRecurring);

    // 2. Upcoming Payments in next 30 days
    const upcomingList = activeSubs
      .filter((s) => isPaymentUpcoming(s.nextBillingDate, 30))
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

    let upcomingTotalAmount = 0;
    for (const sub of upcomingList) {
      upcomingTotalAmount += sub.costAmount;
    }
    upcomingTotalAmount = roundCurrency(upcomingTotalAmount);

    // 3. Category Breakdown
    const categoryTotals: Record<string, { count: number; monthly: number }> = {};
    for (const sub of activeSubs) {
      const cat = sub.category || 'General';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { count: 0, monthly: 0 };
      }
      categoryTotals[cat].count += 1;
      categoryTotals[cat].monthly += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
    }

    const categoryBreakdown = Object.entries(categoryTotals).map(([name, data]) => ({
      category: name,
      count: data.count,
      monthlyCost: roundCurrency(data.monthly)
    })).sort((a, b) => b.monthlyCost - a.monthlyCost);

    // 4. Monthly Spending Timeline / Projection (next 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyProjection: { month: string; year: number; projectedCost: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();

      // For every active subscription, check how much falls into this month
      let projectedInMonth = 0;
      for (const sub of activeSubs) {
        const freq = sub.billingFrequency.toUpperCase();
        if (freq === 'MONTHLY') {
          projectedInMonth += sub.costAmount;
        } else if (freq === 'WEEKLY') {
          projectedInMonth += (sub.costAmount * 52) / 12;
        } else if (freq === 'QUARTERLY') {
          // If renewal aligns or average normalized
          projectedInMonth += sub.costAmount / 3;
        } else if (freq === 'HALF_YEARLY') {
          projectedInMonth += sub.costAmount / 6;
        } else if (freq === 'YEARLY') {
          projectedInMonth += sub.costAmount / 12;
        }
      }

      monthlyProjection.push({
        month: `${mName} ${year}`,
        year,
        projectedCost: roundCurrency(projectedInMonth)
      });
    }

    // 5. Run Savings Recommendations Engine
    const generatedRecs = generateSavingsRecommendations(allSubs);
    let totalPotentialMonthlySavings = 0;
    for (const rec of generatedRecs) {
      totalPotentialMonthlySavings += rec.estimatedMonthlySavings;
    }
    totalPotentialMonthlySavings = roundCurrency(totalPotentialMonthlySavings);

    // 6. Recently Added Subscriptions
    const recentlyAdded = [...allSubs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // 7. Subscriptions Flagged for Review (Unused or Low usage with high cost)
    const flaggedForReview = allSubs.filter((s) => {
      const isUnused = s.usageAssessment.toUpperCase() === 'UNUSED';
      const isLowHighCost = s.usageAssessment.toUpperCase() === 'LOW' && calculateMonthlyCost(s.costAmount, s.billingFrequency) >= 30;
      return s.status.toUpperCase() === 'ACTIVE' && (isUnused || isLowHighCost);
    });

    res.json({
      summary: {
        totalSubscriptions: allSubs.length,
        activeSubscriptionsCount: activeSubs.length,
        totalMonthlyRecurring,
        totalAnnualRecurring,
        upcomingPaymentsCount: upcomingList.length,
        upcomingTotalAmount,
        potentialSavingsCount: generatedRecs.length,
        totalPotentialMonthlySavings,
        totalPotentialAnnualSavings: roundCurrency(totalPotentialMonthlySavings * 12),
        currency: defaultCurrency
      },
      categoryBreakdown,
      monthlyProjection,
      upcomingBillingTimeline: upcomingList.slice(0, 7),
      recentlyAdded,
      flaggedForReview,
      recommendationHighlights: generatedRecs.slice(0, 3)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
