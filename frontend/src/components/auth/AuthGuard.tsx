"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { _hasHydrated, isSessionValid, logout } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isSessionValid()) {
      logout();
      router.replace("/login");
    }
  }, [_hasHydrated, isSessionValid, logout, router]);

  if (!_hasHydrated || !isSessionValid()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--indigo)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
