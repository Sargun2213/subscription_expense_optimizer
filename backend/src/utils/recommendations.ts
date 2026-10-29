import { calculateMonthlyCost, calculateAnnualCost, roundCurrency } from './calculations.js';

export interface SubscriptionItem {
  id: string;
  name: string;
  category: string;
  costAmount: number;
  currency: string;
  billingFrequency: string;
  status: string;
  nextBillingDate: Date;
  usageAssessment: string;
}

export interface GeneratedRecommendation {
  subscriptionId: string;
  type: 'UNUSED_SERVICE' | 'OVERLAPPING_SERVICE' | 'HIGH_COST_REVIEW' | 'RENEWAL_SOON' | 'DUPLICATE_SERVICE';
  title: string;
  description: string;
  suggestedAction: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  assumptions: string;
}

export function generateSavingsRecommendations(subscriptions: SubscriptionItem[]): GeneratedRecommendation[] {
  const recommendations: GeneratedRecommendation[] = [];

  // Exclude cancelled subscriptions
  const activeSubs = subscriptions.filter(
    (s) => s.status.toUpperCase() !== 'CANCELLED' && s.status.toUpperCase() !== 'CANCELED'
  );

  const seenSubIds = new Set<string>();

  // 1. Check for Duplicate Services (same name, active)
  const nameMap = new Map<string, SubscriptionItem[]>();
  for (const sub of activeSubs) {
    const cleanName = sub.name.trim().toLowerCase();
    if (!nameMap.has(cleanName)) {
      nameMap.set(cleanName, []);
    }
    nameMap.get(cleanName)!.push(sub);
  }

  for (const [name, items] of nameMap.entries()) {
    if (items.length > 1) {
      // Potentially duplicate subscription
      for (let i = 1; i < items.length; i++) {
        const duplicate = items[i];
        if (!seenSubIds.has(duplicate.id)) {
          seenSubIds.add(duplicate.id);
          const mCost = calculateMonthlyCost(duplicate.costAmount, duplicate.billingFrequency);
          const aCost = calculateAnnualCost(duplicate.costAmount, duplicate.billingFrequency);
          recommendations.push({
            subscriptionId: duplicate.id,
            type: 'DUPLICATE_SERVICE',
            title: `Duplicate Subscription Detected: ${duplicate.name}`,
            description: `You have ${items.length} active records with the name "${duplicate.name}". One of these may be an accidental duplicate.`,
            suggestedAction: `Verify if you hold duplicate accounts or if one record is obsolete, then cancel or delete the redundant entry.`,
            estimatedMonthlySavings: mCost,
            estimatedAnnualSavings: aCost,
            assumptions: `Calculation assumes 1 of the ${items.length} identical entries is eliminated, saving ${duplicate.currency} ${mCost}/mo.`
          });
        }
      }
    }
  }

  // 2. User-marked UNUSED subscriptions
  for (const sub of activeSubs) {
    if (sub.usageAssessment.toUpperCase() === 'UNUSED' && !seenSubIds.has(sub.id)) {
      seenSubIds.add(sub.id);
      const mCost = calculateMonthlyCost(sub.costAmount, sub.billingFrequency);
      const aCost = calculateAnnualCost(sub.costAmount, sub.billingFrequency);

      recommendations.push({
        subscriptionId: sub.id,
        type: 'UNUSED_SERVICE',
        title: `Unused Subscription: ${sub.name}`,
        description: `You tagged "${sub.name}" as unused, but it remains active on a ${sub.billingFrequency.toLowerCase()} plan costing ${sub.currency} ${sub.costAmount}.`,
        suggestedAction: `Cancel or pause this subscription to immediately stop recurring charges.`,
        estimatedMonthlySavings: mCost,
        estimatedAnnualSavings: aCost,
        assumptions: `Savings estimate is based on user's self-reported "Unused" status and assumes complete cancellation.`
      });
    }
  }

  // 3. Overlapping services in same category (e.g., multiple Streaming, Cloud Storage, or Music services)
  const categoryMap = new Map<string, SubscriptionItem[]>();
  for (const sub of activeSubs) {
    const cat = sub.category.trim();
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push(sub);
  }

  const overlapCategories = ['Streaming', 'Entertainment', 'Cloud Storage', 'Music', 'Productivity', 'Design'];
  for (const [category, items] of categoryMap.entries()) {
    const isTargetCategory = overlapCategories.some(
      (c) => c.toLowerCase() === category.toLowerCase()
    );

    if (isTargetCategory && items.length >= 2) {
      // Find the least frequently used or lower cost one
      const sortedByUsage = [...items].sort((a, b) => {
        const usageOrder: Record<string, number> = { UNUSED: 0, LOW: 1, MODERATE: 2, ACTIVE: 3 };
        return (usageOrder[a.usageAssessment.toUpperCase()] ?? 2) - (usageOrder[b.usageAssessment.toUpperCase()] ?? 2);
      });

      const candidate = sortedByUsage[0];
      if (!seenSubIds.has(candidate.id) && candidate.usageAssessment.toUpperCase() !== 'ACTIVE') {
        seenSubIds.add(candidate.id);
        const mCost = calculateMonthlyCost(candidate.costAmount, candidate.billingFrequency);
        const aCost = calculateAnnualCost(candidate.costAmount, candidate.billingFrequency);

        recommendations.push({
          subscriptionId: candidate.id,
          type: 'OVERLAPPING_SERVICE',
          title: `Overlapping Services in ${category}`,
          description: `You have ${items.length} active subscriptions in "${category}" (${items.map((i) => i.name).join(', ')}). "${candidate.name}" has ${candidate.usageAssessment.toLowerCase()} reported usage.`,
          suggestedAction: `Consider consolidating your ${category.toLowerCase()} needs into a single primary service and pausing ${candidate.name}.`,
          estimatedMonthlySavings: mCost,
          estimatedAnnualSavings: aCost,
          assumptions: `Assumes consolidating services and terminating ${candidate.name} without losing primary access in ${category}.`
        });
      }
    }
  }

  // 4. High-cost subscriptions with LOW usage
  for (const sub of activeSubs) {
    const mCost = calculateMonthlyCost(sub.costAmount, sub.billingFrequency);
    const aCost = calculateAnnualCost(sub.costAmount, sub.billingFrequency);

    if (mCost >= 35 && sub.usageAssessment.toUpperCase() === 'LOW' && !seenSubIds.has(sub.id)) {
      seenSubIds.add(sub.id);
      // Downgrade scenario assumption: saving ~50% by downgrading to a lower tier
      const estDowngradeMonthly = roundCurrency(mCost * 0.5);
      const estDowngradeAnnual = roundCurrency(aCost * 0.5);

      recommendations.push({
        subscriptionId: sub.id,
        type: 'HIGH_COST_REVIEW',
        title: `High Cost with Low Usage: ${sub.name}`,
        description: `"${sub.name}" costs an estimated ${sub.currency} ${mCost}/month (${sub.currency} ${aCost}/year), but your usage assessment is Low.`,
        suggestedAction: `Check if a cheaper tier, shared plan, or pay-per-use plan fits your low usage, or pause until needed.`,
        estimatedMonthlySavings: estDowngradeMonthly,
        estimatedAnnualSavings: estDowngradeAnnual,
        assumptions: `Assumes a ~50% savings via plan downgrade or tier rationalization based on user-reported low usage.`
      });
    }
  }

  // 5. High-cost Annual/Quarterly renewal coming up in next 14 days
  const now = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  for (const sub of activeSubs) {
    const isHeavyFrequency = ['YEARLY', 'HALF_YEARLY', 'QUARTERLY'].includes(sub.billingFrequency.toUpperCase());
    const renewDate = new Date(sub.nextBillingDate);

    if (isHeavyFrequency && renewDate >= now && renewDate <= twoWeeksLater && !seenSubIds.has(sub.id)) {
      const daysLeft = Math.ceil((renewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const mCost = calculateMonthlyCost(sub.costAmount, sub.billingFrequency);
      const aCost = calculateAnnualCost(sub.costAmount, sub.billingFrequency);

      recommendations.push({
        subscriptionId: sub.id,
        type: 'RENEWAL_SOON',
        title: `Upcoming Long-Term Renewal: ${sub.name}`,
        description: `"${sub.name}" is scheduled to renew in ${daysLeft} day${daysLeft === 1 ? '' : 's'} on ${renewDate.toLocaleDateString()} for ${sub.currency} ${sub.costAmount}.`,
        suggestedAction: `Review your satisfaction and ongoing need before the renewal lock-in date.`,
        estimatedMonthlySavings: mCost,
        estimatedAnnualSavings: aCost,
        assumptions: `Estimate reflects full non-renewal savings before commitment to another ${sub.billingFrequency.toLowerCase()} billing cycle.`
      });
    }
  }

  return recommendations;
}
