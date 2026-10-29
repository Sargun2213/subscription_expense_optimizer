import { describe, it, expect } from 'vitest';
import { generateSavingsRecommendations, SubscriptionItem } from '../utils/recommendations.js';

describe('Savings Recommendation Engine', () => {
  it('generates an UNUSED_SERVICE recommendation for items tagged as UNUSED', () => {
    const subs: SubscriptionItem[] = [
      {
        id: 'sub-1',
        name: 'Idle Streaming App',
        category: 'Entertainment',
        costAmount: 15.00,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date('2026-11-01'),
        usageAssessment: 'UNUSED'
      }
    ];

    const recs = generateSavingsRecommendations(subs);
    expect(recs.length).toBe(1);
    expect(recs[0].type).toBe('UNUSED_SERVICE');
    expect(recs[0].estimatedMonthlySavings).toBe(15.00);
    expect(recs[0].estimatedAnnualSavings).toBe(180.00);
    expect(recs[0].assumptions).toContain('Unused');
  });

  it('detects duplicate active subscriptions', () => {
    const subs: SubscriptionItem[] = [
      {
        id: 'sub-1',
        name: 'Spotify Premium',
        category: 'Music',
        costAmount: 10.99,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date('2026-11-01'),
        usageAssessment: 'ACTIVE'
      },
      {
        id: 'sub-2',
        name: 'Spotify Premium',
        category: 'Music',
        costAmount: 10.99,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date('2026-11-05'),
        usageAssessment: 'ACTIVE'
      }
    ];

    const recs = generateSavingsRecommendations(subs);
    const dupRec = recs.find((r) => r.type === 'DUPLICATE_SERVICE');
    expect(dupRec).toBeDefined();
    expect(dupRec?.estimatedMonthlySavings).toBe(10.99);
  });

  it('detects overlapping services in target categories', () => {
    const subs: SubscriptionItem[] = [
      {
        id: 'sub-1',
        name: 'Netflix',
        category: 'Streaming',
        costAmount: 20.00,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date('2026-11-01'),
        usageAssessment: 'ACTIVE'
      },
      {
        id: 'sub-2',
        name: 'Paramount Plus',
        category: 'Streaming',
        costAmount: 9.99,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'ACTIVE',
        nextBillingDate: new Date('2026-11-10'),
        usageAssessment: 'LOW'
      }
    ];

    const recs = generateSavingsRecommendations(subs);
    const overlapRec = recs.find((r) => r.type === 'OVERLAPPING_SERVICE');
    expect(overlapRec).toBeDefined();
    expect(overlapRec?.subscriptionId).toBe('sub-2');
  });

  it('excludes cancelled subscriptions from generating recommendations or future costs', () => {
    const subs: SubscriptionItem[] = [
      {
        id: 'sub-cancelled',
        name: 'Old Forgotten Tool',
        category: 'Productivity',
        costAmount: 50.00,
        currency: 'USD',
        billingFrequency: 'MONTHLY',
        status: 'CANCELLED',
        nextBillingDate: new Date('2026-11-01'),
        usageAssessment: 'UNUSED'
      }
    ];

    const recs = generateSavingsRecommendations(subs);
    expect(recs.length).toBe(0);
  });
});
