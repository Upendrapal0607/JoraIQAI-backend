import React from 'react';
import { cn } from '../lib/utils';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color = 'gradient',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const colorClasses = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gradient:
      percentage >= 80
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
        : percentage >= 50
        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
        : 'bg-gradient-to-r from-rose-500 to-orange-400',
  }[color];

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800', sizeClasses)}>
        <div
          className={cn('h-full transition-all duration-700 ease-out rounded-full', colorClasses)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <span>{percentage.toFixed(1)}%</span>
          <span>Target: 100%</span>
        </div>
      )}
    </div>
  );
}
