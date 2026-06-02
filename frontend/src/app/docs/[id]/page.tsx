"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { ENDPOINTS } from "@/lib/endpoints";
import { getMethodColor, cn } from "@/lib/utils";
import { Copy, Check, Lock, Globe } from "lucide-react";

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

export default function EndpointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const endpoint = ENDPOINTS.find((e) => e.id === id);
  if (!endpoint) notFound();

  const [activeTab, setActiveTab] = useState<"docs" | "try">("docs");

  // Le corps peut être du JSON ou du texte brut (ex. envoi de message) : on
  // tente un embellissement JSON, sinon on garde la valeur telle quelle.
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
  http://localhost:8080${replaceParams("uuid")} \\${endpoint.requiresAuth ? `
  -H "Authorization: Bearer <JWT>" \\` : ""}
  -H "Content-Type: application/json"${endpoint.requestBody ? ` \\
  -d '${prettyBody}'` : ""}`;

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
        <div className="flex-1">
          <code className="text-[18px] font-mono font-semibold break-all">{endpoint.path}</code>
          <h1 className="font-display text-[28px] font-bold tracking-tight mt-1">{endpoint.summary}</h1>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {endpoint.requiresAuth && (
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border bg-amber-400/10 text-amber-400 border-amber-400/20">
            <Lock size={10} /> Auth requise
          </span>
        )}
        {endpoint.requiresTenant && (
          <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border bg-violet-400/10 text-violet-400 border-violet-400/20">
            <Globe size={10} /> X-Tenant-Id requis
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "var(--surface-2)" }}>
        {(["docs", "try"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all capitalize",
              activeTab === tab
                ? "bg-[var(--indigo)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}>
            {tab === "docs" ? "Documentation" : "Try it out"}
          </button>
        ))}
      </div>

      {activeTab === "docs" && (
        <div className="space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-[14px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Description</h2>
            <p className="text-[14px] leading-relaxed">{endpoint.description}</p>
          </section>

          {/* Parameters */}
          {endpoint.params.length > 0 && (
            <section>
              <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Paramètres</h2>
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <table className="w-full text-[12.5px]">
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
            </section>
          )}

          {/* Request body */}
          {endpoint.requestBody && (
            <section>
              <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Corps de la requête</h2>
              <CodeBlock code={endpoint.requestBody} lang="json" />
            </section>
          )}

          {/* Responses */}
          <section>
            <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Réponses</h2>
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
          </section>

          {/* cURL */}
          <section>
            <h2 className="text-[14px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Exemple cURL</h2>
            <CodeBlock code={curlExample} lang="bash" />
          </section>
        </div>
      )}

      {activeTab === "try" && (
        <TryItOut endpoint={endpoint} />
      )}
    </motion.div>
  );
}

function TryItOut({ endpoint }: { endpoint: typeof ENDPOINTS[0] }) {
  const [jwt, setJwt] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [body, setBody] = useState(endpoint.requestBody ?? "");
  const [response, setResponse] = useState<{ status: number; data: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      if (tenantId) headers["X-Tenant-Id"] = tenantId;

      const replaceParams = (val: string) =>
        endpoint.path.replace(/{(\w+)}/g, (_, name) => {
          const p = endpoint.params.find((x) => x.name === name);
          return p?.example ?? `{${name}}`;
        });
      const res = await fetch(
        `http://localhost:8080${replaceParams("uuid")}`,
        { method: endpoint.method, headers, body: body || undefined }
      );
      const text = await res.text();
      setResponse({ status: res.status, data: text });
    } catch {
      setResponse({ status: 0, data: "Erreur réseau — l'API est-elle démarrée ?" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl border space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {endpoint.requiresAuth && (
          <div>
            <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>JWT Token</label>
            <input value={jwt} onChange={(e) => setJwt(e.target.value)}
              placeholder="eyJhbGci..."
              className="w-full px-3 py-2 rounded-lg border text-[12.5px] font-mono outline-none focus:border-[var(--indigo)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
        )}
        {endpoint.requiresTenant && (
          <div>
            <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>X-Tenant-Id</label>
            <input value={tenantId} onChange={(e) => setTenantId(e.target.value)}
              placeholder="550e8400-e29b-41d4-..."
              className="w-full px-3 py-2 rounded-lg border text-[12.5px] font-mono outline-none focus:border-[var(--indigo)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
        )}
        {endpoint.requestBody && (
          <div>
            <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Corps (JSON)</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
              className="w-full px-3 py-2 rounded-lg border text-[12px] font-mono outline-none focus:border-[var(--indigo)] transition-colors resize-none"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
        )}
        <button onClick={run} disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[var(--indigo)] hover:bg-[#4338CA] text-white text-[13.5px] font-medium transition-all disabled:opacity-60">
          {loading ? "Envoi en cours…" : `Envoyer ${endpoint.method} ${endpoint.path}`}
        </button>
      </div>

      {response && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <span className={cn("text-[11px] font-mono font-bold px-2 py-0.5 rounded border",
              response.status >= 200 && response.status < 300
                ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                : "bg-red-400/10 text-red-400 border-red-400/20")}>
              {response.status || "ERR"}
            </span>
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Réponse</span>
          </div>
          <pre className="p-4 text-[12px] font-mono overflow-x-auto max-h-64" style={{ background: "var(--bg)", color: "var(--text)" }}>
            {(() => { try { return JSON.stringify(JSON.parse(response.data), null, 2); } catch { return response.data; } })()}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
