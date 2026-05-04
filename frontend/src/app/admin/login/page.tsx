"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/api";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/api/auth/login", { email, password });
      setAuth(res.data.token, tenantId, { email, role: "ADMIN" });
      router.push("/admin/dashboard");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #4F46E5 0%, transparent 70%)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="font-display text-[24px] font-bold">Admin BizCore</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>Connectez-vous à votre espace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[12.5px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              placeholder="admin@bizcore.io"
              className="w-full px-4 py-2.5 rounded-xl border text-[13.5px] outline-none focus:border-[var(--indigo)] transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>
          <div>
            <label className="text-[12.5px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Mot de passe</label>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPwd ? "text" : "password"} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border text-[13.5px] outline-none focus:border-[var(--indigo)] transition-colors"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[12.5px] font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Tenant ID (optionnel)</label>
            <input value={tenantId} onChange={(e) => setTenantId(e.target.value)}
              placeholder="550e8400-e29b-41d4-..."
              className="w-full px-4 py-2.5 rounded-xl border text-[13.5px] font-mono outline-none focus:border-[var(--indigo)] transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[12.5px] text-red-400 text-center">{error}</motion.p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--indigo)] hover:bg-[#4338CA] text-white text-[14px] font-semibold transition-all disabled:opacity-60 hover:scale-[1.01]">
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
