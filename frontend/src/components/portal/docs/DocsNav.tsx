"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { ENDPOINTS, API_CATEGORIES } from "@/lib/endpoints";
import { cn, getMethodColor } from "@/lib/utils";

interface DocsNavProps {
  hash: string;
  search: string;
  onSearchChange: (value: string) => void;
  navOpen: boolean;
  onNavOpenChange: (open: boolean) => void;
  /** Sticky offset for public layout with marketing navbar */
  stickyTopClass?: string;
}

export function DocsNav({
  hash,
  search,
  onSearchChange,
  navOpen,
  onNavOpenChange,
  stickyTopClass = "top-14",
}: DocsNavProps) {
  const pathname = usePathname();

  const filtered = ENDPOINTS.filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = API_CATEGORIES.reduce(
    (acc, cat) => {
      const items = filtered.filter((e) => e.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {} as Record<string, typeof filtered>,
  );

  const navContent = (
    <div className="p-4">
      <div className="relative mb-5">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          aria-hidden
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un endpoint..."
          aria-label="Rechercher un endpoint"
          className="input pl-8 py-1.5 text-[12.5px]"
        />
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Démarrage
        </p>
        {[
          { label: "Introduction", hash: "#introduction" },
          { label: "Authentification", hash: "#authentification" },
          { label: "Multi-tenant", hash: "#multi-tenant" },
          { label: "Erreurs", hash: "#erreurs" },
        ].map((item) => (
          <Link
            key={item.hash}
            href={`/docs${item.hash}`}
            onClick={() => onNavOpenChange(false)}
            className={cn(
              "mb-0.5 block min-h-[36px] rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
              hash === item.hash
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {Object.entries(grouped).map(([cat, endpoints]) => (
        <div key={cat} className="mb-4">
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {cat}
          </p>
          {endpoints.map((ep) => (
            <Link
              key={ep.id}
              href={`/docs/${ep.id}`}
              onClick={() => onNavOpenChange(false)}
              className={cn(
                "mb-0.5 flex min-h-[36px] items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors",
                pathname === `/docs/${ep.id}`
                  ? "border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]",
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold",
                  getMethodColor(ep.method),
                )}
              >
                {ep.method}
              </span>
              <span className="truncate">{ep.summary}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex w-full flex-col lg:w-56 lg:flex-shrink-0 xl:w-64">
      <aside
        className={cn(
          "hidden overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block",
          stickyTopClass !== "top-0" && `sticky ${stickyTopClass} h-[calc(100vh-3.5rem)]`,
          stickyTopClass === "top-0" && "h-full min-h-0",
        )}
      >
        {navContent}
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => onNavOpenChange(false)}
          aria-hidden
        >
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-[13px] font-semibold text-[var(--color-text)]">Navigation API</span>
              <button
                type="button"
                onClick={() => onNavOpenChange(false)}
                className="btn-ghost min-h-[44px] min-w-[44px] p-2"
                aria-label="Fermer le menu"
              >
                <X size={18} />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      <div
        className={cn(
          "border-b border-[var(--color-border)] px-4 py-3 lg:hidden",
          stickyTopClass !== "top-0" && `sticky ${stickyTopClass} z-30`,
        )}
        style={{ background: "color-mix(in srgb, var(--color-surface) 90%, transparent)" }}
      >
        <button
          type="button"
          onClick={() => onNavOpenChange(true)}
          className="btn-secondary flex w-full min-h-[44px] items-center justify-between gap-2 px-3.5 py-2.5 text-[13px]"
        >
          <span className="flex items-center gap-2.5">
            <Menu size={15} className="text-[var(--color-text-muted)]" />
            Parcourir les endpoints
          </span>
          <ChevronDown size={15} className="text-[var(--color-text-muted)]" />
        </button>
      </div>
    </div>
  );
}
