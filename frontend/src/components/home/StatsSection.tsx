"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value:42, suffix:"+", label:"Endpoints REST" },
  { value:4,  suffix:"",  label:"Instances connectées" },
  { value:5,  suffix:"",  label:"Couches protocolaires" },
  { value:12, suffix:"+", label:"Modèles de données" },
];

function Counter({ value, suffix }: { value:number; suffix:string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once:true });
  useEffect(() => {
    if (!inView) return;
    let n=0; const step=Math.ceil(value/40);
    const t=setInterval(()=>{ n=Math.min(n+step,value); setCount(n); if(n>=value)clearInterval(t); },28);
    return ()=>clearInterval(t);
  },[inView,value]);
  return <span ref={ref} className="font-display text-[38px] font-extrabold tracking-tight gradient-text">{count}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="py-16 px-6 border-y border-[var(--glass-border)]">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
        {STATS.map((s,i) => (
          <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{delay:i*0.08,duration:0.5}} className="px-6 py-8 text-center bg-[var(--surface)]">
            <Counter value={s.value} suffix={s.suffix} />
            <p className="text-[12.5px] mt-1 text-[var(--text-muted)]">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
