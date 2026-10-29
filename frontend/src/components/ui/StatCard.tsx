import React from 'react';
import { Card } from './Card.js';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-primary-light text-primary',
  trend
}) => {
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-text-main mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                {trend.value}
              </span>
              {trend.label && <span className="text-xs text-text-muted">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
