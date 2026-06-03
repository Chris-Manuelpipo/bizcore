"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENDPOINTS, API_CATEGORIES } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { getMethodColor } from "@/lib/utils";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  // Ferme le tiroir mobile lors d'un changement de page
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const filtered = ENDPOINTS.filter(
    (e) =>
      e.path.toLowerCase().includes(search.toLowerCase()) ||
      e.summary.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = API_CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((e) => e.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {} as Record<string, typeof filtered>);

  const navContent = (
    <div className="p-4">
      {/* Search */}
      <div className="relative mb-5">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un endpoint..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-[12.5px] border outline-none focus:border-[var(--indigo)] transition-colors"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
        />
      </div>

      {/* Getting started */}
      <div className="mb-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Démarrage
        </p>
        {["Introduction", "Authentification", "Multi-tenant", "Erreurs"].map((item) => (
          <Link key={item} href={`/docs#${item.toLowerCase()}`}
            onClick={() => setNavOpen(false)}
            className={cn("block px-2 py-1.5 rounded-lg text-[12.5px] mb-0.5 transition-colors",
              hash === `#${item.toLowerCase()}` ? "bg-[var(--indigo)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
            )}>
            {item}
          </Link>
        ))}
      </div>

      {/* Endpoints grouped by category */}
      {Object.entries(grouped).map(([cat, endpoints]) => (
        <div key={cat} className="mb-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            {cat}
          </p>
          {endpoints.map((ep) => (
            <Link key={ep.id} href={`/docs/${ep.id}`}
              onClick={() => setNavOpen(false)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] mb-0.5 transition-all",
                pathname === `/docs/${ep.id}`
                  ? "bg-[var(--indigo)]/10 border border-[var(--indigo)]/20 text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
              )}>
              <span className={cn("text-[9.5px] font-bold px-1.5 py-0.5 rounded border font-mono flex-shrink-0", getMethodColor(ep.method))}>
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
    <div className="flex min-h-screen pt-14">
      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r sticky top-14 h-[calc(100vh-56px)] overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        {navContent}
      </aside>

      {/* Tiroir mobile */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setNavOpen(false)}>
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>Navigation API</span>
              <button onClick={() => setNavOpen(false)} aria-label="Fermer le menu" style={{ color: "var(--text-muted)" }}>
                <X size={18} />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {/* Barre d'ouverture de la nav (mobile uniquement) */}
        <div className="lg:hidden sticky top-14 z-30 border-b px-4 py-3 backdrop-blur-md"
          style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 85%, transparent)" }}>
          <button onClick={() => setNavOpen(true)}
            className="group flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--indigo)]/40"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--text)" }}>
            <span className="flex items-center gap-2.5">
              <Menu size={15} className="transition-colors group-hover:text-[var(--indigo)]" style={{ color: "var(--text-muted)" }} />
              Parcourir les endpoints
            </span>
            <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
