"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function PortalHeader({ title, subtitle, onMenuClick, actions }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="btn-ghost min-h-[44px] min-w-[44px] p-2 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-[var(--color-text)] sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-sm text-[var(--color-text-muted)]">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
