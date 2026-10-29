export type BillingFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'PENDING_CANCELLATION';
export type UsageAssessment = 'ACTIVE' | 'MODERATE' | 'LOW' | 'UNUSED';

export interface User {
  id: string;
  email: string;
  name: string;
  preferredCurrency: string;
  timezone?: string;
  createdAt?: string;
  preferences?: UserPreference;
}

export interface UserPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  renewalAlertDays: number;
  weeklyDigest: boolean;
  theme: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  category: string;
  costAmount: number;
  currency: string;
  billingFrequency: BillingFrequency;
  billingStartDate: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  paymentMethod?: string | null;
  notes?: string | null;
  usageAssessment: UsageAssessment;
  normalizedMonthly: number;
  normalizedAnnual: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsRecommendation {
  id: string;
  userId: string;
  subscriptionId?: string | null;
  type: 'UNUSED_SERVICE' | 'OVERLAPPING_SERVICE' | 'HIGH_COST_REVIEW' | 'RENEWAL_SOON' | 'DUPLICATE_SERVICE';
  title: string;
  description: string;
  suggestedAction: string;
  estimatedMonthlySavings: number;
  estimatedAnnualSavings: number;
  assumptions: string;
  isReviewed: boolean;
  isDismissed: boolean;
  createdAt: string;
  subscription?: Subscription;
}

export interface SavingsScenario {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  selectedSubscriptionIds: string;
  subscriptionIds?: string[];
  projectedMonthlySavings: number;
  projectedAnnualSavings: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalSubscriptions: number;
  activeSubscriptionsCount: number;
  totalMonthlyRecurring: number;
  totalAnnualRecurring: number;
  upcomingPaymentsCount: number;
  upcomingTotalAmount: number;
  potentialSavingsCount: number;
  totalPotentialMonthlySavings: number;
  totalPotentialAnnualSavings: number;
  currency: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  categoryBreakdown: { category: string; count: number; monthlyCost: number }[];
  monthlyProjection: { month: string; year: number; projectedCost: number }[];
  upcomingBillingTimeline: Subscription[];
  recentlyAdded: Subscription[];
  flaggedForReview: Subscription[];
  recommendationHighlights: any[];
}
