import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: { email: string; role: string } | null;
  setAuth: (token: string, tenantId: string, user: { email: string; role: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      setAuth: (token, tenantId, user) => set({ token, tenantId, user }),
      logout: () => set({ token: null, tenantId: null, user: null }),
    }),
    { name: "bizcore-auth" }
  )
);
