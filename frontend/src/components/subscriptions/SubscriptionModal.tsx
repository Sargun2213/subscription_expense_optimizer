import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Subscription } from '../../types/index.js';
import { api } from '../../lib/api.js';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionToEdit?: Subscription | null;
  onSaved: () => void;
}

const CATEGORIES = [
  'Developer Tools',
  'Infrastructure',
  'Design',
  'Productivity',
  'Streaming',
  'Entertainment',
  'Music',
  'Cloud Storage',
  'Health & Wellness',
  'News & Media',
  'Finance',
  'Security',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY', 'CHF'];

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (Every 3 months)' },
  { value: 'HALF_YEARLY', label: 'Semi-Annually (Every 6 months)' },
  { value: 'YEARLY', label: 'Yearly (Annual)' },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionToEdit,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [costAmount, setCostAmount] = useState<string>('10.00');
  const [currency, setCurrency] = useState('USD');
  const [billingFrequency, setBillingFrequency] = useState('MONTHLY');
  const [billingStartDate, setBillingStartDate] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [usageAssessment, setUsageAssessment] = useState('ACTIVE');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setCategory(subscriptionToEdit.category);
      setCostAmount(subscriptionToEdit.costAmount.toString());
      setCurrency(subscriptionToEdit.currency);
      setBillingFrequency(subscriptionToEdit.billingFrequency);
      setBillingStartDate(new Date(subscriptionToEdit.billingStartDate).toISOString().split('T')[0]);
      setNextBillingDate(new Date(subscriptionToEdit.nextBillingDate).toISOString().split('T')[0]);
      setStatus(subscriptionToEdit.status);
      setPaymentMethod(subscriptionToEdit.paymentMethod || '');
      setUsageAssessment(subscriptionToEdit.usageAssessment);
      setNotes(subscriptionToEdit.notes || '');
    } else {
      // Default new subscription values
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextDateStr = nextMonth.toISOString().split('T')[0];

      setName('');
      setCategory('Productivity');
      setCostAmount('15.00');
      setCurrency('USD');
      setBillingFrequency('MONTHLY');
      setBillingStartDate(today);
      setNextBillingDate(nextDateStr);
      setStatus('ACTIVE');
      setPaymentMethod('');
      setUsageAssessment('ACTIVE');
      setNotes('');
    }
    setError(null);
  }, [subscriptionToEdit, isOpen]);

  // Real-time calculation previews
  const numCost = parseFloat(costAmount) || 0;
  let previewMonthly = 0;
  let previewAnnual = 0;

  switch (billingFrequency) {
    case 'WEEKLY':
      previewMonthly = (numCost * 52) / 12;
      previewAnnual = numCost * 52;
      break;
    case 'MONTHLY':
      previewMonthly = numCost;
      previewAnnual = numCost * 12;
      break;
    case 'QUARTERLY':
      previewMonthly = numCost / 3;
      previewAnnual = numCost * 4;
      break;
    case 'HALF_YEARLY':
      previewMonthly = numCost / 6;
      previewAnnual = numCost * 2;
      break;
    case 'YEARLY':
      previewMonthly = numCost / 12;
      previewAnnual = numCost;
      break;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Subscription name is required');
      return;
    }

    if (numCost <= 0) {
      setError('Cost amount must be greater than zero');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        category,
        costAmount: Math.round(numCost * 100) / 100,
        currency,
        billingFrequency,
        billingStartDate: new Date(billingStartDate).toISOString(),
        nextBillingDate: new Date(nextBillingDate).toISOString(),
        status,
        paymentMethod: paymentMethod.trim() || undefined,
        usageAssessment,
        notes: notes.trim() || undefined
      };

      if (subscriptionToEdit) {
        await api.updateSubscription(subscriptionToEdit.id, payload);
      } else {
        await api.createSubscription(payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subscriptionToEdit ? 'Edit Subscription' : 'Add New Subscription'}
      description={
        subscriptionToEdit
          ? 'Update the billing details and usage assessment of this service.'
          : 'Track a new recurring expense and let the optimizer analyze it.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-danger-light text-danger text-sm border border-danger/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Subscription Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Netflix, Figma, AWS, ChatGPT"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Recurring Cost *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={costAmount}
                onChange={(e) => setCostAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Billing Frequency *
            </label>
            <select
              value={billingFrequency}
              onChange={(e) => setBillingFrequency(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-primary-light/50 border border-primary/20 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted font-medium">Normalized Monthly Estimate: </span>
            <span className="font-bold text-primary ml-1">
              {currency} {previewMonthly.toFixed(2)}/mo
            </span>
          </div>
          <div>
            <span className="text-text-muted font-medium">Annualized Estimate: </span>
            <span className="font-bold text-text-main ml-1">
              {currency} {previewAnnual.toFixed(2)}/yr
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Billing Start Date *
            </label>
            <input
              type="date"
              required
              value={billingStartDate}
              onChange={(e) => setBillingStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Next Renewal / Billing Date *
            </label>
            <input
              type="date"
              required
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="PENDING_CANCELLATION">Pending Cancellation</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Usage Assessment *
            </label>
            <select
              value={usageAssessment}
              onChange={(e) => setUsageAssessment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="ACTIVE">Active (Used Regularly)</option>
              <option value="MODERATE">Moderate (Used Weekly)</option>
              <option value="LOW">Low (Rarely Used)</option>
              <option value="UNUSED">Unused (Candidate to Cancel)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
              Payment Method
            </label>
            <input
              type="text"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="e.g. Visa 4129, Apple Pay"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
            Notes / Intentions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Plan to cancel before next annual cycle, shared with family..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {subscriptionToEdit ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
