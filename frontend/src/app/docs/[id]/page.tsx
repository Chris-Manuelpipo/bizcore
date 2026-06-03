"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ENDPOINTS } from "@/lib/endpoints";
import { getMethodColor, cn } from "@/lib/utils";
import { Copy, Check, Lock, ChevronDown, ChevronRight } from "lucide-react";
import { API_BASE } from "@/lib/config";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all"
      style={{ background: "var(--glass)", color: "var(--text-muted)" }}>
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-[12px] font-mono overflow-x-auto leading-relaxed" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-[var(--glass)]"
        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
        {title}
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export default function EndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const endpoint = ENDPOINTS.find((e) => e.id === id);
  if (!endpoint) notFound();

  const prettyBody = (() => {
    if (!endpoint.requestBody) return "";
    try {
      return JSON.stringify(JSON.parse(endpoint.requestBody), null, 2);
    } catch {
      return endpoint.requestBody;
    }
  })();

  const replaceParams = (val: string) =>
    endpoint.path.replace(/{(\w+)}/g, (_, name) => {
      const p = endpoint.params.find((x) => x.name === name);
      return p?.example ?? `{${name}}`;
    });

  const curlExample = `curl -X ${endpoint.method} \\
  ${API_BASE}${replaceParams("uuid")} \\${endpoint.requiresAuth ? `
  -H "Authorization: Bearer <JWT>" \\` : ""}
  -H "Content-Type: application/json"${endpoint.requestBody ? ` \\
  -d '${prettyBody}'` : ""}`;

  const usage = endpoint.usage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <span className={cn("text-[11px] font-bold font-mono px-2.5 py-1.5 rounded-lg border mt-1 flex-shrink-0", getMethodColor(endpoint.method))}>
          {endpoint.method}
        </span>
        <div className="flex-1 min-w-0">
          <code className="text-[18px] font-mono font-semibold break-all">{endpoint.path}</code>
          <h1 className="text-[22px] sm:text-[28px] font-bold tracking-tight mt-1 break-words">{endpoint.summary}</h1>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {endpoint.requiresAuth && (
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border bg-amber-400/10 text-amber-400 border-amber-400/20">
            <Lock size={10} /> Auth requise
          </span>
        )}
        {endpoint.category && (
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border bg-indigo-400/10 text-indigo-400 border-indigo-400/20">
            {endpoint.category}
          </span>
        )}
      </div>

      {/* Usage Guide */}
      {usage && (
        <div className="space-y-8">
          {/* Prerequisites */}
          {usage.prerequisites && usage.prerequisites.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Prérequis</h2>
              <ul className="space-y-2">
                {usage.prerequisites.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--indigo)" }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Steps */}
          {usage.steps && usage.steps.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Guide d&apos;utilisation</h2>
              <div className="space-y-4">
                {usage.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                        style={{ background: "var(--indigo)", color: "white" }}>
                        {i + 1}
                      </span>
                      {i < usage.steps!.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: "var(--border)" }} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="text-[14px] font-semibold mb-1">{step.title}</h3>
                      <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {usage.notes && usage.notes.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Notes importantes</h2>
              <div className="p-4 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <ul className="space-y-2">
                  {usage.notes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
                      <span className="text-amber-400 mt-0.5">⚠️</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}

      <hr className="my-8" style={{ borderColor: "var(--border)" }} />

      {/* Technical Details (collapsible) */}
      <div className="space-y-4">
        <CollapsibleSection title="Paramètres" defaultOpen={endpoint.params.length > 0}>
          {endpoint.params.length > 0 ? (
            <div className="border rounded-xl overflow-x-auto" style={{ borderColor: "var(--border)" }}>
              <table className="w-full min-w-[480px] text-[12.5px]">
                <thead style={{ background: "var(--surface-2)" }}>
                  <tr>
                    {["Nom", "Emplacement", "Type", "Requis", "Description"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {endpoint.params.map((p, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--border)" }}>
                      <td className="px-3 py-2.5 font-mono text-blue-400">{p.name}</td>
                      <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded text-[10.5px]" style={{ background: "var(--glass)", color: "var(--text-muted)" }}>{p.in}</span></td>
                      <td className="px-3 py-2.5 font-mono" style={{ color: "var(--text-muted)" }}>{p.type}</td>
                      <td className="px-3 py-2.5">{p.required ? <span className="text-red-400 text-[11px]">●  oui</span> : <span className="text-[var(--text-muted)] text-[11px]">○ non</span>}</td>
                      <td className="px-3 py-2.5" style={{ color: "var(--text-muted)" }}>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Cet endpoint n&apos;a pas de paramètres.</p>
          )}
        </CollapsibleSection>

        {endpoint.requestBody && (
          <CollapsibleSection title="Corps de la requête (JSON)">
            <CodeBlock code={endpoint.requestBody} lang="json" />
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Réponses" defaultOpen={true}>
          <div className="space-y-3">
            {endpoint.responses.map((r) => (
              <div key={r.status} className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                  <span className={cn("text-[11px] font-mono font-bold px-2 py-0.5 rounded border",
                    r.status < 300 ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                    : r.status < 500 ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    : "bg-red-400/10 text-red-400 border-red-400/20")}>
                    {r.status}
                  </span>
                  <span className="text-[13px]">{r.description}</span>
                </div>
                {r.example && (
                  <pre className="p-4 text-[12px] font-mono overflow-x-auto" style={{ background: "var(--bg)", color: "var(--text)" }}>
                    {r.example}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Exemple cURL" defaultOpen={true}>
          <CodeBlock code={curlExample} lang="bash" />
        </CollapsibleSection>
      </div>
    </motion.div>
  );
}
