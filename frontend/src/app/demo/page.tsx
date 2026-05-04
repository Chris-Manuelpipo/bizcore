"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SR_STATES = ["PENDING", "ACCEPTED", "IN_PROGRESS", "FULFILLED", "PAID"] as const;
type SRState = typeof SR_STATES[number];

const STATE_META: Record<SRState, { color: string; bg: string; desc: string; action: string }> = {
  PENDING:     { color: "#FCD34D", bg: "rgba(252,211,77,.12)",  desc: "La demande est créée et attend l'acceptation du provider.",      action: "Provider accepte →" },
  ACCEPTED:    { color: "#60A5FA", bg: "rgba(96,165,250,.12)",  desc: "Le provider a accepté. Il peut démarrer l'exécution.",          action: "Provider démarre →" },
  IN_PROGRESS: { color: "#A78BFA", bg: "rgba(167,139,250,.12)", desc: "Le service est en cours d'exécution par le provider.",          action: "Provider accomplit →" },
  FULFILLED:   { color: "#34D399", bg: "rgba(52,211,153,.12)",  desc: "Service accompli. Une facture PENDING est automatiquement créée.", action: "Consumer paie →" },
  PAID:        { color: "#4F46E5", bg: "rgba(79,70,229,.12)",   desc: "La facture est payée. Le cycle est terminé.",                   action: "Terminé ✓" },
};

function WorkflowDemo() {
  const [current, setCurrent] = useState<SRState>("PENDING");
  const currentIndex = SR_STATES.indexOf(current);

  const advance = () => {
    if (currentIndex < SR_STATES.length - 1) setCurrent(SR_STATES[currentIndex + 1]);
  };
  const reset = () => setCurrent("PENDING");

  return (
    <div className="p-6 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-[18px] font-bold mb-1">Cycle de vie ServiceRequest</h3>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
        Simulez les transitions d'état du workflow BizCore
      </p>

      {/* State flow */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {SR_STATES.map((state, i) => {
          const meta = STATE_META[state];
          const isActive = state === current;
          const isPast = i < currentIndex;
          return (
            <div key={state} className="flex items-center gap-2">
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border cursor-pointer transition-all"
                style={{
                  background: isActive ? meta.bg : isPast ? "rgba(52,211,153,.06)" : "var(--glass)",
                  borderColor: isActive ? meta.color + "66" : isPast ? "#34D39933" : "var(--glass-border)",
                  color: isActive ? meta.color : isPast ? "#34D399" : "var(--text-muted)",
                }}
                onClick={() => setCurrent(state)}
              >
                {isPast && <span className="mr-1">✓</span>}{state}
              </motion.div>
              {i < SR_STATES.length - 1 && (
                <span className="text-[var(--text-muted)] text-[12px]">→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="p-4 rounded-xl border mb-4"
          style={{ background: STATE_META[current].bg, borderColor: STATE_META[current].color + "44" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATE_META[current].color }} />
            <span className="font-semibold text-[14px]" style={{ color: STATE_META[current].color }}>{current}</span>
          </div>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{STATE_META[current].desc}</p>
          {current === "FULFILLED" && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-[12.5px]"
              style={{ borderColor: STATE_META[current].color + "33", color: "#34D399" }}>
              📄 Invoice générée automatiquement — status: PENDING
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <button onClick={advance} disabled={currentIndex >= SR_STATES.length - 1}
          className="flex-1 py-2.5 rounded-xl bg-[var(--indigo)] hover:bg-[#4338CA] text-white text-[13.5px] font-medium transition-all disabled:opacity-40">
          {STATE_META[current].action}
        </button>
        <button onClick={reset}
          className="px-4 py-2.5 rounded-xl border text-[13.5px] transition-all hover:bg-[var(--glass)]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Reset
        </button>
      </div>
    </div>
  );
}

function MultiTenantDemo() {
  const [activeTenant, setActiveTenant] = useState(0);
  const tenants = [
    { name: "Pharmacie", emoji: "💊", color: "#34D399", data: { actors: 12, services: 8,  requests: 145, invoices: 132 } },
    { name: "Bookstore",  emoji: "📚", color: "#60A5FA", data: { actors: 6,  services: 24, requests: 89,  invoices: 81  } },
    { name: "Assurance",  emoji: "🏥", color: "#A78BFA", data: { actors: 20, services: 15, requests: 203, invoices: 198 } },
    { name: "Tourisme",   emoji: "✈️", color: "#FCD34D", data: { actors: 9,  services: 32, requests: 67,  invoices: 54  } },
  ];
  const t = tenants[activeTenant];

  return (
    <div className="p-6 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <h3 className="font-display text-[18px] font-bold mb-1">Isolation Multi-Tenant</h3>
      <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
        Chaque tenant a ses propres données isolées sur la même infrastructure
      </p>

      {/* Tenant tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tenants.map((ten, i) => (
          <button key={i} onClick={() => setActiveTenant(i)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[13px] transition-all"
            style={{
              background: activeTenant === i ? `${ten.color}18` : "var(--glass)",
              borderColor: activeTenant === i ? ten.color + "55" : "var(--glass-border)",
              color: activeTenant === i ? ten.color : "var(--text-muted)",
            }}>
            {ten.emoji} {ten.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTenant} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border text-[12.5px] font-mono"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
            <span className="text-blue-400">X-Tenant-Id</span>
            <span style={{ color: "var(--text)" }}>: </span>
            <span style={{ color: t.color }}>550e8400-{activeTenant}000-41d4-a716</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Acteurs", value: t.data.actors },
              { label: "Services", value: t.data.services },
              { label: "Demandes", value: t.data.requests },
              { label: "Factures", value: t.data.invoices },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl border text-center" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                <div className="text-[24px] font-bold font-display" style={{ color: t.color }}>{s.value}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pt-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
        <p className="text-[11.5px] font-semibold tracking-[1.6px] uppercase mb-3" style={{ color: "var(--indigo-l,#6366F1)" }}>
          Démos interactives
        </p>
        <h1 className="font-display text-[40px] font-extrabold tracking-tight mb-3">
          Voir BizCore en action
        </h1>
        <p className="text-[16px] max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
          Explorez le comportement de l'API sans écrire une ligne de code.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <WorkflowDemo />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <MultiTenantDemo />
        </motion.div>
      </div>
    </div>
  );
}
