import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  Layers,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import { SubscriptionModal } from '../subscriptions/SubscriptionModal.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Savings Optimizer', href: '/optimizer', icon: Sparkles, badge: 'Smart' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-text-main">SubOptima</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="p-1.5 h-8 w-8 !p-0"
            title="Add Subscription"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-text-muted hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-text-main">SubOptima</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-muted hover:bg-gray-50 hover:text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="px-3 py-2 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-text-main truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-rose-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-white min-h-screen shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-text-main leading-tight">SubOptima</span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Optimizer</span>
            </div>
          </Link>
        </div>

        <div className="p-4">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full shadow-sm"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Subscription
          </Button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:bg-slate-50 hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout at bottom of sidebar */}
        <div className="p-3 border-t border-border">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-border/60 flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-semibold text-text-main truncate">{user?.name || 'User'}</span>
              <span className="text-[11px] text-text-muted truncate">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Quick Add Subscription Modal */}
      <SubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={() => {
          setIsAddModalOpen(false);
          // Trigger refresh event for active page
          window.dispatchEvent(new Event('subscription-updated'));
        }}
      />
    </div>
  );
};
