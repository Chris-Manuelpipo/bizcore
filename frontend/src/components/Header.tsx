'use client';

import { useState } from 'react';
import { Menu, Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { mockTenant } from '@/lib/mock-data';
import { useSidebar } from '@/components/SidebarContext';

interface HeaderProps {
  onMenuClick?: () => void;
  title: string;
  subtitle?: string;
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const { openSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const notifications = [
    { id: 1, title: 'Nouvelle demande de service', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Facture payée', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Demande ACCEPTED', time: 'Il y a 2h', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] backdrop-blur-lg border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { onMenuClick?.(); openSidebar(); }}
            aria-label="Ouvrir le menu"
            className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[var(--text)]">{title}</h1>
            {subtitle && <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-transparent focus-within:bg-[var(--surface)] focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm text-[var(--text)] placeholder-[var(--text-muted)] w-48"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">FR</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLang && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--surface)] rounded-lg shadow-lg border border-[var(--border)] py-1 z-50">
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-[var(--surface-2)]">Français</button>
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-[var(--surface-2)]">English</button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-[var(--text)]">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-[var(--surface-2)] cursor-pointer border-b border-[var(--border)] ${
                        notif.unread ? 'bg-indigo-500/10/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.unread && <span className="w-2 h-2 mt-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                        <div className={notif.unread ? '' : 'ml-5'}>
                          <p className="text-sm font-medium text-[var(--text)]">{notif.title}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[var(--border)]">
                  <button className="text-sm text-indigo-400 hover:text-indigo-400 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tenant badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-xs font-medium text-indigo-400">{mockTenant.domain}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
