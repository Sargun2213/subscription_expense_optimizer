import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.js';
import { SubscriptionModal } from '../components/subscriptions/SubscriptionModal.js';
import { DeleteConfirmModal } from '../components/subscriptions/DeleteConfirmModal.js';
import { api } from '../lib/api.js';
import { Subscription } from '../types/index.js';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('nextBillingDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [deletingSub, setDeletingSub] = useState<Subscription | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await api.getSubscriptions({
        category: categoryFilter,
        status: statusFilter,
        search,
        sortBy,
        order: sortOrder
      });
      setSubscriptions(res.subscriptions);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscriptions();
  };

  const handleQuickStatusChange = async (sub: Subscription, newStatus: string) => {
    try {
      await api.updateSubscription(sub.id, { status: newStatus });
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Extract unique categories for filter dropdown
  const categories = Array.from(new Set(subscriptions.map((s) => s.category)));

  const getStatusBadgeVariant = (st: string) => {
    switch (st.toUpperCase()) {
      case 'ACTIVE':
        return 'active';
      case 'PAUSED':
        return 'paused';
      case 'CANCELLED':
        return 'cancelled';
      case 'PENDING_CANCELLATION':
        return 'pending';
      default:
        return 'neutral';
    }
  };

  const getUsageBadgeVariant = (us: string) => {
    switch (us.toUpperCase()) {
      case 'ACTIVE':
        return 'active';
      case 'MODERATE':
        return 'info';
      case 'LOW':
        return 'warning';
      case 'UNUSED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Subscriptions</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage your recurring services, billing frequencies, and usage assessments.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingSub(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Subscription
          </Button>
        </div>

        {/* Filter and Control Bar */}
        <Card padding="sm">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white text-text-main"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white text-text-main"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="PENDING_CANCELLATION">Pending Cancel</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, ord] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(ord);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-white text-text-main"
              >
                <option value="nextBillingDate-asc">Renewal (Earliest First)</option>
                <option value="nextBillingDate-desc">Renewal (Latest First)</option>
                <option value="costAmount-desc">Cost (High to Low)</option>
                <option value="costAmount-asc">Cost (Low to High)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="createdAt-desc">Recently Added</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-lg p-0.5 bg-slate-50">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 rounded ${viewMode === 'table' ? 'bg-white shadow-xs text-primary' : 'text-text-muted hover:text-text-main'}`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-primary' : 'text-text-muted hover:text-text-main'}`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <LoadingSkeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="No subscriptions found"
            description={
              search || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filters to locate your subscriptions.'
                : 'Start tracking your recurring bills to get actionable optimization recommendations.'
            }
            actionText="Add Subscription"
            onAction={() => {
              setEditingSub(null);
              setIsModalOpen(true);
            }}
            actionIcon={<Plus className="w-4 h-4" />}
          />
        ) : viewMode === 'table' ? (
          /* Responsive Table View */
          <div className="bg-white border border-border rounded-card shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-text-muted font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Recurring Cost</th>
                    <th className="py-3 px-4">Normalized Monthly</th>
                    <th className="py-3 px-4">Next Renewal</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {subscriptions.map((sub) => {
                    const renewDate = new Date(sub.nextBillingDate);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-text-main text-sm">{sub.name}</div>
                          {sub.paymentMethod && (
                            <div className="text-[11px] text-text-muted mt-0.5">{sub.paymentMethod}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-text-muted bg-slate-100 px-2 py-0.5 rounded font-medium">
                            {sub.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-text-main text-sm">
                            {sub.currency} {sub.costAmount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-text-muted uppercase tracking-wider">
                            {sub.billingFrequency}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary">
                            {sub.currency} {sub.normalizedMonthly.toFixed(2)}/mo
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-text-main font-medium">
                            {renewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getUsageBadgeVariant(sub.usageAssessment)}>
                            {sub.usageAssessment}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={sub.status}
                            onChange={(e) => handleQuickStatusChange(sub, e.target.value)}
                            className="text-[11px] font-semibold rounded-md border border-border bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="PAUSED">Paused</option>
                            <option value="PENDING_CANCELLATION">Pending Cancel</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingSub(sub);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Subscription"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingSub(sub)}
                              className="p-1.5 text-text-muted hover:text-danger hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Subscription"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => {
              const renewDate = new Date(sub.nextBillingDate);
              return (
                <Card key={sub.id} className="hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-text-main text-base">{sub.name}</h4>
                      <span className="text-[11px] text-text-muted">{sub.category}</span>
                    </div>
                    <Badge variant={getStatusBadgeVariant(sub.status)}>
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 my-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase font-semibold">Cost</span>
                      <span className="font-bold text-text-main text-sm">
                        {sub.currency} {sub.costAmount.toFixed(2)}
                      </span>
                      <span className="text-text-muted text-[10px] ml-1">/{sub.billingFrequency.toLowerCase()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-text-muted block text-[10px] uppercase font-semibold">Normalized</span>
                      <span className="font-bold text-primary text-sm">
                        {sub.currency} {sub.normalizedMonthly.toFixed(2)}/mo
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-text-muted border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Next Renewal:
                      </span>
                      <span className="font-medium text-text-main">
                        {renewDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Usage Assessment:</span>
                      <Badge variant={getUsageBadgeVariant(sub.usageAssessment)} size="sm">
                        {sub.usageAssessment}
                      </Badge>
                    </div>

                    {sub.notes && (
                      <p className="text-[11px] text-text-muted italic pt-1 truncate">
                        "{sub.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSub(sub);
                        setIsModalOpen(true);
                      }}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingSub(sub)}
                      className="text-danger hover:bg-rose-50"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSub(null);
        }}
        subscriptionToEdit={editingSub}
        onSaved={() => {
          setIsModalOpen(false);
          setEditingSub(null);
          fetchSubscriptions();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingSub}
        onClose={() => setDeletingSub(null)}
        subscription={deletingSub}
        onDeleted={() => {
          setDeletingSub(null);
          fetchSubscriptions();
        }}
      />
    </AppLayout>
  );
};
