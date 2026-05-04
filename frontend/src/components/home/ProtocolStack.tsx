"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAYERS = [
  { num:"5", name:"Business capabilities", desc:"Acteurs, ressources, opérations, workflow, documents et audit.", tags:["Actor","ServiceRequest","Invoice","Audit","Portfolio"], color:"#FB923C", bgClass:"bg-orange-400/10", osi:"Application",
    detail:"Équivalent à la couche Application OSI. Elle expose les primitives métier directement consommables par les clients." },
  { num:"4", name:"Context & policy", desc:"Identité, permissions, règles métier, SLA, session et saga transactionnelle.", tags:["JWT","Rôles","BusinessRule","SLA","Saga"], color:"#22D3EE", bgClass:"bg-cyan-400/10", osi:"Session",
    detail:"Analogue aux couches Session/Présentation. Elle enrichit chaque requête avec son contexte de sécurité et ses garanties SLA." },
  { num:"3", name:"Tenant & routing", desc:"Résolution du tenant, discovery de services, partitionnement et versioning API.", tags:["X-Tenant-Id","TenantFilter","TenantContext","Discovery"], color:"#818CF8", bgClass:"bg-indigo-400/10", osi:"Réseau",
    detail:"Analogue à la couche Réseau. Le TenantFilter résout l'identité du tenant depuis X-Tenant-Id et injecte le contexte." },
  { num:"2", name:"Transport & messaging", desc:"REST/gRPC, événements Kafka, retry, timeout et idempotence.", tags:["REST","Kafka","Idempotence","Retry","Timeout"], color:"#A78BFA", bgClass:"bg-violet-400/10", osi:"Transport",
    detail:"Analogue à TCP/UDP. Gère la fiabilité : retry automatique, idempotence des mutations, timeouts et choix sync/async." },
  { num:"1", name:"Infrastructure", desc:"PostgreSQL, Redis, Kafka, HikariCP, Liquibase et observabilité.", tags:["PostgreSQL","Redis","HikariCP","Liquibase","Metrics"], color:"#34D399", bgClass:"bg-emerald-400/10", osi:"Physique",
    detail:"Socle physique et logiciel. PostgreSQL assure la persistance, Redis le cache, Kafka le bus d'événements." },
];

export function ProtocolStack() {
  const [sel, setSel] = useState(0);
  const L = LAYERS[sel];

  return (
    <section className="py-24 px-6 bg-[#0A0A0F]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-center mb-14">
          <p className="text-[11.5px] font-semibold tracking-[1.6px] uppercase text-indigo-400 mb-3">Analogie protocolaire</p>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-white leading-tight">
            Une pile comme OSI,<br/><span className="gradient-text">mais pour le métier</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="flex flex-col gap-2">
            {LAYERS.map((layer,i) => (
              <motion.div key={i} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.07,duration:0.5}}>
                <button onClick={()=>setSel(i)} className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group ${sel===i ? "border-white/20 -translate-x-1" : "border-white/[0.06] hover:border-white/10"}`}
                  style={{ background: sel===i ? `${layer.color}12` : "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{background:layer.color}} />
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                      style={{background:`${layer.color}20`, color:layer.color}}>{layer.num}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13.5px] font-semibold text-white">{layer.name}</span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded-md ml-2 flex-shrink-0"
                          style={{background:`${layer.color}18`, color:layer.color}}>↔ {layer.osi}</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {layer.tags.map(t=>(
                          <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.07] text-gray-500">{t}</span>
                        ))}
                      </div>
                    </div>
                    <svg className="flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{color: sel===i ? layer.color : "#4B5563"}}>
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                {i<LAYERS.length-1 && <div className="ml-[34px] w-px h-2 bg-white/10" />}
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-20 lg:h-fit">
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.3}}
                className="rounded-2xl p-5 border" style={{background:`${L.color}0f`, borderColor:`${L.color}33`}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-bold"
                    style={{background:`${L.color}22`, color:L.color}}>{L.num}</div>
                  <div>
                    <div className="text-[14px] font-semibold text-white">{L.name}</div>
                    <div className="text-[11px]" style={{color:L.color}}>↔ Couche {L.osi}</div>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-gray-400">{L.detail}</p>
                <div className="mt-4 pt-4 flex flex-wrap gap-1.5" style={{borderTop:`1px solid ${L.color}22`}}>
                  {L.tags.map(t=>(
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-md font-mono"
                      style={{background:`${L.color}18`, color:L.color, border:`0.5px solid ${L.color}33`}}>{t}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
