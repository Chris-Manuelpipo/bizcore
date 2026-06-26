"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Redirige vers le dashboard si le développeur a une session JWT encore valide.
 * À placer sur les pages publiques d'entrée (accueil, connexion).
 */
export function SessionRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { _hasHydrated, token, isSessionValid, logout } = useAuthStore();

  const sessionValid = _hasHydrated && isSessionValid();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (sessionValid) {
      router.replace("/dashboard");
    } else if (token) {
      logout();
    }
  }, [_hasHydrated, sessionValid, token, logout, router]);

  if (!_hasHydrated || sessionValid) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-14">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--indigo)", borderTopColor: "transparent" }}
          aria-label="Chargement"
        />
      </div>
    );
  }

  return <>{children}</>;
}
