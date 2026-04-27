'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  ShoppingCart, 
  FileText, 
  Settings,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Métiers', href: '/dashboard/businesses', icon: Building2 },
  { name: 'Acteurs', href: '/dashboard/actors', icon: Users },
  { name: 'Services', href: '/dashboard/services', icon: Briefcase },
  { name: 'Demandes', href: '/dashboard/requests', icon: ShoppingCart },
  { name: 'Factures', href: '/dashboard/invoices', icon: FileText },
];

const secondaryNav = [
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white" onClick={e => e.stopPropagation()}>
            <SidebarContent pathname={pathname} onClose={onClose} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} onClose={onClose} />
      </div>
    </>
  );
}

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <div>
            <span className="text-white font-semibold text-lg">BizCore</span>
            <p className="text-xs text-slate-400">BaaS Platform</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tenant info */}
      <div className="px-4 py-4 mx-3 mt-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Tenant actif</p>
        <p className="text-sm text-white font-medium mt-1">Pharmacie Centrale</p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs text-slate-400">Opérationnel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <item.icon className={clsx('w-5 h-5', isActive ? 'text-primary-400' : '')} />
                {item.name}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-700/50">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-slate-700/50 text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Jean Dupont</p>
            <p className="text-xs text-slate-400 truncate">Administrateur</p>
          </div>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
