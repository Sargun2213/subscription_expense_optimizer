import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        preferredCurrency
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
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
          Create your account
        </h2>
        <p className="mt-1.5 text-xs text-text-muted">
          Start tracking your subscriptions with zero hassle and full privacy.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">
                Primary Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
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

            <Button type="submit" className="w-full mt-2" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
