"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENDPOINTS, API_CATEGORIES } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { getMethodColor } from "@/lib/utils";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

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

  return (
    <div className="flex min-h-screen pt-14">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r sticky top-14 h-[calc(100vh-56px)] overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
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

           {/* Reference API */}
           <div className="mb-4">
             <Link href="/Reference-API"
               className={cn("flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12.5px] mb-0.5 transition-colors font-semibold",
                 pathname === "/Reference-API" ? "bg-[var(--indigo)] text-white" : "text-[var(--indigo)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
               )}>
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               Référence API
             </Link>
           </div>

           {/* Getting started */}
           <div className="mb-4">
             <p className="text-[10.5px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
               Démarrage
             </p>
             {["Introduction", "Authentification", "Multi-tenant", "Erreurs"].map((item) => (
               <Link key={item} href={`/docs#${item.toLowerCase()}`}
                 className={cn("block px-2 py-1.5 rounded-lg text-[12.5px] mb-0.5 transition-colors",
                   pathname === `/docs#${item}` ? "bg-[var(--indigo)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--glass)]"
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
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-8 py-10">
        {children}
      </main>
    </div>
  );
}
