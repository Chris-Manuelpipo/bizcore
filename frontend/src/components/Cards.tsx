'use client';

import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variants = {
    default: 'from-[var(--surface-2)] to-white border-[var(--border)]',
    primary: 'from-indigo-500/10 to-white border-indigo-500/30',
    success: 'from-success-50 to-white border-success-200',
    warning: 'from-warning-50 to-white border-warning-200',
  };

  const iconVariants = {
    default: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
    primary: 'bg-indigo-500/15 text-indigo-400',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
  };

  return (
    <div className={clsx('card stat-card group', variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={clsx(
                  'text-xs font-medium px-1.5 py-0.5 rounded',
                  trend.value >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                )}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-[var(--text-muted)]">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl transition-transform group-hover:scale-110', iconVariants[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function InfoCard({ title, children, action, className }: InfoCardProps) {
  return (
    <div className={`card ${className || ''}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h3 className="font-semibold text-[var(--text)]">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
