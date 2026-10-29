import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  TrendingDown,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Button } from '../components/ui/Button.js';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const handleDemoLogin = async () => {
    try {
      await login({ email: 'demo@suboptimizer.io', password: 'DemoPassword123!' });
      navigate('/dashboard');
    } catch {
      navigate('/login');
    }
  };

  const faqs = [
    {
      q: 'How does the Savings Optimizer find cost-saving opportunities?',
      a: 'The rule-based optimization engine analyzes your recurring subscriptions, billing frequencies, user-reported usage levels, and categories. It flags unused services, detects overlapping subscriptions in identical categories, highlights high-cost services with low usage, and reminds you before long-term renewals.'
    },
    {
      q: 'Do you connect to or scrape my bank credentials?',
      a: 'No. SubOptima strictly respects your financial privacy. We never request bank credentials or store credit card numbers. You maintain complete control over what subscriptions you record and track.'
    },
    {
      q: 'How are estimated monthly and annual costs calculated?',
      a: 'We use authoritative normalized formulas: weekly subscriptions are normalized as (Cost × 52 ÷ 12) per month, quarterly as (Cost ÷ 3), and yearly as (Cost ÷ 12). Cancelled services are immediately removed from future recurring projections.'
    },
    {
      q: 'Can I export my subscription data?',
      a: 'Yes! At any time, you can export your entire subscription list, normalized expenses, and notes into standard CSV format via the Settings page.'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Subscription Expense Optimization</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-text-main tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Your subscriptions. <br className="hidden sm:inline" />
            <span className="text-primary">Under control.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Know what you pay. Discover what you waste. Eliminate overlapping tools and take absolute control of your recurring budget.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Tracking Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleDemoLogin}>
              Explore Demo Dashboard
            </Button>
          </div>

          {/* Interactive Preview Dashboard Card */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl bg-white p-3 sm:p-5 shadow-floating border border-border">
            <div className="bg-slate-50/80 rounded-xl p-4 sm:p-6 border border-border">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-border gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Workspace Preview</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-text-main mt-0.5">Recurring Expense Summary</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-muted">Primary Currency: <strong>USD ($)</strong></span>
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Active Tracking
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-left">
                <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
                  <span className="text-xs text-text-muted font-medium">Active Services</span>
                  <p className="text-2xl font-bold text-text-main mt-1">11</p>
                  <span className="text-[11px] text-emerald-600 font-medium">9 Active, 1 Paused</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
                  <span className="text-xs text-text-muted font-medium">Monthly Recurring</span>
                  <p className="text-2xl font-bold text-text-main mt-1">$433.86</p>
                  <span className="text-[11px] text-text-muted">Normalized run rate</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
                  <span className="text-xs text-text-muted font-medium">Annualized Spend</span>
                  <p className="text-2xl font-bold text-text-main mt-1">$5,206.32</p>
                  <span className="text-[11px] text-text-muted">Across all frequencies</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-xs">
                  <span className="text-xs text-text-muted font-medium">Potential Savings</span>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">$109.87/mo</p>
                  <span className="text-[11px] text-emerald-700 font-medium">4 Optimization flags</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section id="features" className="py-16 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main">
              Built for smarter financial decisions
            </h2>
            <p className="mt-3 text-base text-text-muted">
              Stop letting hidden recurring charges drain your personal or team budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Centralized Visibility</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Bring every SaaS subscription, streaming service, cloud license, and developer tool into one clear, categorized view.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Smart Savings Engine</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Automatically detect unused tools, redundant subscriptions, and expensive plans with explainable savings calculations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-background border border-border">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">Renewal Foresight</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Track exact upcoming renewal dates for weekly, monthly, quarterly, and annual cycles before automatic charges lock in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main">
              How SubOptima Works
            </h2>
            <p className="mt-3 text-base text-text-muted">
              Three simple steps to financial clarity and lower recurring expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-text-main text-base mb-2">Log Your Subscriptions</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Record your subscriptions with costs, billing cycles, and optional usage self-assessments in seconds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-text-main text-base mb-2">Inspect Explainable Flags</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                The Savings Optimizer flags unused, duplicate, or overlapping services with transparent assumptions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-text-main text-base mb-2">Simulate & Save</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Save hypothetical cancellation or downgrade scenarios to visualize your reduced monthly and annual budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-main">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Everything you need to know about tracking and optimizing recurring costs.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border border-border rounded-xl p-4 bg-background">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left font-semibold text-sm text-text-main"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs text-text-muted leading-relaxed border-t border-border/60 pt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-14 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to take control of your subscription expenses?
          </h2>
          <p className="mt-3 text-sm text-primary-light max-w-xl mx-auto">
            Join individuals and teams who eliminated redundant tools and optimized their recurring spend.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Tracking Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-border text-center text-xs text-text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-text-main">SubOptima Platform</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-text-main">Sign In</Link>
            <Link to="/register" className="hover:text-text-main">Register</Link>
            <a href="#faq" className="hover:text-text-main">Privacy Policy</a>
            <a href="#faq" className="hover:text-text-main">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
