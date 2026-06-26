import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isDeveloperToken, isTokenValid } from "@/lib/auth";

const TOKEN_KEY = "bizcore_token";

interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isDeveloper: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isSessionValid: () => boolean;
}

function syncToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isDeveloper: false,
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setAuth: (token, user) => {
        syncToken(token);
        set({
          token,
          user,
          isDeveloper: isDeveloperToken(token),
        });
      },
      logout: () => {
        syncToken(null);
        set({ token: null, user: null, isDeveloper: false });
      },
      isSessionValid: () => {
        const token = get().token;
        if (!token) return false;
        return isTokenValid(token) && isDeveloperToken(token);
      },
    }),
    {
      name: "bizcore-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isDeveloper: state.isDeveloper,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          syncToken(state.token);
          state.isDeveloper = isDeveloperToken(state.token);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
