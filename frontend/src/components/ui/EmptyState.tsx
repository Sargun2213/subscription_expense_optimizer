import React from 'react';
import { Button } from './Button.js';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white border border-border border-dashed rounded-2xl max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-main mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted mb-6 max-w-sm leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} leftIcon={actionIcon}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
