"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { API_BASE } from "@/lib/config";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// Commande affichée (machine à écrire). Tenant porté par le JWT — aucun header X-Tenant-Id.
const LINES = [
  `$ curl -X POST ${API_BASE}/api/service-requests \\`,
  `    -H "Authorization: Bearer <JWT>" \\`,
  `    -H "Content-Type: application/json" \\`,
  `    -d '{ "serviceId": "uuid", "consumerId": "uuid" }'`,
];
const COMMAND = LINES.join("\n");

type Phase = "typing" | "sending" | "done";

export function ApiTerminal() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? COMMAND.length : 0);
  const [phase, setPhase] = useState<Phase>(reduce ? "done" : "typing");
  const [spin, setSpin] = useState(0);

  // Boucle principale : typing → sending → done → pause → reset
  useEffect(() => {
    if (reduce) {
      setTyped(COMMAND.length);
      setPhase("done");
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(setTimeout(res, ms));
      });

    const loop = async () => {
      while (!cancelled) {
        setPhase("typing");
        setTyped(0);
        await wait(500);
        for (let i = 1; i <= COMMAND.length && !cancelled; i++) {
          setTyped(i);
          await wait(COMMAND[i - 1] === "\n" ? 200 : 18);
        }
        if (cancelled) break;
        setPhase("sending");
        await wait(950);
        if (cancelled) break;
        setPhase("done");
        await wait(3800);
      }
    };
    loop();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  // Spinner braille pendant l'envoi
  useEffect(() => {
    if (phase !== "sending") return;
    const id = setInterval(() => setSpin((s) => (s + 1) % SPINNER.length), 80);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-[0_32px_64px_rgba(0,0,0,0.55)]"
      style={{ background: "#0D0D12" }}>
      {/* Barre de titre */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--glass-border)]" style={{ background: "#16161F" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-[11px] font-mono text-[var(--text-muted)]">~/bizcore — zsh</span>
      </div>

      {/* Corps */}
      <div className="p-4 font-mono text-[12px] leading-relaxed min-h-[210px] text-left">
        {phase === "done" ? (
          <HighlightedCommand />
        ) : (
          <pre className="whitespace-pre-wrap break-all text-zinc-300 m-0">
            {COMMAND.slice(0, typed)}
            {phase === "typing" && <span className="inline-block w-[7px] -mb-[2px] h-[14px] bg-emerald-400 animate-pulse" />}
          </pre>
        )}

        {/* Ligne de statut : spinner puis réponse */}
        <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
          {phase === "sending" && (
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">{SPINNER[spin]}</span>
              <span className="text-[var(--text-muted)]">envoi…</span>
            </div>
          )}
          {phase === "done" && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  ✓ 201 Created
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">· 142 ms</span>
              </div>
              <div className="mt-2 text-zinc-300">
                <span className="text-[var(--text-muted)]">{"{ "}</span>
                <span className="text-blue-400">&quot;status&quot;</span>
                <span className="text-[var(--text-muted)]">: </span>
                <span className="text-amber-400">&quot;PENDING&quot;</span>
                <span className="text-[var(--text-muted)]">{" }"}</span>
              </div>
            </motion.div>
          )}
          {phase === "typing" && (
            <div className="h-[42px]" aria-hidden /> /* réserve la place du statut */
          )}
        </div>
      </div>
    </div>
  );
}

/** Commande complète en coloration syntaxique (état final). */
function HighlightedCommand() {
  return (
    <pre className="whitespace-pre-wrap break-all m-0 text-zinc-300">
      <span className="text-[var(--text-muted)]">$ </span>
      <span className="text-zinc-300">curl </span>
      <span className="text-[var(--text-muted)]">-X </span>
      <span className="text-violet-400">POST </span>
      <span className="text-cyan-400">{API_BASE}/api/service-requests</span>
      <span className="text-[var(--text-muted)]"> \{"\n"}    -H </span>
      <span className="text-[var(--text-muted)]">&quot;</span>
      <span className="text-blue-400">Authorization</span>
      <span className="text-[var(--text-muted)]">: </span>
      <span className="text-emerald-400">Bearer &lt;JWT&gt;</span>
      <span className="text-[var(--text-muted)]">&quot; \{"\n"}    -H </span>
      <span className="text-[var(--text-muted)]">&quot;</span>
      <span className="text-blue-400">Content-Type</span>
      <span className="text-[var(--text-muted)]">: </span>
      <span className="text-emerald-400">application/json</span>
      <span className="text-[var(--text-muted)]">&quot; \{"\n"}    -d &apos;</span>
      <span className="text-[var(--text-muted)]">{"{ "}</span>
      <span className="text-blue-400">&quot;serviceId&quot;</span>
      <span className="text-[var(--text-muted)]">: </span>
      <span className="text-emerald-400">&quot;uuid&quot;</span>
      <span className="text-[var(--text-muted)]">, </span>
      <span className="text-blue-400">&quot;consumerId&quot;</span>
      <span className="text-[var(--text-muted)]">: </span>
      <span className="text-emerald-400">&quot;uuid&quot;</span>
      <span className="text-[var(--text-muted)]">{" }"}</span>
      <span className="text-[var(--text-muted)]">&apos;</span>
    </pre>
  );
}
