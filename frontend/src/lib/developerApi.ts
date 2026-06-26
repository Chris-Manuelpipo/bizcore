import { apiClient, API_BASE } from "./api";

export interface DeveloperProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface DeveloperTenant {
  id: string;
  name: string;
  domain: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface ApiKeySummary {
  id: string;
  name: string;
  keyPrefix: string;
  tenantId: string;
  tenantName: string;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt?: string;
  active: boolean;
}

export interface CreateApiKeyResult {
  apiKey: ApiKeySummary;
  secretKey: string;
}

export interface DeveloperPortalData {
  profile: DeveloperProfile;
  tenants: DeveloperTenant[];
  apiKeys: ApiKeySummary[];
}

export interface BackendHealthResult {
  reachable: boolean;
  healthy: boolean;
  status?: string;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 401) return "Session expirée — reconnectez-vous.";
    if (status === 403) return "Accès refusé — compte développeur requis.";
  }
  return fallback;
}

export const developerApi = {
  async checkBackendHealth(): Promise<BackendHealthResult> {
    try {
      const res = await fetch("/api/backend-health", { cache: "no-store" });
      const data = (await res.json()) as BackendHealthResult;
      return {
        reachable: data.reachable === true,
        healthy: data.healthy === true,
        status: data.status,
      };
    } catch {
      return { reachable: false, healthy: false };
    }
  },

  async getMe(): Promise<DeveloperProfile> {
    const { data } = await apiClient.get<DeveloperProfile>("/api/developer/me");
    return data;
  },

  async loadPortal(): Promise<DeveloperPortalData> {
    const [profile, tenants, apiKeys] = await Promise.all([
      developerApi.getMe(),
      developerApi.getTenants(),
      developerApi.getApiKeys(),
    ]);
    return { profile, tenants, apiKeys };
  },

  async getTenants(): Promise<DeveloperTenant[]> {
    const { data } = await apiClient.get<DeveloperTenant[]>("/api/developer/tenants");
    return data;
  },

  async createTenant(payload: {
    name: string;
    domain: string;
    description?: string;
  }): Promise<DeveloperTenant> {
    const { data } = await apiClient.post<DeveloperTenant>("/api/developer/tenants", payload);
    return data;
  },

  async getApiKeys(): Promise<ApiKeySummary[]> {
    const { data } = await apiClient.get<ApiKeySummary[]>("/api/developer/api-keys");
    return data;
  },

  async createApiKey(payload: {
    name: string;
    tenantName: string;
    tenantDomain: string;
    tenantDescription?: string;
    expiresInDays?: number;
  }): Promise<CreateApiKeyResult> {
    const { data } = await apiClient.post<CreateApiKeyResult>("/api/developer/api-keys", payload);
    return data;
  },

  async revokeApiKey(id: string): Promise<void> {
    await apiClient.delete(`/api/developer/api-keys/${id}`);
  },

  extractErrorMessage,
};
