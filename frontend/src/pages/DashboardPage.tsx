import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  TrendingDown,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AppLayout } from '../components/layout/AppLayout.js';
import { StatCard } from '../components/ui/StatCard.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { DashboardSkeleton } from '../components/ui/LoadingSkeleton.js';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal.js';
import { api } from '../lib/api.js';
import { DashboardData } from '../types/index.js';

const PIE_COLORS = ['#635BFF', '#4F8CFF', '#15966A', '#E9A23B', '#D94B55', '#8F9CAE', '#9333EA'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const handleRefresh = () => fetchDashboard();
    window.addEventListener('subscription-updated', handleRefresh);
    return () => window.removeEventListener('subscription-updated', handleRefresh);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-6 text-center bg-white border border-border rounded-2xl max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-main">Error Loading Dashboard</h3>
          <p className="text-xs text-text-muted mt-1 mb-4">{error || 'An unexpected error occurred'}</p>
          <Button onClick={fetchDashboard}>Try Again</Button>
        </div>
      </AppLayout>
    );
  }

  const { summary, categoryBreakdown, monthlyProjection, upcomingBillingTimeline, flaggedForReview } = data;
  const currencySymbol = summary.currency === 'USD' ? '$' : summary.currency === 'EUR' ? '€' : summary.currency === 'GBP' ? '£' : `${summary.currency} `;

  // Empty state for brand new user with 0 subscriptions
  if (summary.totalSubscriptions === 0) {
    return (
      <AppLayout>
        <div className="py-12">
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="No subscriptions tracked yet"
            description="Welcome to your personal workspace! Add your first subscription to begin monitoring recurring expenses and unlocking optimization insights."
            actionText="Add First Subscription"
            onAction={() => setIsAddModalOpen(true)}
            actionIcon={<Plus className="w-4 h-4" />}
          />
        </div>
        <SubscriptionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaved={() => {
            setIsAddModalOpen(false);
            fetchDashboard();
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Main Dashboard</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Authoritative overview of recurring expenses, billing dates, and savings opportunities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add Subscription
            </Button>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Run Rate"
            value={`${currencySymbol}${summary.totalMonthlyRecurring.toFixed(2)}`}
            subtitle="Normalized monthly recurring cost"
            icon={<CreditCard className="w-5 h-5" />}
            iconBgColor="bg-primary-light text-primary"
          />

          <StatCard
            title="Annualized Spend"
            value={`${currencySymbol}${summary.totalAnnualRecurring.toFixed(2)}`}
            subtitle={`Across ${summary.activeSubscriptionsCount} active services`}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Upcoming in 30 Days"
            value={`${currencySymbol}${summary.upcomingTotalAmount.toFixed(2)}`}
            subtitle={`${summary.upcomingPaymentsCount} payments scheduled`}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Potential Savings"
            value={`${currencySymbol}${summary.totalPotentialMonthlySavings.toFixed(2)}/mo`}
            subtitle={`${summary.potentialSavingsCount} optimization opportunities`}
            icon={<TrendingDown className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* Visual Charts: Monthly Projection & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 6-Month Projected Run Rate */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-main">Monthly Spending Projection</h3>
                <p className="text-xs text-text-muted">Estimated recurring cost over the next 6 months</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                Normalized
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyProjection} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#635BFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#635BFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EBF2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#667085' }}
                    tickFormatter={(val) => `${currencySymbol}${val}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Projected Spend']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7EBF2' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedCost"
                    stroke="#635BFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Breakdown Donut */}
          <Card>
            <div className="pb-4 border-b border-border/80 mb-4">
              <h3 className="text-sm font-bold text-text-main">Category Distribution</h3>
              <p className="text-xs text-text-muted">Monthly expense by service category</p>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="monthlyCost"
                    nameKey="category"
                  >
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}/mo`, 'Cost']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7EBF2' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2 max-h-28 overflow-y-auto">
              {categoryBreakdown.slice(0, 4).map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-text-main truncate max-w-[120px]">{cat.category}</span>
                  </div>
                  <span className="font-semibold text-text-main">
                    {currencySymbol}{cat.monthlyCost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Section: Upcoming Payments & Flagged Subscriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Payments Timeline */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-main">Upcoming Renewals</h3>
                <p className="text-xs text-text-muted">Charges expected in the next 30 days</p>
              </div>
              <Link to="/subscriptions" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingBillingTimeline.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No payments scheduled in next 30 days.</p>
            ) : (
              <div className="divide-y divide-border/60">
                {upcomingBillingTimeline.map((sub) => {
                  const renewDate = new Date(sub.nextBillingDate);
                  const daysLeft = Math.ceil((renewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={sub.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h4 className="text-sm font-semibold text-text-main">{sub.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">
                            {renewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            {daysLeft <= 0 ? 'Today' : `In ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-text-main">
                          {currencySymbol}{sub.costAmount.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider">{sub.billingFrequency}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Subscriptions Flagged for Review */}
          <Card>
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                  <span>Flagged for Review</span>
                  {flaggedForReview.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 rounded-full font-bold border border-rose-200">
                      {flaggedForReview.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-text-muted">Services marked unused or with high cost relative to usage</p>
              </div>
              <Link to="/optimizer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Savings Engine <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {flaggedForReview.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted flex flex-col items-center">
                <Sparkles className="w-6 h-6 text-emerald-500 mb-2" />
                <span>All subscriptions are currently active and in good standing.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedForReview.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl bg-slate-50 border border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-main">{sub.name}</h4>
                        <Badge variant={sub.usageAssessment === 'UNUSED' ? 'danger' : 'warning'}>
                          {sub.usageAssessment}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{sub.category} • {sub.billingFrequency}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-text-main">
                        {currencySymbol}{sub.costAmount.toFixed(2)}
                      </span>
                      <Link to="/optimizer" className="block text-[11px] text-primary hover:underline font-medium mt-0.5">
                        Inspect Saving
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          fetchDashboard();
        }}
      />
    </AppLayout>
  );
};
