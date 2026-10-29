import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.js';
import { Card } from '../components/ui/Card.js';
import { StatCard } from '../components/ui/StatCard.js';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.js';
import { api } from '../lib/api.js';

const COLORS = ['#635BFF', '#4F8CFF', '#15966A', '#E9A23B', '#D94B55', '#8F9CAE', '#9333EA', '#06B6D4'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const fetchAnalytics = async (curr?: string) => {
    try {
      setIsLoading(true);
      const res = await api.getAnalytics(curr || selectedCurrency);
      setData(res);
      if (res.currency && !curr) {
        setSelectedCurrency(res.currency);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCurrencyChange = (curr: string) => {
    setSelectedCurrency(curr);
    fetchAnalytics(curr);
  };

  if (isLoading && !data) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <LoadingSkeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <LoadingSkeleton className="h-80 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="p-8 text-center bg-white border border-border rounded-2xl max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-main">Error Loading Analytics</h3>
          <p className="text-xs text-text-muted mt-1">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const {
    summary,
    spendingByCategory,
    frequencyDistribution,
    mostExpensive,
    statusBreakdown,
    upcomingRenewals,
    monthlyTrends,
    availableCurrencies
  } = data;

  const curr = selectedCurrency;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Currency Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Expense Analytics</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Deep dive into category distribution, billing cycles, renewal velocity, and spending trends.
            </p>
          </div>

          {availableCurrencies && availableCurrencies.length > 1 && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border">
              <span className="text-xs text-text-muted font-medium">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="text-xs font-semibold bg-transparent border-none focus:outline-none text-text-main cursor-pointer"
              >
                {availableCurrencies.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Run Rate"
            value={`${curr} ${summary.totalMonthlyRecurring.toFixed(2)}`}
            subtitle="Normalized across active subscriptions"
            icon={<CreditCard className="w-5 h-5" />}
            iconBgColor="bg-primary-light text-primary"
          />

          <StatCard
            title="Annualized Spend"
            value={`${curr} ${summary.totalAnnualRecurring.toFixed(2)}`}
            subtitle="12-month projected total commitment"
            icon={<TrendingUp className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Renewals in 14 Days"
            value={`${curr} ${upcomingRenewals.next14Days.totalAmount.toFixed(2)}`}
            subtitle={`${upcomingRenewals.next14Days.count} renewals due soon`}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Renewals in 30 Days"
            value={`${curr} ${upcomingRenewals.next30Days.totalAmount.toFixed(2)}`}
            subtitle={`${upcomingRenewals.next30Days.count} renewal charges upcoming`}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* 12-Month Expense Trend */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">12-Month Spending Velocity</h3>
              <p className="text-xs text-text-muted">Authoritative normalized projection over the upcoming year</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
              Full Horizon
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EBF2" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickFormatter={(val) => `${curr} ${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`${curr} ${Number(val).toFixed(2)}`, 'Monthly Run Rate']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7EBF2' }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#635BFF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#635BFF', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown & Billing Frequency Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category Bar Chart */}
          <Card>
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-main">Spending by Category</h3>
              <p className="text-xs text-text-muted">Normalized monthly spend across service sectors</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7EBF2" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#667085' }}
                    tickFormatter={(val) => `${curr} ${val}`}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tick={{ fontSize: 11, fill: '#172033', fontWeight: 500 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${curr} ${Number(val).toFixed(2)}/mo`, 'Cost']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7EBF2' }}
                  />
                  <Bar dataKey="monthlyCost" fill="#635BFF" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Billing Frequency Breakdown Pie Chart */}
          <Card>
            <div className="pb-4 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-main">Billing Frequency Breakdown</h3>
              <p className="text-xs text-text-muted">Distribution of payment cadences</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={frequencyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="normalizedMonthlyTotal"
                    nameKey="frequency"
                  >
                    {frequencyDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${curr} ${Number(value).toFixed(2)}/mo`, 'Monthly Total']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E7EBF2' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {frequencyDistribution.map((item: any, i: number) => (
                  <div key={item.frequency} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-text-muted capitalize">{item.frequency.toLowerCase()}</span>
                    </div>
                    <span className="font-semibold text-text-main">
                      {item.count} ({curr} {item.normalizedMonthlyTotal.toFixed(2)})
                    </span>
                  </div>
                ))}
              </div>

              {statusBreakdown && statusBreakdown.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60 text-[11px]">
                  <span className="text-text-muted font-medium">Statuses:</span>
                  {statusBreakdown.map((st: any) => (
                    <span key={st.status} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {st.status}: <strong>{st.count}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Most Expensive Subscriptions Table */}
        <Card>
          <div className="pb-4 border-b border-border mb-4">
            <h3 className="text-sm font-bold text-text-main">Most Expensive Subscriptions</h3>
            <p className="text-xs text-text-muted">Ranked by normalized monthly recurring commitment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Subscription</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Actual Charge</th>
                  <th className="py-2.5 px-4">Normalized Monthly</th>
                  <th className="py-2.5 px-4">Annual Commitment</th>
                  <th className="py-2.5 px-4">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mostExpensive.map((sub: any, index: number) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-text-muted">#{index + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-text-main text-sm">{sub.name}</td>
                    <td className="py-2.5 px-4 text-text-muted">{sub.category}</td>
                    <td className="py-2.5 px-4 font-medium text-text-main">
                      {sub.currency} {sub.costAmount.toFixed(2)} ({sub.billingFrequency.toLowerCase()})
                    </td>
                    <td className="py-2.5 px-4 font-bold text-primary">
                      {sub.currency} {sub.monthlyNormalized.toFixed(2)}/mo
                    </td>
                    <td className="py-2.5 px-4 text-text-main">
                      {sub.currency} {sub.annualNormalized.toFixed(2)}/yr
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        sub.usageAssessment === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : sub.usageAssessment === 'UNUSED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {sub.usageAssessment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
