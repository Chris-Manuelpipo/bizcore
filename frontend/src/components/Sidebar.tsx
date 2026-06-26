'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Key,
  BookOpen,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  { name: 'Clés API', href: '/dashboard', icon: Key },
  { name: 'Documentation', href: '/docs', icon: BookOpen, external: false },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose}>
          <div className="fixed inset-y-0 left-0 w-64 bg-[var(--surface)]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent pathname={pathname} onClose={onClose} />
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} onClose={onClose} />
      </div>
    </>
  );
}

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'DV'
    : 'DV';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[var(--surface)] to-[var(--surface-2)]">
      <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[var(--text)] font-semibold text-lg">BizCore</span>
            <p className="text-xs text-[var(--text-muted)]">Portail développeur</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
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
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
              )}
            >
              <item.icon className={clsx('w-5 h-5', isActive ? 'text-indigo-300' : '')} />
              {item.name}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Développeur'}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email ?? '—'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
