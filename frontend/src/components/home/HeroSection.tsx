"use client";
import { useRef, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";

function WireShape({ geometry, position, color, speed }: {
  geometry: THREE.BufferGeometry;
  position: [number,number,number];
  color: string;
  speed: [number,number,number];
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    ref.current.rotation.x += speed[0];
    ref.current.rotation.y += speed[1];
    ref.current.rotation.z += speed[2];
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={position} geometry={geometry}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

function Scene() {
  const shapes = [
    { geo: new THREE.IcosahedronGeometry(0.75,0), pos:[-3,1.3,-1]    as [number,number,number], color:"#4F46E5", spd:[0.004,0.006,0.002] as [number,number,number] },
    { geo: new THREE.OctahedronGeometry(0.55,0),  pos:[3,0.9,-0.5]   as [number,number,number], color:"#06B6D4", spd:[0.005,0.003,0.007] as [number,number,number] },
    { geo: new THREE.TetrahedronGeometry(0.45,0), pos:[-2.5,-1.6,0.3]as [number,number,number], color:"#818CF8", spd:[0.007,0.004,0.005] as [number,number,number] },
    { geo: new THREE.IcosahedronGeometry(0.4,0),  pos:[2.9,-1.2,-0.4]as [number,number,number], color:"#22D3EE", spd:[0.003,0.007,0.004] as [number,number,number] },
    { geo: new THREE.OctahedronGeometry(0.32,0),  pos:[0.6,2,-1.2]   as [number,number,number], color:"#6366F1", spd:[0.006,0.005,0.008] as [number,number,number] },
    { geo: new THREE.TetrahedronGeometry(0.28,0), pos:[-0.4,-2.2,0.5]as [number,number,number], color:"#A78BFA", spd:[0.005,0.008,0.003] as [number,number,number] },
  ];
  return (
    <>
      <ambientLight intensity={0.5} />
      {shapes.map((s,i) => <WireShape key={i} geometry={s.geo} position={s.pos} color={s.color} speed={s.spd} />)}
    </>
  );
}

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    type Pt = { x:number; y:number; vx:number; vy:number; r:number; o:number };
    const pts: Pt[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    const init = () => {
      pts.length = 0;
      for (let i=0;i<55;i++) pts.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28, r:Math.random()*1.4+.4, o:Math.random()*.35+.1 });
    };
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach((p,i) => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0;
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(99,102,241,${p.o})`; ctx.fill();
        pts.slice(i+1).forEach(p2 => {
          const dx=p.x-p2.x,dy=p.y-p2.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<90){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.strokeStyle=`rgba(99,102,241,${(1-d/90)*.12})`; ctx.lineWidth=.5; ctx.stroke(); }
        });
      });
      raf=requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    window.addEventListener("resize",()=>{resize();init();});
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function HeroSection() {
  const stagger = {
    container: { animate:{ transition:{ staggerChildren:0.1 } } },
    item: { initial:{opacity:0,y:20}, animate:{opacity:1,y:0,transition:{duration:0.6,ease:[0.22,1,0.36,1] as const}} },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden bg-[var(--bg)]">
      {/* Particles */}
      <ParticleCanvas />

      {/* Three.js shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{opacity:0.55}}>
        <Canvas camera={{ position:[0,0,5], fov:60 }} gl={{ alpha:true }}>
          <Suspense fallback={null}><Scene /></Suspense>
        </Canvas>
      </div>

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background:"radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)" }} />

      {/* Content */}
      <motion.div className="relative z-10 max-w-[680px]" variants={stagger.container} initial="initial" animate="animate">
        <motion.div variants={stagger.item}>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-[12px] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            API v1.0 — Multi-tenant · Spring Boot · REST
          </span>
        </motion.div>

        <motion.h1 variants={stagger.item}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-1.5px] sm:tracking-[-2.5px] leading-[1.07] mb-5 text-[var(--text)]">
          Le noyau métier<br />
          <span className="gradient-text">pour tout métier</span>
        </motion.h1>

        <motion.p variants={stagger.item} className="text-[17px] leading-relaxed mb-8 max-w-[500px] mx-auto text-[var(--text-muted)]">
          BizCore abstrait les briques communes — acteurs, ressources, workflows, facturation — en un socle API réutilisable, générique et multi-tenant.
        </motion.p>

        <motion.div variants={stagger.item} className="flex items-center gap-3 justify-center flex-wrap">
          <Link href="/docs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10M6.5 1.5l5 5-5 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Voir la documentation
          </Link>
          <Link href="/demo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-2)] text-[var(--text)] text-[14px] font-medium transition-all hover:scale-[1.02] hover:bg-[var(--surface-2)]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 4.5L1 6.5l1.5 2M10.5 4.5L12 6.5l-1.5 2M7.5 1.5l-2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Explorer les exemples
          </Link>
        </motion.div>
      </motion.div>

      {/* API Card */}
      <motion.div
        initial={{ opacity:0, y:30, scale:0.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        transition={{ delay:0.6, duration:0.7, ease:[0.22,1,0.36,1] as const }}
        className="relative z-10 mt-12 max-w-[520px] w-full mx-auto rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
        style={{ background:"#111118" }}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--glass-border)]" style={{ background:"#16161F" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          <span className="ml-2 text-[11px] font-mono text-[var(--text-muted)]">POST /api/service-requests</span>
        </div>
        <div className="p-4 font-mono text-[11.5px] leading-relaxed bg-[var(--bg)]">
          <div><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">1</span><span className="text-violet-400">POST</span><span className="text-emerald-400"> /api/service-requests</span></div>
          <div><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">2</span><span className="text-[var(--text-muted)]">{"// Headers requis"}</span></div>
          <div><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">3</span><span className="text-blue-400">Authorization</span><span className="text-[var(--text-muted)]">: </span><span className="text-emerald-400">Bearer &lt;JWT&gt;</span></div>
          <div><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">4</span><span className="text-blue-400">X-Tenant-Id</span><span className="text-[var(--text-muted)]">: </span><span className="text-amber-400">550e8400-e29b-41d4</span></div>
          <div><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">5</span><span className="text-blue-400">Content-Type</span><span className="text-[var(--text-muted)]">: </span><span className="text-emerald-400">application/json</span></div>
          <div className="mt-2"><span className="opacity-30 mr-3 text-[10.5px] text-[var(--text-muted)]">7</span><span className="text-[var(--text)]">{"{ "}</span><span className="text-blue-400">"serviceId"</span><span className="text-[var(--text)]">: </span><span className="text-emerald-400">"uuid"</span><span className="text-[var(--text)]">{", "}</span><span className="text-blue-400">"consumerId"</span><span className="text-[var(--text)]">: </span><span className="text-emerald-400">"uuid"</span><span className="text-[var(--text)]">{" }"}</span></div>
          <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">201 Created</span>
            <span className="text-[11px] text-[var(--text-muted)]">ServiceRequest {"{"} status: PENDING {"}"}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
