"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-8 text-center", className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)]">
        <Icon className="h-5 w-5 text-[var(--color-text-muted)]" aria-hidden />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
