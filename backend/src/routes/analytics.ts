import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
  calculateMonthlyCost,
  calculateAnnualCost,
  roundCurrency,
  isPaymentUpcoming
} from '../utils/calculations.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextBillingDate: 'asc' }
    });

    // Group by currency to avoid cross-currency summation issues
    const currencies = Array.from(new Set(subscriptions.map((s) => s.currency)));
    const targetCurrency = (req.query.currency as string) || (currencies[0] || 'USD');

    // Filter by currency if multi-currency exists
    const currencySubs = subscriptions.filter((s) => s.currency === targetCurrency);
    const activeSubs = currencySubs.filter((s) => s.status.toUpperCase() === 'ACTIVE');

    // 1. Overall Monthly & Annual Summaries
    let totalMonthly = 0;
    let totalAnnual = 0;

    for (const sub of activeSubs) {
      totalMonthly += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      totalAnnual += calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
    }

    // 2. Spending by Category
    const categoryAgg: Record<string, { count: number; monthly: number; annual: number }> = {};
    for (const sub of activeSubs) {
      const cat = sub.category || 'General';
      if (!categoryAgg[cat]) {
        categoryAgg[cat] = { count: 0, monthly: 0, annual: 0 };
      }
      categoryAgg[cat].count += 1;
      categoryAgg[cat].monthly += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      categoryAgg[cat].annual += calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status);
    }

    const spendingByCategory = Object.entries(categoryAgg).map(([category, vals]) => ({
      category,
      count: vals.count,
      monthlyCost: roundCurrency(vals.monthly),
      annualCost: roundCurrency(vals.annual),
      percentageOfTotal: totalMonthly > 0 ? roundCurrency((vals.monthly / totalMonthly) * 100) : 0
    })).sort((a, b) => b.monthlyCost - a.monthlyCost);

    // 3. Billing Frequency Distribution
    const frequencyCounts: Record<string, { count: number; totalMonthly: number }> = {
      WEEKLY: { count: 0, totalMonthly: 0 },
      MONTHLY: { count: 0, totalMonthly: 0 },
      QUARTERLY: { count: 0, totalMonthly: 0 },
      HALF_YEARLY: { count: 0, totalMonthly: 0 },
      YEARLY: { count: 0, totalMonthly: 0 }
    };

    for (const sub of activeSubs) {
      const freq = sub.billingFrequency.toUpperCase();
      if (!frequencyCounts[freq]) {
        frequencyCounts[freq] = { count: 0, totalMonthly: 0 };
      }
      frequencyCounts[freq].count += 1;
      frequencyCounts[freq].totalMonthly += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
    }

    const frequencyDistribution = Object.entries(frequencyCounts)
      .filter(([_, data]) => data.count > 0)
      .map(([frequency, data]) => ({
        frequency,
        count: data.count,
        normalizedMonthlyTotal: roundCurrency(data.totalMonthly)
      }));

    // 4. Most Expensive Subscriptions (Normalized Monthly Cost)
    const mostExpensive = [...activeSubs]
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        category: sub.category,
        costAmount: sub.costAmount,
        currency: sub.currency,
        billingFrequency: sub.billingFrequency,
        monthlyNormalized: calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status),
        annualNormalized: calculateAnnualCost(sub.costAmount, sub.billingFrequency, sub.status),
        usageAssessment: sub.usageAssessment
      }))
      .sort((a, b) => b.monthlyNormalized - a.monthlyNormalized)
      .slice(0, 8);

    // 5. Subscription Status Breakdown
    const statusCounts: Record<string, number> = {
      ACTIVE: 0,
      PAUSED: 0,
      PENDING_CANCELLATION: 0,
      CANCELLED: 0
    };

    for (const sub of currencySubs) {
      const st = sub.status.toUpperCase();
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    // 6. Upcoming Renewal Totals (7, 14, 30, 60 days)
    const upcoming7 = activeSubs.filter((s) => isPaymentUpcoming(s.nextBillingDate, 7));
    const upcoming14 = activeSubs.filter((s) => isPaymentUpcoming(s.nextBillingDate, 14));
    const upcoming30 = activeSubs.filter((s) => isPaymentUpcoming(s.nextBillingDate, 30));
    const upcoming60 = activeSubs.filter((s) => isPaymentUpcoming(s.nextBillingDate, 60));

    const sumCost = (list: typeof activeSubs) => roundCurrency(list.reduce((acc, curr) => acc + curr.costAmount, 0));

    const upcomingRenewals = {
      next7Days: { count: upcoming7.length, totalAmount: sumCost(upcoming7) },
      next14Days: { count: upcoming14.length, totalAmount: sumCost(upcoming14) },
      next30Days: { count: upcoming30.length, totalAmount: sumCost(upcoming30) },
      next60Days: { count: upcoming60.length, totalAmount: sumCost(upcoming60) }
    };

    // 7. Monthly Trends (12 months projection)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyTrends = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;

      let projected = 0;
      for (const sub of activeSubs) {
        projected += calculateMonthlyCost(sub.costAmount, sub.billingFrequency, sub.status);
      }

      monthlyTrends.push({
        month: label,
        year: d.getFullYear(),
        cost: roundCurrency(projected)
      });
    }

    // 8. Fetch user's saved scenarios
    const savedScenarios = await prisma.savingsScenario.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      currency: targetCurrency,
      availableCurrencies: currencies.length > 0 ? currencies : ['USD'],
      summary: {
        totalSubscriptionsCount: currencySubs.length,
        activeCount: activeSubs.length,
        totalMonthlyRecurring: roundCurrency(totalMonthly),
        totalAnnualRecurring: roundCurrency(totalAnnual)
      },
      spendingByCategory,
      frequencyDistribution,
      mostExpensive,
      statusBreakdown,
      upcomingRenewals,
      monthlyTrends,
      savedScenarios
    });
  } catch (err) {
    next(err);
  }
});

export default router;
