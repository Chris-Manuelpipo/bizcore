'use client';

import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

interface HeaderProps {
  onMenuClick?: () => void;
  title: string;
  subtitle?: string;
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const { openSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] backdrop-blur-lg border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => { onMenuClick?.(); openSidebar(); }}
            aria-label="Ouvrir le menu"
            className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold text-[var(--text)] truncate">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-muted)] truncate">{subtitle}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}
