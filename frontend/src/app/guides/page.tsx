"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GUIDES, GUIDE_CATEGORIES } from "@/lib/guides";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFICULTY_STYLE = {
  "Débutant":      "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "Intermédiaire": "bg-amber-400/10 text-amber-400 border-amber-400/20",
  "Avancé":        "bg-red-400/10 text-red-400 border-red-400/20",
};

export default function GuidesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const categories = ["Tous", ...GUIDE_CATEGORIES];

  const filtered = activeCategory === "Tous"
    ? GUIDES
    : GUIDES.filter(g => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[12px] mb-5">
            📖 Guides d'utilisation
          </span>
          <h1 className="font-display text-[42px] font-extrabold tracking-tight text-[var(--text)] mb-3">
            Guides BizCore
          </h1>
          <p className="text-[16px] text-[var(--text-muted)] max-w-lg mx-auto">
            Des guides pas-à-pas pour intégrer et utiliser l'API BizCore, du premier appel jusqu'aux cas d'usage avancés.
          </p>
        </motion.div>

        {/* Category filter */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}
          className="flex items-center gap-2 flex-wrap justify-center mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[13px] font-medium border transition-all",
                activeCategory === cat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-[var(--surface-2)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-2)]"
              )}>
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Guides grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((guide, i) => (
            <motion.div key={guide.slug}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.07, duration:0.4 }}>
              <Link href={`/guides/${guide.slug}`}
                className="block p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 group h-full">

                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <Clock size={10} />{guide.duration}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", DIFFICULTY_STYLE[guide.difficulty])}>
                      {guide.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title & desc */}
                <h2 className="font-display text-[17px] font-bold text-[var(--text)] mb-2 group-hover:text-indigo-300 transition-colors">
                  {guide.title}
                </h2>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mb-4">{guide.description}</p>

                {/* Tags */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {guide.tags.map(t => (
                      <span key={t} className="text-[10.5px] px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--glass-border)] text-[var(--text-muted)] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                  <ChevronRight size={15} className="text-[var(--text-muted)] group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </div>

                {/* Step count */}
                <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center gap-1.5">
                  {guide.steps.map((_, si) => (
                    <div key={si} className="h-1 flex-1 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors" />
                  ))}
                  <span className="text-[11px] text-[var(--text-muted)] ml-1">{guide.steps.length} étapes</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
