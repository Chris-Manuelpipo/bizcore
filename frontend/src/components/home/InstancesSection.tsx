"use client";
import { motion } from "framer-motion";

const INSTANCES = [
  { emoji:"💊", name:"Pharmacie", group:"Groupe 2" },
  { emoji:"📚", name:"Bookstore", group:"Groupe 5" },
  { emoji:"🏥", name:"Assurance", group:"Groupe 9" },
  { emoji:"✈️", name:"Tourisme",  group:"Groupe 10" },
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
              <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 inline-block">{inst.emoji}</div>
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
            <code className="text-[11.5px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-2)] text-indigo-400">X-Tenant-Id</code>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
