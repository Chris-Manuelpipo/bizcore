"use client";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GUIDES } from "@/lib/guides";
import { Clock, ChevronLeft, Copy, Check, Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLE = {
  "Débutant":      "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "Intermédiaire": "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "Avancé":        "bg-red-400/10 text-red-400 border-red-400/20",
};

const LANG_COLOR: Record<string, string> = {
  bash:       "text-emerald-400",
  typescript: "text-blue-400",
  javascript: "text-yellow-400",
  json:       "text-orange-400",
};

function CodeBlock({ body, lang, filename }: { body:string; lang:string; filename?:string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-[var(--glass-border)] mt-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--glass-border)] bg-[var(--surface-2)]">
        <div className="flex items-center gap-2">
          <span className={cn("text-[11px] font-mono font-semibold", LANG_COLOR[lang] ?? "text-[var(--text-muted)]")}>{lang}</span>
          {filename && <span className="text-[11px] text-[var(--text-muted)]">— {filename}</span>}
        </div>
        <button onClick={copy} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white transition-colors">
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
      <pre className="p-4 text-[12.5px] font-mono overflow-x-auto leading-relaxed bg-[var(--bg)] text-[var(--text-muted)] whitespace-pre-wrap">
        <code>{body}</code>
      </pre>
    </div>
  );
}

export default function GuidePage({ params }: { params: Promise<{ slug:string }> }) {
  const { slug } = use(params);
  const guide = GUIDES.find(g => g.slug === slug);
  if (!guide) notFound();

  const [activeStep, setActiveStep] = useState(0);
  const step = guide.steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast  = activeStep === guide.steps.length - 1;

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back */}
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-muted)] hover:text-white transition-colors mb-8">
          <ChevronLeft size={14} /> Tous les guides
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-indigo-400">{guide.category}</span>
            <span className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]"><Clock size={11}/>{guide.duration}</span>
            <span className={cn("text-[10.5px] px-2.5 py-0.5 rounded-full border font-medium", DIFFICULTY_STYLE[guide.difficulty])}>
              {guide.difficulty}
            </span>
          </div>
          <h1 className="font-display text-[36px] font-extrabold tracking-tight text-[var(--text)] mb-3">{guide.title}</h1>
          <p className="text-[15px] text-[var(--text-muted)] leading-relaxed max-w-2xl">{guide.description}</p>
          <div className="flex gap-1.5 flex-wrap mt-4">
            {guide.tags.map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--glass-border)] text-[var(--text-muted)] font-mono">{t}</span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          {/* Step sidebar */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">Étapes</p>
            <div className="flex flex-col gap-1">
              {guide.steps.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-[13px]",
                    activeStep === i
                      ? "bg-indigo-500/15 border border-indigo-500/30 text-white"
                      : i < activeStep
                      ? "text-emerald-400 hover:bg-[var(--surface-2)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                  )}>
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                    activeStep === i ? "bg-indigo-500 text-white" : i < activeStep ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--surface-2)] text-[var(--text-muted)]"
                  )}>
                    {i < activeStep ? "✓" : i+1}
                  </span>
                  <span className="leading-tight">{s.title}</span>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1.5">
                <span>Progression</span>
                <span>{Math.round(((activeStep+1)/guide.steps.length)*100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-brand"
                  animate={{ width:`${((activeStep+1)/guide.steps.length)*100}%` }}
                  transition={{ duration:0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Step content */}
          <div>
            <motion.div key={activeStep} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.3 }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-[13px] font-bold text-indigo-400">
                  {activeStep+1}
                </span>
                <h2 className="font-display text-[22px] font-bold text-[var(--text)]">{step.title}</h2>
              </div>

              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{step.content}</p>

              {step.code && (
                <CodeBlock body={step.code.body} lang={step.code.lang} filename={step.code.filename} />
              )}

              {step.tip && (
                <div className="mt-4 flex gap-3 p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                  <Lightbulb size={15} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{step.tip}</p>
                </div>
              )}

              {step.warning && (
                <div className="mt-4 flex gap-3 p-4 rounded-xl border border-amber-400/20 bg-amber-400/5">
                  <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{step.warning}</p>
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--glass-border)]">
              <button onClick={() => setActiveStep(p => p-1)} disabled={isFirst}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--glass-border)] text-[13px] text-[var(--text-muted)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-[var(--surface-2)]">
                <ChevronLeft size={14} /> Précédent
              </button>

              {isLast ? (
                <Link href="/guides"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[13px] font-medium hover:bg-emerald-500/25 transition-all">
                  ✓ Guide terminé — Retour aux guides
                </Link>
              ) : (
                <button onClick={() => setActiveStep(p => p+1)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium transition-all hover:scale-[1.02]">
                  Suivant <ChevronLeft size={14} className="rotate-180" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
