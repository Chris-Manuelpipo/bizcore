package com.bizcore.bizcore_backend.security;

import java.util.UUID;

/**
 * TenantContext — Analogie réseau : VLAN courant de la requête.
 *
 * Stocke l'UUID du tenant actif dans un ThreadLocal pour la durée
 * exacte d'une requête HTTP. Chaque thread de traitement a sa propre
 * copie isolée, garantissant l'absence de fuite inter-tenant.
 *
 * Cycle de vie :
 *   TenantFilter.doFilterInternal()  → setTenantId()
 *   (traitement de la requête)
 *   TenantFilter.finally block       → clear()   ← OBLIGATOIRE
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();

    private TenantContext() {
        // Classe utilitaire — pas d'instanciation
    }

    /**
     * Définit le tenant actif pour le thread courant.
     * Appelé exclusivement par TenantFilter.
     */
    public static void setTenantId(UUID tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Retourne l'UUID du tenant actif, ou null si aucun n'est défini
     * (requête non authentifiée ou endpoint public).
     */
    public static UUID getTenantId() {
        return CURRENT_TENANT.get();
    }

    /**
     * Libère le ThreadLocal. DOIT être appelé en bloc finally
     * pour éviter les fuites mémoire sur les serveurs à pool de threads.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
