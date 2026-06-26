"use client";

import { useCallback, useState } from "react";
import {
  developerApi,
  type ApiKeySummary,
  type DeveloperTenant,
} from "@/lib/developerApi";
import { API_BASE } from "@/lib/config";

export function useDeveloperPortal() {
  const [authOk, setAuthOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<string | null>(null);

  const [tenants, setTenants] = useState<DeveloperTenant[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeySummary[]>([]);

  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [revealedTenantId, setRevealedTenantId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const health = await developerApi.checkBackendHealth();

    if (!health.reachable) {
      setAuthOk(false);
      setLoading(false);
      setError(
        `Backend injoignable (${API_BASE}). Démarrez Spring Boot et vérifiez NEXT_PUBLIC_API_URL.`,
      );
      return;
    }

    try {
      const data = await developerApi.loadPortal();
      setTenants(data.tenants);
      setApiKeys(data.apiKeys);
      setAuthOk(true);
    } catch (err) {
      setAuthOk(false);
      setError(developerApi.extractErrorMessage(err, "Impossible de charger le portail développeur."));
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = async (payload: {
    name: string;
    tenantName: string;
    tenantDomain: string;
    tenantDescription?: string;
  }) => {
    setKeyError(null);
    try {
      const result = await developerApi.createApiKey(payload);
      setRevealedSecret(result.secretKey);
      setRevealedTenantId(result.apiKey.tenantId);
      await load();
      return result;
    } catch (err) {
      const msg = developerApi.extractErrorMessage(
        err,
        "Génération de la clé API impossible (nom de tenant peut-être déjà pris).",
      );
      setKeyError(msg);
      throw err;
    }
  };

  const revokeApiKey = async (id: string) => {
    setError(null);
    try {
      await developerApi.revokeApiKey(id);
      await load();
    } catch (err) {
      setError(developerApi.extractErrorMessage(err, "Révocation impossible."));
      throw err;
    }
  };

  const dismissSecret = () => {
    setRevealedSecret(null);
    setRevealedTenantId(null);
  };

  return {
    authOk,
    loading,
    error,
    keyError,
    tenants,
    apiKeys,
    revealedSecret,
    revealedTenantId,
    dismissSecret,
    load,
    createApiKey,
    revokeApiKey,
    clearKeyError: () => setKeyError(null),
  };
}
