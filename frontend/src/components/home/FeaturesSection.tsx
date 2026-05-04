"use client";
import { motion } from "framer-motion";

const FEATURES = [
  { icon:"🏢", title:"Multi-tenant natif",    desc:"Isolation complète par tenant via X-Tenant-Id. Chaque instance configure son propre espace de données sans interférence.", bg:"bg-indigo-400/10" },
  { icon:"🔐", title:"Sécurité JWT",           desc:"Authentification par token JWT avec gestion fine des rôles PROVIDER, CONSUMER et ADMIN par tenant.",                   bg:"bg-cyan-400/10"   },
  { icon:"⚡", title:"Workflow complet",       desc:"Cycle de vie ServiceRequest de PENDING à PAID. Transitions d'état contrôlées, traçables et extensibles.",               bg:"bg-orange-400/10" },
  { icon:"📊", title:"Facturation intégrée",   desc:"Génération automatique de factures à l'accomplissement d'un service. Gestion du cycle de paiement incluse.",             bg:"bg-emerald-400/10"},
  { icon:"🧠", title:"Règles métier",          desc:"Configurez des règles spécifiques par tenant sans modifier le code source de la plateforme.",                            bg:"bg-violet-400/10" },
  { icon:"📡", title:"Event-driven",           desc:"Bus événementiel Kafka pour découpler les composants. Audit, notifications et analytics en temps réel.",                  bg:"bg-yellow-400/10" },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-[#0A0A0F]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="text-center mb-14">
          <p className="text-[11.5px] font-semibold tracking-[1.6px] uppercase text-indigo-400 mb-3">Fonctionnalités</p>
          <h2 className="font-display text-[32px] font-bold tracking-tight text-white">Tout ce dont un métier a besoin</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f,i) => (
            <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              transition={{delay:i*0.07,duration:0.5}} whileHover={{y:-4,transition:{duration:0.2}}}
              className="p-5 rounded-2xl border border-white/[0.07] bg-[#111118] cursor-default group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[17px] mb-4 transition-transform duration-200 group-hover:scale-110 ${f.bg}`}>{f.icon}</div>
              <h3 className="text-[14px] font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-[12.5px] leading-relaxed text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
