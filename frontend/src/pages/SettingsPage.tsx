import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [name, setName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Preferences Form State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [renewalAlertDays, setRenewalAlertDays] = useState(3);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isUpdatingPref, setIsUpdatingPref] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // CSV Export State
  const [isExporting, setIsExporting] = useState(false);

  // Account Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPreferredCurrency(user.preferredCurrency || 'USD');
      setTimezone(user.timezone || 'UTC');

      if (user.preferences) {
        setEmailNotifications(user.preferences.emailNotifications);
        setRenewalAlertDays(user.preferences.renewalAlertDays);
        setWeeklyDigest(user.preferences.weeklyDigest);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    try {
      await api.updateProfile({ name, preferredCurrency, timezone });
      await refreshUser();
      setProfileSuccess('Profile information updated successfully.');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPref(true);
    setPrefSuccess(null);
    try {
      await api.updatePreferences({
        emailNotifications,
        renewalAlertDays: Number(renewalAlertDays),
        weeklyDigest
      });
      await refreshUser();
      setPrefSuccess('Notification preferences saved successfully.');
      setTimeout(() => setPrefSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences');
    } finally {
      setIsUpdatingPref(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPass(true);
    setPassSuccess(null);
    setPassError(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPassSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccess(null), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await api.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suboptima_subscriptions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAccount(deletePassword);
      logout();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Account & Platform Settings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure your personal profile, notification thresholds, data exports, and security preferences.
          </p>
        </div>

        {/* 1. Profile Information */}
        <Card>
          <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-main">User Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-slate-50 text-text-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Preferred Currency
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Europe/Paris">Paris, Berlin, Rome (CET)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" isLoading={isUpdatingProfile}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Notification Preferences */}
        <Card>
          <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-main">Notification Preferences</h2>
          </div>

          <form onSubmit={handleUpdatePreferences} className="space-y-4 text-xs">
            {prefSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{prefSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <div>
                  <span className="font-semibold text-text-main block">Email Renewal Alerts</span>
                  <span className="text-text-muted">Receive email reminders before automatic renewals execute</span>
                </div>
              </label>

              <div className="pl-7">
                <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                  Days in Advance for Renewal Alerts
                </label>
                <select
                  value={renewalAlertDays}
                  onChange={(e) => setRenewalAlertDays(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1 day before</option>
                  <option value={3}>3 days before (Recommended)</option>
                  <option value={7}>7 days before</option>
                  <option value={14}>14 days before</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                />
                <div>
                  <span className="font-semibold text-text-main block">Weekly Expense Summary</span>
                  <span className="text-text-muted">Receive a weekly digest of upcoming renewals and optimization opportunities</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" isLoading={isUpdatingPref}>
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>

        {/* 3. Security: Change Password */}
        <Card>
          <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-main">Account Security</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {passSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
                {passSuccess}
              </div>
            )}
            {passError && (
              <div className="p-3 bg-rose-50 text-danger text-xs rounded-lg border border-rose-200">
                {passError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" isLoading={isChangingPass}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* 4. Data Export */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-main">Export Subscription Data</h2>
              </div>
              <p className="text-xs text-text-muted mt-1 max-w-md">
                Download a clean, structured CSV file containing all tracked subscriptions, normalized monthly/annual costs, recurrence frequencies, renewal dates, and notes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              isLoading={isExporting}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </Card>

        {/* 5. Danger Zone: Delete Account */}
        <Card className="border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-danger">
                <Trash2 className="w-4 h-4" />
                <h2 className="text-sm font-bold">Delete Account & Purge Data</h2>
              </div>
              <p className="text-xs text-text-muted mt-1 max-w-md">
                Permanently delete your account, saved preferences, recommendations, and all tracked subscription records.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-danger flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Warning:</strong> This permanently erases your user account and all stored subscription records. This action cannot be reversed.
            </p>
          </div>

          {deleteError && (
            <div className="p-2.5 bg-red-100 text-red-700 text-xs rounded-lg">
              {deleteError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
              Enter Password to Confirm
            </label>
            <input
              type="password"
              required
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-lg border border-border focus:ring-1 focus:ring-danger focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteAccount} isLoading={isDeleting}>
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
