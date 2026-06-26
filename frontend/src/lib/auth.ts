import { API_BASE } from "./config";

export interface DeveloperAuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface JwtPayload {
  exp?: number;
  tenantId?: string;
  principalType?: string;
  developerId?: string;
}

export function parseJwt(token: string): JwtPayload {
  const base64Url = token.split(".")[1];
  if (!base64Url) throw new Error("Token JWT invalide");
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64)) as JwtPayload;
}

export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const { exp } = parseJwt(token);
    if (!exp) return false;
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function isDeveloperToken(token: string): boolean {
  try {
    return parseJwt(token).principalType === "DEVELOPER";
  } catch {
    return false;
  }
}

export async function loginDeveloper(
  email: string,
  password: string,
): Promise<DeveloperAuthResponse> {
  const res = await fetch(`${API_BASE}/api/dev-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Email ou mot de passe incorrect.");
    throw new Error("Connexion impossible. Réessayez plus tard.");
  }

  return res.json() as Promise<DeveloperAuthResponse>;
}

export async function registerDeveloper(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<DeveloperAuthResponse> {
  const res = await fetch(`${API_BASE}/api/dev-auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 409) throw new Error("Cet email est déjà utilisé.");
    throw new Error("Inscription impossible. Réessayez plus tard.");
  }

  return res.json() as Promise<DeveloperAuthResponse>;
}
