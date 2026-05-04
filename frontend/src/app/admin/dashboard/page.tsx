"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Users, Package, FileText, TrendingUp,
  Activity, Clock, CheckCircle, XCircle, LogOut,
} from "lucide-react";

const MOCK_STATS = [
  { label: "Tenants actifs",    value: "4",   icon: Users,       trend: "+1 ce mois",  color: "#6366F1" },
  { label: "Services créés",    value: "79",  icon: Package,     trend: "+12 ce mois", color: "#06B6D4" },
  { label: "Demandes totales",  value: "504", icon: FileText,    trend: "+89 ce mois", color: "#A78BFA" },
  { label: "Revenus (XAF)",     value: "2.4M",icon: TrendingUp,  trend: "+18% ce mois",color: "#34D399" },
];

const MOCK_REQUESTS = [
  { id: "SR-001", tenant: "Pharmacie 💊",  service: "Consultation",     status: "PAID",        amount: "25 000" },
  { id: "SR-002", tenant: "Bookstore 📚",  service: "Livraison express", status: "IN_PROGRESS", amount: "5 000"  },
  { id: "SR-003", tenant: "Assurance 🏥",  service: "Déclaration sinistre",status: "PENDING",   amount: "50 000" },
  { id: "SR-004", tenant: "Tourisme ✈️",   service: "Réservation vol",  status: "FULFILLED",   amount: "120 000"},
  { id: "SR-005", tenant: "Pharmacie 💊",  service: "Ordonnance",       status: "ACCEPTED",    amount: "15 000" },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  PENDING:     { color: "#FCD34D", bg: "rgba(252,211,77,.1)",  border: "rgba(252,211,77,.25)"  },
  ACCEPTED:    { color: "#60A5FA", bg: "rgba(96,165,250,.1)",  border: "rgba(96,165,250,.25)"  },
  IN_PROGRESS: { color: "#A78BFA", bg: "rgba(167,139,250,.1)", border: "rgba(167,139,250,.25)" },
  FULFILLED:   { color: "#34D399", bg: "rgba(52,211,153,.1)",  border: "rgba(52,211,153,.25)"  },
  PAID:        { color: "#4F46E5", bg: "rgba(79,70,229,.1)",   border: "rgba(79,70,229,.25)"   },
  CANCELLED:   { color: "#F87171", bg: "rgba(248,113,113,.1)", border: "rgba(248,113,113,.25)" },
};

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/admin/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-[32px] font-extrabold tracking-tight">Dashboard Admin</h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
              Connecté en tant que <strong>{user.email}</strong>
            </p>
          </div>
          <button onClick={() => { logout(); router.push("/admin/login"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] transition-all hover:bg-red-400/10 hover:border-red-400/30 hover:text-red-400"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="p-5 rounded-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18` }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(52,211,153,.08)", color: "#34D399" }}>
                  {s.trend}
                </span>
              </div>
              <div className="font-display text-[28px] font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
                {s.value}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Status overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 p-5 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-semibold text-[15px]">Dernières demandes</h2>
            </div>
            <div className="space-y-2">
              {MOCK_REQUESTS.map((r) => {
                const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                    <span className="text-[11px] font-mono w-14 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{r.id}</span>
                    <span className="text-[12.5px] flex-1 truncate">{r.tenant}</span>
                    <span className="text-[12px] flex-1 truncate" style={{ color: "var(--text-muted)" }}>{r.service}</span>
                    <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>{r.amount} XAF</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0"
                      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick status */}
          <div className="p-5 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} style={{ color: "var(--text-muted)" }} />
              <h2 className="font-semibold text-[15px]">Statuts globaux</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "En attente",   count: 87,  icon: Clock,         color: "#FCD34D" },
                { label: "En cours",     count: 34,  icon: Activity,      color: "#A78BFA" },
                { label: "Terminées",    count: 332, icon: CheckCircle,   color: "#34D399" },
                { label: "Annulées",     count: 51,  icon: XCircle,       color: "#F87171" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <s.icon size={13} style={{ color: s.color }} />
                  <span className="text-[13px] flex-1" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                  <span className="font-display font-bold text-[16px]" style={{ color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="text-[11.5px] mb-2" style={{ color: "var(--text-muted)" }}>Taux de complétion</div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65.8%" }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-brand"
                />
              </div>
              <div className="text-[11px] mt-1 text-right" style={{ color: "#34D399" }}>65.8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
