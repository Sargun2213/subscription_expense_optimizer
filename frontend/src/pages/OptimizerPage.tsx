import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingDown,
  CheckCircle,
  X,
  Layers,
  ArrowRight,
  Info,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { StatCard } from '../components/ui/StatCard.js';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.js';
import { api } from '../lib/api.js';
import { SavingsRecommendation, SavingsScenario, Subscription } from '../types/index.js';

export const OptimizerPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SavingsRecommendation[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [scenarios, setScenarios] = useState<SavingsScenario[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDesc, setScenarioDesc] = useState('');
  const [isSavingScenario, setIsSavingScenario] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [recRes, scRes, subsRes] = await Promise.all([
        api.getRecommendations(),
        api.getScenarios(),
        api.getSubscriptions({ status: 'ACTIVE' })
      ]);

      setRecommendations(recRes.recommendations);
      setSummary(recRes.summary);
      setScenarios(scRes.scenarios);
      setAllSubscriptions(subsRes.subscriptions);
    } catch (err: any) {
      setError(err.message || 'Failed to load savings optimizer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewToggle = async (id: string) => {
    try {
      await api.reviewRecommendation(id);
      loadData();
    } catch (err) {
      console.error('Failed to toggle review:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissRecommendation(id);
      loadData();
    } catch (err) {
      console.error('Failed to dismiss recommendation:', err);
    }
  };

  const handleToggleSubSelect = (subId: string) => {
    setSelectedSubIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  // Compute live scenario savings
  const selectedSubs = allSubscriptions.filter((s) => selectedSubIds.includes(s.id));
  const simMonthlySavings = selectedSubs.reduce((acc, s) => acc + s.normalizedMonthly, 0);
  const simAnnualSavings = selectedSubs.reduce((acc, s) => acc + s.normalizedAnnual, 0);

  const currentSpend = summary?.currentMonthlySpend || 0;
  const hypotheticalSpend = Math.max(0, currentSpend - simMonthlySavings);

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim() || selectedSubIds.length === 0) return;

    try {
      setIsSavingScenario(true);
      await api.createScenario({
        name: scenarioName.trim(),
        description: scenarioDesc.trim() || undefined,
        selectedSubscriptionIds: selectedSubIds
      });
      setScenarioName('');
      setScenarioDesc('');
      setSelectedSubIds([]);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save scenario');
    } finally {
      setIsSavingScenario(false);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    try {
      await api.deleteScenario(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete scenario:', err);
    }
  };

  const getRecommendationBadge = (type: string) => {
    switch (type) {
      case 'UNUSED_SERVICE':
        return <Badge variant="danger">Unused Tool</Badge>;
      case 'OVERLAPPING_SERVICE':
        return <Badge variant="warning">Overlapping Category</Badge>;
      case 'HIGH_COST_REVIEW':
        return <Badge variant="warning">High Cost / Low Usage</Badge>;
      case 'RENEWAL_SOON':
        return <Badge variant="info">Upcoming Long-Term Renewal</Badge>;
      case 'DUPLICATE_SERVICE':
        return <Badge variant="danger">Duplicate Record</Badge>;
      default:
        return <Badge variant="neutral">Opportunity</Badge>;
    }
  };

  if (isLoading && !summary) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <LoadingSkeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <LoadingSkeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error || !summary) {
    return (
      <AppLayout>
        <div className="p-8 text-center bg-white border border-border rounded-2xl max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-main">Error Loading Optimizer</h3>
          <p className="text-xs text-text-muted mt-1 mb-4">{error || 'Failed to load savings recommendations'}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-main tracking-tight">Savings Optimizer</h1>
              <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-md shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Rule Engine
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Transparent, explainable recommendations based on usage assessments, categories, and recurrence rules.
            </p>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Current Monthly Run Rate"
            value={`$${currentSpend.toFixed(2)}`}
            subtitle="Authoritative active run rate"
            icon={<Layers className="w-5 h-5" />}
            iconBgColor="bg-slate-100 text-slate-700"
          />

          <StatCard
            title="Potential Monthly Savings"
            value={`$${(summary?.totalPotentialMonthlySavings || 0).toFixed(2)}`}
            subtitle={`${recommendations.length} actionable flags detected`}
            icon={<TrendingDown className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Optimized Monthly Target"
            value={`$${(summary?.optimizedMonthlySpend || 0).toFixed(2)}`}
            subtitle="Spend if all recommendations applied"
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgColor="bg-primary-light text-primary"
          />

          <StatCard
            title="Potential Annual Reclaim"
            value={`$${((summary?.totalPotentialMonthlySavings || 0) * 12).toFixed(2)}`}
            subtitle="Annualized cumulative savings"
            icon={<Sparkles className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Section 1: Active Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <span>Explainable Savings Flags</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {recommendations.length} Active
              </span>
            </h2>
          </div>

          {recommendations.length === 0 ? (
            <Card className="p-8 text-center bg-white">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-text-main">Your subscriptions are fully optimized!</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No unused, duplicate, or overlapping services detected. We will notify you when renewals or cost anomalies arise.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`border transition-all ${
                    rec.isReviewed ? 'bg-slate-50/70 border-slate-200 opacity-90' : 'bg-white border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {getRecommendationBadge(rec.type)}
                        <h3 className="text-base font-bold text-text-main">{rec.title}</h3>
                        {rec.isReviewed && (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Reviewed
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-main leading-relaxed">{rec.description}</p>

                      {/* Suggested Action Box */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-border/70 flex items-start gap-2.5">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-text-main">Suggested Action: </span>
                          <span className="text-text-muted">{rec.suggestedAction}</span>
                        </div>
                      </div>

                      {/* Transparent Assumptions Callout */}
                      <div className="flex items-start gap-1.5 text-[11px] text-text-muted">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                        <span><strong>Assumptions:</strong> {rec.assumptions}</span>
                      </div>
                    </div>

                    {/* Savings Value & Actions */}
                    <div className="flex flex-col items-start md:items-end justify-between self-stretch shrink-0 md:min-w-[180px] border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block md:text-right">
                          Estimated Monthly Saving
                        </span>
                        <p className="text-xl font-extrabold text-emerald-600 md:text-right">
                          +${rec.estimatedMonthlySavings.toFixed(2)}/mo
                        </p>
                        <span className="text-[11px] text-text-muted block md:text-right">
                          +${rec.estimatedAnnualSavings.toFixed(2)}/year
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant={rec.isReviewed ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleReviewToggle(rec.id)}
                        >
                          {rec.isReviewed ? 'Mark Unreviewed' : 'Mark Reviewed'}
                        </Button>
                        <button
                          onClick={() => handleDismiss(rec.id)}
                          title="Dismiss Recommendation"
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Interactive Savings Scenario Simulator */}
        <div className="space-y-4 pt-6 border-t border-border">
          <div>
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
              <span>Savings Scenario Simulator</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-primary-light text-primary rounded-full">
                Interactive Planner
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select subscriptions to simulate a hypothetical cancellation or pause scenario, and visualize your reduced budget.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscription Selector Checklist */}
            <Card className="lg:col-span-2">
              <div className="pb-3 border-b border-border mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                  Select Active Subscriptions to Include in Scenario
                </span>
                <span className="text-xs text-text-muted">{selectedSubIds.length} Selected</span>
              </div>

              {allSubscriptions.length === 0 ? (
                <p className="text-xs text-text-muted py-4">No active subscriptions available to simulate.</p>
              ) : (
                <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                  {allSubscriptions.map((sub) => {
                    const isSelected = selectedSubIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary-light/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSubSelect(sub.id)}
                            className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                          />
                          <div>
                            <span className="text-xs font-semibold text-text-main">{sub.name}</span>
                            <div className="text-[11px] text-text-muted">
                              {sub.category} • {sub.billingFrequency.toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-text-main">
                            ${sub.normalizedMonthly.toFixed(2)}/mo
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Simulation Impact & Save Card */}
            <Card className="space-y-4">
              <div className="pb-3 border-b border-border">
                <h3 className="text-sm font-bold text-text-main">Projected Budget Impact</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Current Monthly Spend:</span>
                  <span className="font-semibold text-text-main">${currentSpend.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-semibold">Simulated Monthly Savings:</span>
                  <span className="font-bold text-emerald-600">-${simMonthlySavings.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-semibold">Annual Projected Savings:</span>
                  <span className="font-bold text-emerald-600">-${simAnnualSavings.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                  <span className="font-bold text-text-main">New Projected Spend:</span>
                  <span className="font-extrabold text-primary">${hypotheticalSpend.toFixed(2)}/mo</span>
                </div>
              </div>

              {/* Save Scenario Form */}
              <form onSubmit={handleSaveScenario} className="pt-3 border-t border-border space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                    Scenario Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lean 2026 Q4 Audit"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cut unused media and downgrade cloud"
                    value={scenarioDesc}
                    onChange={(e) => setScenarioDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full"
                  disabled={selectedSubIds.length === 0 || !scenarioName.trim() || isSavingScenario}
                  isLoading={isSavingScenario}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Scenario ({selectedSubIds.length} items)
                </Button>
              </form>
            </Card>
          </div>

          {/* Saved Scenarios List */}
          {scenarios.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-text-main">Saved Scenarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((sc) => (
                  <Card key={sc.id} className="p-4 bg-white border border-border space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-text-main">{sc.name}</h4>
                        {sc.description && (
                          <p className="text-xs text-text-muted mt-0.5">{sc.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteScenario(sc.id)}
                        className="text-text-muted hover:text-danger p-1"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-emerald-800 uppercase font-bold block">Monthly Saving</span>
                        <span className="font-bold text-emerald-700">+${sc.projectedMonthlySavings.toFixed(2)}/mo</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-800 uppercase font-bold block">Annual Saving</span>
                        <span className="font-bold text-emerald-700">+${sc.projectedAnnualSavings.toFixed(2)}/yr</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
