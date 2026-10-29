import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyCost,
  calculateAnnualCost,
  roundCurrency,
  calculateNextRenewalDate,
  isPaymentUpcoming
} from '../utils/calculations.js';

describe('Financial Calculations Module', () => {
  it('correctly rounds numbers to 2 decimal places', () => {
    expect(roundCurrency(14.994)).toBe(14.99);
    expect(roundCurrency(14.995)).toBe(15.00);
    expect(roundCurrency(10)).toBe(10);
  });

  describe('calculateMonthlyCost', () => {
    it('calculates weekly frequency: C * 52 / 12', () => {
      // 10 * 52 / 12 = 43.3333333333... -> 43.33
      expect(calculateMonthlyCost(10, 'WEEKLY')).toBe(43.33);
      // 4 * 52 / 12 = 17.33333... -> 17.33
      expect(calculateMonthlyCost(4, 'WEEKLY')).toBe(17.33);
    });

    it('calculates monthly frequency: C', () => {
      expect(calculateMonthlyCost(29.99, 'MONTHLY')).toBe(29.99);
    });

    it('calculates quarterly frequency: C / 3', () => {
      // 90 / 3 = 30.00
      expect(calculateMonthlyCost(90, 'QUARTERLY')).toBe(30.00);
      // 100 / 3 = 33.3333... -> 33.33
      expect(calculateMonthlyCost(100, 'QUARTERLY')).toBe(33.33);
    });

    it('calculates half-yearly frequency: C / 6', () => {
      expect(calculateMonthlyCost(60, 'HALF_YEARLY')).toBe(10.00);
    });

    it('calculates yearly frequency: C / 12', () => {
      expect(calculateMonthlyCost(120, 'YEARLY')).toBe(10.00);
      expect(calculateMonthlyCost(119.88, 'YEARLY')).toBe(9.99);
    });

    it('returns 0 for cancelled subscriptions', () => {
      expect(calculateMonthlyCost(100, 'MONTHLY', 'CANCELLED')).toBe(0);
      expect(calculateMonthlyCost(100, 'MONTHLY', 'CANCELED')).toBe(0);
    });
  });

  describe('calculateAnnualCost', () => {
    it('calculates weekly: C * 52', () => {
      expect(calculateAnnualCost(10, 'WEEKLY')).toBe(520.00);
    });

    it('calculates monthly: C * 12', () => {
      expect(calculateAnnualCost(20, 'MONTHLY')).toBe(240.00);
    });

    it('calculates quarterly: C * 4', () => {
      expect(calculateAnnualCost(75, 'QUARTERLY')).toBe(300.00);
    });

    it('calculates half-yearly: C * 2', () => {
      expect(calculateAnnualCost(150, 'HALF_YEARLY')).toBe(300.00);
    });

    it('calculates yearly: C', () => {
      expect(calculateAnnualCost(299, 'YEARLY')).toBe(299.00);
    });

    it('returns 0 for cancelled subscriptions', () => {
      expect(calculateAnnualCost(299, 'YEARLY', 'CANCELLED')).toBe(0);
    });
  });

  describe('calculateNextRenewalDate', () => {
    it('increments by 7 days for weekly frequency', () => {
      const start = new Date('2026-01-01');
      const next = calculateNextRenewalDate(start, 'WEEKLY');
      expect(next.getDate()).toBe(8);
    });

    it('increments by 1 month for monthly frequency', () => {
      const start = new Date('2026-01-15');
      const next = calculateNextRenewalDate(start, 'MONTHLY');
      expect(next.getMonth()).toBe(1); // February (0-indexed)
    });

    it('increments by 1 year for yearly frequency', () => {
      const start = new Date('2026-05-10');
      const next = calculateNextRenewalDate(start, 'YEARLY');
      expect(next.getFullYear()).toBe(2027);
    });
  });

  describe('isPaymentUpcoming', () => {
    it('returns true when next billing is within the window', () => {
      const upcoming = new Date();
      upcoming.setDate(upcoming.getDate() + 5);
      expect(isPaymentUpcoming(upcoming, 30)).toBe(true);
    });

    it('returns false when next billing is beyond the window', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 60);
      expect(isPaymentUpcoming(farFuture, 30)).toBe(false);
    });
  });
});
