"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export function ChatPreview() {
  return (
    <section className="py-24 px-6 border-t border-[var(--glass-border)] bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6}}>
            <p className="text-[11.5px] font-semibold tracking-[1.6px] uppercase text-indigo-400 mb-3">BizCore AI</p>
            <h2 className="font-display text-[32px] font-bold tracking-tight text-[var(--text)] mb-4">
              Votre assistant<br/><span className="gradient-text">intelligent</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-6 text-[var(--text-muted)]">
              BizCore AI connaît toute la documentation de l'API. Posez vos questions en langage naturel, obtenez des exemples de code et des guides d'intégration.
            </p>
            <Link href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-medium transition-all hover:scale-[1.02]">
              Essayer BizCore AI →
            </Link>
          </motion.div>

          <motion.div initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.1}}
            className="rounded-2xl border border-[var(--glass-border)] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            style={{background:"#111118"}}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--glass-border)]" style={{background:"#16161F"}}>
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-[13px] font-bold">B</div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--text)]">BizCore AI</div>
                <div className="text-[10.5px] text-emerald-400">● En ligne</div>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                { role:"bot",  text:"Bonjour ! Je suis BizCore AI. Posez-moi vos questions sur l'API ou demandez-moi de vous guider dans votre intégration." },
                { role:"user", text:"Comment créer un ServiceRequest ?" },
                { role:"bot",  text:<span>Envoyez un <code className="text-[10.5px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-2)]">POST /api/service-requests</code> avec votre JWT et <code className="text-[10.5px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-2)]">X-Tenant-Id</code>. Statut initial : <code className="text-[10.5px] px-1.5 py-0.5 rounded font-mono bg-[var(--surface-2)]">PENDING</code>.</span> },
              ].map((msg,i)=>(
                <motion.div key={i} initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
                  transition={{delay:0.2+i*0.12,duration:0.4}} className={`max-w-[80%] ${msg.role==="user"?"self-end":"self-start"}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                    msg.role==="user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-[var(--surface-2)] border border-[var(--glass-border)] text-[var(--text-muted)] rounded-bl-sm"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="flex gap-2 items-center px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-2)]">
                <span className="flex-1 text-[12.5px] text-[var(--text-muted)]">Posez votre question…</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[12px]">→</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
