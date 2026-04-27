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
    default: 'from-slate-50 to-white border-slate-200',
    primary: 'from-primary-50 to-white border-primary-200',
    success: 'from-success-50 to-white border-success-200',
    warning: 'from-warning-50 to-white border-warning-200',
  };

  const iconVariants = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
  };

  return (
    <div className={clsx('card stat-card group', variants[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
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
              <span className="text-xs text-slate-400">{trend.label}</span>
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
