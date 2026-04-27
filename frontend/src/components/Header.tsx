'use client';

import { useState } from 'react';
import { Menu, Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { mockTenant } from '@/lib/mock-data';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export function Header({ onMenuClick, title, subtitle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLang, setShowLang] = useState(false);

  const notifications = [
    { id: 1, title: 'Nouvelle demande de service', time: 'Il y a 5 min', unread: true },
    { id: 2, title: 'Facture payée', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Demande ACCEPTED', time: 'Il y a 2h', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-transparent focus-within:bg-white focus-within:border-primary-500 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-48"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 text-xs text-slate-500">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">FR</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLang && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50">Français</button>
                <button className="w-full px-4 py-2 text-sm text-left hover:bg-slate-50">English</button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 ${
                        notif.unread ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.unread && <span className="w-2 h-2 mt-2 rounded-full bg-primary-500 flex-shrink-0" />}
                        <div className={notif.unread ? '' : 'ml-5'}>
                          <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-slate-100">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tenant badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span className="text-xs font-medium text-primary-700">{mockTenant.domain}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
