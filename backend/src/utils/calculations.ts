export type BillingFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';

export interface SubscriptionCostInput {
  costAmount: number;
  billingFrequency: BillingFrequency | string;
  status?: string;
}

/**
 * Rounds a monetary number to 2 decimal places consistently.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates estimated monthly cost based on recurring amount and billing frequency.
 *
 * Rules:
 * - WEEKLY: C × 52 ÷ 12
 * - MONTHLY: C
 * - QUARTERLY: C ÷ 3
 * - HALF_YEARLY: C ÷ 6
 * - YEARLY: C ÷ 12
 * Cancelled subscriptions are normalized to 0.
 */
export function calculateMonthlyCost(costAmount: number, frequency: string, status?: string): number {
  if (status && (status.toUpperCase() === 'CANCELLED' || status.toUpperCase() === 'CANCELED')) {
    return 0;
  }

  const normFreq = frequency.toUpperCase();
  let monthly = 0;

  switch (normFreq) {
    case 'WEEKLY':
      monthly = (costAmount * 52) / 12;
      break;
    case 'MONTHLY':
      monthly = costAmount;
      break;
    case 'QUARTERLY':
      monthly = costAmount / 3;
      break;
    case 'HALF_YEARLY':
      monthly = costAmount / 6;
      break;
    case 'YEARLY':
      monthly = costAmount / 12;
      break;
    default:
      monthly = costAmount;
      break;
  }

  return roundCurrency(monthly);
}

/**
 * Calculates estimated annual cost based on recurring amount and billing frequency.
 *
 * Rules:
 * - WEEKLY: C × 52
 * - MONTHLY: C × 12
 * - QUARTERLY: C × 4
 * - HALF_YEARLY: C × 2
 * - YEARLY: C
 * Cancelled subscriptions are normalized to 0.
 */
export function calculateAnnualCost(costAmount: number, frequency: string, status?: string): number {
  if (status && (status.toUpperCase() === 'CANCELLED' || status.toUpperCase() === 'CANCELED')) {
    return 0;
  }

  const normFreq = frequency.toUpperCase();
  let annual = 0;

  switch (normFreq) {
    case 'WEEKLY':
      annual = costAmount * 52;
      break;
    case 'MONTHLY':
      annual = costAmount * 12;
      break;
    case 'QUARTERLY':
      annual = costAmount * 4;
      break;
    case 'HALF_YEARLY':
      annual = costAmount * 2;
      break;
    case 'YEARLY':
      annual = costAmount;
      break;
    default:
      annual = costAmount * 12;
      break;
  }

  return roundCurrency(annual);
}

/**
 * Calculates next renewal date from the current date or billing start date according to recurrence rule.
 */
export function calculateNextRenewalDate(currentNextDate: Date, frequency: string): Date {
  const next = new Date(currentNextDate);
  const normFreq = frequency.toUpperCase();

  switch (normFreq) {
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'HALF_YEARLY':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Checks if a subscription payment is upcoming within N days (default 30 days).
 */
export function isPaymentUpcoming(nextBillingDate: Date | string, daysAhead: number = 30): boolean {
  const targetDate = new Date(nextBillingDate);
  const now = new Date();
  // Reset hours to compare calendar days cleanly
  now.setHours(0, 0, 0, 0);
  const futureLimit = new Date(now);
  futureLimit.setDate(futureLimit.getDate() + daysAhead);

  return targetDate >= now && targetDate <= futureLimit;
}
