import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'active' | 'paused' | 'cancelled' | 'pending' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold'
  };

  const variantStyles = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    paused: 'bg-amber-50 text-amber-700 border border-amber-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    pending: 'bg-purple-50 text-purple-700 border border-purple-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
