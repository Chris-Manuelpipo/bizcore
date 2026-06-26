"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronRight, FileText, Key, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const navigation = [
  { name: "Clés API", href: "/dashboard", icon: Key },
  { name: "Documentation", href: "/docs", icon: BookOpen },
  { name: "Guides", href: "/guides", icon: FileText },
];

interface PortalSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function PortalSidebar({ open, onClose }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        >
          <aside
            className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent pathname={pathname} onClose={onClose} />
          </aside>
        </div>
      )}

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-[var(--color-border)] lg:bg-[var(--color-surface)]">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "DV"
    : "DV";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]">
            <Key className="h-4 w-4 text-[var(--color-on-primary)]" aria-hidden />
          </div>
          <div>
            <span className="text-base font-semibold text-[var(--color-text)]">BizCore</span>
            <p className="text-xs text-[var(--color-text-muted)]">Portail développeur</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost min-h-[44px] min-w-[44px] p-2 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation portail">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.name}
              {active && <ChevronRight className="ml-auto h-4 w-4" aria-hidden />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--color-border)] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-elevated)]">
            <span className="text-sm font-semibold text-[var(--color-text)]">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">
              {user ? `${user.firstName} ${user.lastName}` : "Développeur"}
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email ?? "—"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost flex w-full min-h-[44px] items-center gap-2 px-3 text-[var(--color-danger)] hover:bg-[var(--color-surface-elevated)]"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
