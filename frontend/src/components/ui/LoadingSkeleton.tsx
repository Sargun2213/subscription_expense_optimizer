import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />;
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-card border border-border space-y-3">
            <LoadingSkeleton className="h-4 w-24" />
            <LoadingSkeleton className="h-8 w-36" />
            <LoadingSkeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-card border border-border h-80">
          <LoadingSkeleton className="h-6 w-48 mb-4" />
          <LoadingSkeleton className="h-60 w-full" />
        </div>
        <div className="bg-white p-6 rounded-card border border-border h-80">
          <LoadingSkeleton className="h-6 w-48 mb-4" />
          <LoadingSkeleton className="h-60 w-full" />
        </div>
      </div>
    </div>
  );
};
