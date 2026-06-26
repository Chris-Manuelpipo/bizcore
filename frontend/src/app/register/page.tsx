"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, AlertCircle } from "lucide-react";
import { SessionRedirect } from "@/components/auth/SessionRedirect";
import { registerDeveloper } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await registerDeveloper({ firstName, lastName, email, password });
      setAuth(data.token, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionRedirect>
      <div className="flex min-h-screen items-center justify-center px-4 pt-14 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg shadow-indigo-500/25">
              <UserPlus size={22} className="text-white" />
            </div>
            <h1 className="font-display text-[28px] font-extrabold tracking-tight">
              Créer un compte développeur
            </h1>
            <p className="mt-2 text-[14px]" style={{ color: "var(--text-muted)" }}>
              Inscrivez-vous pour provisionner des tenants et générer des clés API.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border p-6 sm:p-8"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {error && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px]"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  borderColor: "rgba(239,68,68,0.25)",
                  color: "#F87171",
                }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-[13px] font-medium">
                    Prénom
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-[14px] outline-none focus:border-indigo-500"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-[13px] font-medium">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-[14px] outline-none focus:border-indigo-500"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-[14px] outline-none focus:border-indigo-500"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 caractères minimum"
                    className="w-full rounded-xl border py-2.5 pl-10 pr-3 text-[14px] outline-none focus:border-indigo-500"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </SessionRedirect>
  );
}
