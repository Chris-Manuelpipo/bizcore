"use client";

import { useState } from "react";
import { Key } from "lucide-react";
import { Button } from "@/components/portal/Button";
import { FormField } from "@/components/portal/FormField";
import { Section } from "@/components/portal/Section";

interface ApiKeySectionProps {
  authOk: boolean;
  error: string | null;
  onCreate: (payload: {
    name: string;
    tenantName: string;
    tenantDomain: string;
    tenantDescription?: string;
  }) => Promise<void>;
}

export function ApiKeySection({ authOk, error, onCreate }: ApiKeySectionProps) {
  const [form, setForm] = useState({
    name: "",
    tenantName: "",
    tenantDomain: "",
    tenantDescription: "",
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreate({
        name: form.name,
        tenantName: form.tenantName,
        tenantDomain: form.tenantDomain,
        tenantDescription: form.tenantDescription || undefined,
      });
      setForm({ name: "", tenantName: "", tenantDomain: "", tenantDescription: "" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Section
      title="Nouvelle clé API"
      description="Crée le tenant et la clé en une étape."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="key-name" label="Nom de la clé" required error={error}>
          <input
            id="key-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="Production — app mobile"
            disabled={!authOk || creating}
          />
        </FormField>
        <FormField id="tenant-name" label="Nom du tenant" required>
          <input
            id="tenant-name"
            required
            value={form.tenantName}
            onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
            className="input"
            placeholder="Campharma"
            disabled={!authOk || creating}
          />
        </FormField>
        <FormField
          id="tenant-domain"
          label="Identifiant du tenant"
          required
          helper="Slug unique, ex. pharmacie-centrale"
        >
          <input
            id="tenant-domain"
            required
            value={form.tenantDomain}
            onChange={(e) => setForm({ ...form, tenantDomain: e.target.value })}
            className="input"
            placeholder="pharmacie-centrale"
            disabled={!authOk || creating}
          />
        </FormField>
        <FormField id="tenant-description" label="Description (optionnelle)">
          <input
            id="tenant-description"
            value={form.tenantDescription}
            onChange={(e) => setForm({ ...form, tenantDescription: e.target.value })}
            className="input"
            placeholder="Instance pharmacie du groupe central"
            disabled={!authOk || creating}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={!authOk || creating} loading={creating}>
          <Key className="h-4 w-4" />
          Générer la clé
        </Button>
      </form>
    </Section>
  );
}
