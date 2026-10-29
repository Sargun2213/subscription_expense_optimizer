import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight">SubOptima</span>
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Expense Optimizer</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            How It Works
          </a>
          <a href="#optimizer" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            Savings Engine
          </a>
          <a href="#faq" className="text-sm font-medium text-text-muted hover:text-text-main transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Tracking Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
