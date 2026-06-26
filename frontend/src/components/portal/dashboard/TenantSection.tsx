"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import type { DeveloperTenant } from "@/lib/developerApi";
import { Button } from "@/components/portal/Button";
import { EmptyState } from "@/components/portal/EmptyState";
import { FormField } from "@/components/portal/FormField";
import { Section } from "@/components/portal/Section";

interface TenantSectionProps {
  tenants: DeveloperTenant[];
  authOk: boolean;
  error: string | null;
  onCreate: (payload: { name: string; domain: string; description?: string }) => Promise<void>;
}

export function TenantSection({ tenants, authOk, error, onCreate }: TenantSectionProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreate({ name, domain });
      setName("");
      setDomain("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Section
      title="Tenants"
      description="Chaque clé API est rattachée à un tenant (instance métier isolée)."
    >
      {tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun tenant"
          description="Créez votre premier tenant pour pouvoir générer une clé API."
        />
      ) : (
        <ul className="mb-4 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
          {tenants.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 px-4 py-3 first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="font-medium text-[var(--color-text)]">{t.name}</span>
              <span className="font-mono text-xs text-[var(--color-text-muted)]">{t.domain}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 border-t border-[var(--color-border)] pt-4">
        <FormField id="tenant-name" label="Nom du tenant" required error={error}>
          <input
            id="tenant-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Pharmacie Centrale"
            disabled={!authOk || creating}
          />
        </FormField>
        <FormField
          id="tenant-domain"
          label="Domaine"
          required
          helper="Identifiant unique, ex. pharmacie-centrale"
        >
          <input
            id="tenant-domain"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="input font-mono text-sm"
            placeholder="pharmacie-centrale"
            disabled={!authOk || creating}
          />
        </FormField>
        <Button type="submit" disabled={!authOk || creating} loading={creating}>
          <Plus className="h-4 w-4" />
          Créer un tenant
        </Button>
      </form>
    </Section>
  );
}
