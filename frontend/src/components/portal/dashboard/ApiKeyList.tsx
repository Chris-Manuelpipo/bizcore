"use client";

import type { ApiKeySummary } from "@/lib/developerApi";
import { ApiKeyTable } from "@/components/portal/ApiKeyTable";
import { Section } from "@/components/portal/Section";

interface ApiKeyListProps {
  apiKeys: ApiKeySummary[];
  loading?: boolean;
  onRevoke: (id: string) => Promise<void>;
}

export function ApiKeyList({ apiKeys, loading, onRevoke }: ApiKeyListProps) {
  return (
    <Section title="Clés API">
      <ApiKeyTable apiKeys={apiKeys} loading={loading} onRevoke={onRevoke} />
    </Section>
  );
}
