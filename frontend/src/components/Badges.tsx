'use client';

import clsx from 'clsx';
import { statusColors, ServiceRequest, Invoice } from '@/lib/types';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = statusColors[status] || { bg: 'bg-[var(--surface-2)]', text: 'text-[var(--text)]', dot: 'bg-[var(--surface-2)]0' };
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full font-medium', colors.bg, colors.text, sizes[size])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {status.replace('_', ' ')}
    </span>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const colors = [
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-violet-400 to-violet-600',
  ];

  const colorIndex = name.length % colors.length;

  return (
    <div className={clsx('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold', colors[colorIndex], sizes[size], className)}>
      {initials}
    </div>
  );
}

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencyDisplay({ amount, currency, size = 'md' }: CurrencyDisplayProps) {
  const formatted = new Intl.NumberFormat('fr-FR').format(amount);
  
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const currencySymbols: Record<string, string> = {
    XAF: 'XAF',
    XOF: 'XOF',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  return (
    <span className={clsx('font-semibold text-[var(--text)]', sizes[size])}>
      {currencySymbols[currency] || currency} {formatted}
    </span>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-medium text-[var(--text)]">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
