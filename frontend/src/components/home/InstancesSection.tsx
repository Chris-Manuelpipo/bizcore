"use client";
import { motion } from "framer-motion";
import { Pill, BookOpen, ShieldPlus, Plane, type LucideIcon } from "lucide-react";

const INSTANCES: { icon: LucideIcon; name: string; group: string; bg: string; accent: string }[] = [
  { icon:Pill,       name:"Pharmacie", group:"Groupe 2",  bg:"bg-emerald-400/10", accent:"text-emerald-400" },
  { icon:BookOpen,   name:"Bookstore", group:"Groupe 5",  bg:"bg-orange-400/10",  accent:"text-orange-400"  },
  { icon:ShieldPlus, name:"Assurance", group:"Groupe 9",  bg:"bg-cyan-400/10",    accent:"text-cyan-400"    },
  { icon:Plane,      name:"Tourisme",  group:"Groupe 10", bg:"bg-violet-400/10",  accent:"text-violet-400"  },
];

export function InstancesSection() {
  return (
    <section className="py-24 px-6 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-center mb-14">
          <p className="text-[11.5px] font-semibold tracking-[1.6px] uppercase text-indigo-400 mb-3">Instances</p>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-[var(--text)]">Des métiers concrets,<br/><span className="gradient-text">une seule API</span></h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INSTANCES.map((inst,i) => (
            <motion.div key={i} initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
              transition={{delay:i*0.08,duration:0.5}} whileHover={{y:-5,scale:1.02,transition:{duration:0.2}}}
              className="p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] text-center cursor-default group">
              <div className={`w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${inst.bg}`}>
                <inst.icon className={`w-5 h-5 ${inst.accent}`} strokeWidth={2} />
              </div>
              <div className="text-[13.5px] font-semibold mb-1 text-[var(--text)]">{inst.name}</div>
              <div className="text-[11px] mb-3 text-[var(--text-muted)]">{inst.group}</div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">● Connecté</span>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.4,duration:0.6}}
          className="mt-8 p-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--surface-2)] text-center">
          <p className="text-[12px] text-[var(--text-muted)]">
            Toutes les instances consomment la même API — différenciées uniquement par leur{" "}
            <code className="text-[11.5px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-2)] text-indigo-400">tenantId</code>{" "}
            porté par le JWT
          </p>
        </motion.div>
      </div>
    </section>
  );
}
