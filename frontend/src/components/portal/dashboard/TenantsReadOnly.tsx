"use client";

import type { DeveloperTenant } from "@/lib/developerApi";
import { CopyableId } from "@/components/dashboard/CopyableId";

interface TenantsReadOnlyProps {
  tenants: DeveloperTenant[];
}

export function TenantsReadOnly({ tenants }: TenantsReadOnlyProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--color-text)]">IDs tenant</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Requis pour le champ{" "}
          <code className="font-mono text-xs text-[var(--color-primary)]">tenantId </code> à
          l&apos;inscription des utilisateurs métier.
        </p>
      </div>

      <ul className="divide-y divide-[var(--color-border)]">
        {tenants.map((t) => (
            <li key={t.id} className="px-5 py-3.5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-text)]">{t.name}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t.description}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
                  {t.domain}
                </span>
              </div>
              <div className="mt-2">
                <CopyableId value={t.id} />
              </div>
            </li>
          ))}
        </ul>
    </div>
  );
}
