"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ENDPOINTS, API_CATEGORIES } from "@/lib/endpoints";
import { getMethodColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DocsPage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] mb-4 border"
          style={{ background: "rgba(79,70,229,0.08)", borderColor: "rgba(79,70,229,0.25)", color: "#818CF8" }}>
          API v1.0 — REST · JSON · JWT
        </div>
        <h1 className="font-display text-[40px] font-extrabold tracking-tight mb-3">
          Documentation BizCore
        </h1>
        <p className="text-[16px] leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
          BizCore expose une API REST complète pour gérer acteurs, ressources, workflows et facturation dans un contexte multi-tenant.
        </p>
      </motion.div>

      {/* Quick sections */}
      <div id="introduction" className="mb-10">
        <h2 className="font-display text-[22px] font-bold mb-4 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          Introduction
        </h2>
        <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
          BizCore est une plateforme API multi-tenant construite avec Spring Boot. Chaque requête doit inclure un header <code className="text-[12px] px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface-2)", color: "#818CF8" }}>X-Tenant-Id</code> pour identifier l'espace de données cible.
        </p>
        <div className="p-4 rounded-xl border font-mono text-[12.5px]" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="mb-1"><span style={{ color: "var(--text-muted)" }}>Base URL</span></div>
          <div className="text-emerald-400">http://localhost:8080</div>
          <div className="mt-3 mb-1"><span style={{ color: "var(--text-muted)" }}>Swagger UI</span></div>
          <div className="text-blue-400">http://localhost:8080/swagger-ui.html</div>
        </div>
      </div>

      {/* Auth */}
      <div id="authentification" className="mb-10">
        <h2 className="font-display text-[22px] font-bold mb-4 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          Authentification
        </h2>
        <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
          BizCore utilise des tokens JWT (JSON Web Token). Après login, incluez le token dans chaque requête protégée.
        </p>
        <div className="p-4 rounded-xl border font-mono text-[12.5px] space-y-1" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div><span className="text-blue-400">Authorization</span><span style={{ color: "var(--text)" }}>: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span></div>
          <div><span className="text-blue-400">X-Tenant-Id</span><span style={{ color: "var(--text)" }}>: 550e8400-e29b-41d4-a716-446655440000</span></div>
          <div><span className="text-blue-400">Content-Type</span><span style={{ color: "var(--text)" }}>: application/json</span></div>
        </div>
      </div>

      {/* Errors */}
      <div id="erreurs" className="mb-10">
        <h2 className="font-display text-[22px] font-bold mb-4 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          Codes d'erreur
        </h2>
        <div className="space-y-2">
          {[
            { code: 400, label: "Bad Request", desc: "Données de requête invalides ou manquantes" },
            { code: 401, label: "Unauthorized", desc: "Token JWT absent, invalide ou expiré" },
            { code: 403, label: "Forbidden", desc: "Rôle insuffisant pour cette opération" },
            { code: 404, label: "Not Found", desc: "Ressource introuvable dans ce tenant" },
            { code: 409, label: "Conflict", desc: "Transition d'état invalide ou conflit de données" },
            { code: 500, label: "Server Error", desc: "Erreur interne — contactez l'admin" },
          ].map((e) => (
            <div key={e.code} className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className={cn("text-[11px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0",
                e.code < 500 ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                             : "bg-red-400/10 text-red-400 border border-red-400/20")}>
                {e.code}
              </span>
              <div>
                <span className="text-[13px] font-semibold mr-2">{e.label}</span>
                <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All endpoints */}
      <div className="mb-10">
        <h2 className="font-display text-[22px] font-bold mb-6 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
          Tous les endpoints
        </h2>
        {API_CATEGORIES.map((cat) => {
          const eps = ENDPOINTS.filter((e) => e.category === cat);
          if (!eps.length) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>{cat}</h3>
              <div className="space-y-2">
                {eps.map((ep) => (
                  <Link key={ep.id} href={`/docs/${ep.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[var(--indigo)]/40 hover:-translate-y-px group"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <span className={cn("text-[10px] font-bold font-mono px-2 py-1 rounded border flex-shrink-0 w-14 text-center", getMethodColor(ep.method))}>
                      {ep.method}
                    </span>
                    <code className="text-[12.5px] font-mono flex-1 truncate" style={{ color: "var(--text-muted)" }}>
                      {ep.path}
                    </code>
                    <span className="text-[12.5px] flex-1 truncate" style={{ color: "var(--text)" }}>
                      {ep.summary}
                    </span>
                    <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">›</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
