"use client";

import Link from "next/link";
import { ENDPOINTS, API_CATEGORIES } from "@/lib/endpoints";
import { getMethodColor, cn } from "@/lib/utils";
import { API_BASE } from "@/lib/config";

export default function DocsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/10 px-3 py-1 text-[11px] text-[var(--color-primary)]">
        API v1.0 — REST · JSON · Clés API
      </div>
      <h1 className="mb-3 break-words text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl md:text-4xl">
        Documentation BizCore
      </h1>
      <p className="mb-8 text-base leading-relaxed text-[var(--color-text-muted)]">
        BizCore est une plateforme BCaaS multi-tenant. Cette documentation décrit le fonctionnement
        des ressources métier et comment les intégrer dans vos applications, pas comment appeler
        l&apos;API directement depuis un navigateur.
      </p>

      <div id="introduction" className="mb-10">
        <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text)]">
          Introduction
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          Chaque instance métier (
          <code className="rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-primary)]">
            Tenant
          </code>
          ) isole ses données. Lors d&apos;un appel API programmatique, le tenant est résolu
          automatiquement à partir de votre clé API.
        </p>
        <div className="panel p-4 font-mono text-[12.5px]">
          <div className="mb-1 text-[var(--color-text-muted)]">Base URL</div>
          <div className="text-[var(--color-success)]">{API_BASE}</div>
          <div className="mb-1 mt-3 text-[var(--color-text-muted)]">Swagger UI</div>
          <div className="text-blue-400">{API_BASE}/swagger-ui.html</div>
        </div>
      </div>

      <div id="authentification" className="mb-10">
        <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text)]">
          Authentification
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
          BizCore utilise une clé API pour authentifier les appels métier :
        </p>
        <div className="mb-4 space-y-3">
          <div className="panel p-4">
            <p className="mb-1 text-[13px] font-semibold text-[var(--color-text)]">
              Clé API (vos applications)
            </p>
            <p className="mb-3 text-[13px] text-[var(--color-text-muted)]">
              Utilisez une clé API{" "}
              <code className="font-mono text-[var(--color-primary)]">bcs_live_…</code> générée depuis
              le portail développeur. Chaque clé est scopée à un tenant.
            </p>
            <div className="space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 font-mono text-xs">
              <div>
                <span className="text-blue-400">X-Api-Key</span>
                <span className="text-[var(--color-text)]">: bcs_live_…</span>
              </div>
              <div>
                <span className="text-blue-400">Content-Type</span>
                <span className="text-[var(--color-text)]">: application/json</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="multi-tenant" className="mb-10">
        <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text)]">
          Multi-tenant
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
          Un développeur peut créer plusieurs tenants. Chaque clé API est liée à un seul tenant :
          toutes les requêtes effectuées avec cette clé opèrent dans l&apos;espace de données de ce
          tenant uniquement. L&apos;ID tenant (UUID) est retourné par la création de clé API — utilisez-le
          pour <code className="text-indigo-400">tenantId</code> lors de l&apos;inscription des utilisateurs métier.
        </p>
      </div>

      <div id="erreurs" className="mb-10">
        <h2 className="mb-4 border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text)]">
          Codes d&apos;erreur
        </h2>
        <div className="space-y-2">
          {[
            { code: 400, label: "Bad Request", desc: "Données invalides ou transition d'état non autorisée" },
            { code: 401, label: "Unauthorized", desc: "Clé API absente, invalide, expirée ou révoquée" },
            { code: 403, label: "Forbidden", desc: "Rôle insuffisant ou action non autorisée sur cette ressource" },
            { code: 404, label: "Not Found", desc: "Ressource introuvable dans ce tenant" },
            { code: 409, label: "Conflict", desc: "Conflit, ex. email déjà utilisé à l'inscription" },
            { code: 500, label: "Server Error", desc: "Erreur interne, contactez l'admin" },
          ].map((e) => (
            <div key={e.code} className="panel flex items-start gap-3 p-3">
              <span
                className={cn(
                  "flex-shrink-0 rounded border px-2 py-0.5 font-mono text-[11px] font-bold",
                  e.code < 500
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-400"
                    : "border-red-400/20 bg-red-400/10 text-red-400",
                )}
              >
                {e.code}
              </span>
              <div>
                <span className="mr-2 text-[13px] font-semibold text-[var(--color-text)]">{e.label}</span>
                <span className="text-[12.5px] text-[var(--color-text-muted)]">{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="mb-6 border-b border-[var(--color-border)] pb-2 text-xl font-bold text-[var(--color-text)]">
          Référence des ressources
        </h2>
        <p className="mb-6 text-[13px] text-[var(--color-text-muted)]">
          Chaque ressource ci-dessous documente son rôle, ses paramètres et comment l&apos;utiliser
          dans votre application avec une clé API.
        </p>
        {API_CATEGORIES.map((cat) => {
          const eps = ENDPOINTS.filter((e) => e.category === cat);
          if (!eps.length) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {cat}
              </h3>
              <div className="space-y-2">
                {eps.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/docs/${ep.id}`}
                    className="panel group flex items-center gap-3 p-3 transition-colors hover:border-[var(--color-primary)]/35"
                  >
                    <span
                      className={cn(
                        "w-14 flex-shrink-0 rounded border px-2 py-1 text-center font-mono text-[10px] font-bold",
                        getMethodColor(ep.method),
                      )}
                    >
                      {ep.method}
                    </span>
                    <code className="flex-1 truncate font-mono text-[12.5px] text-[var(--color-text-muted)]">
                      {ep.path}
                    </code>
                    <span className="flex-1 truncate text-[12.5px] text-[var(--color-text)]">
                      {ep.summary}
                    </span>
                    <span className="text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-text)]">
                      ›
                    </span>
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
