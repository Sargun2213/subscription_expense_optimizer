import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@suboptimizer.io');
    setPassword('DemoPassword123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-text-main">SubOptima</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-text-main tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-xs text-text-muted">
          Manage subscriptions, track upcoming bills, and optimize your spend.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card padding="lg" className="shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-danger-light text-danger text-xs font-medium border border-danger/20">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-3 border-t border-border">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-primary bg-primary-light/70 hover:bg-primary-light rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Demo Credentials (demo@suboptimizer.io)</span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
