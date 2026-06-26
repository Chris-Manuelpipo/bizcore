"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { ApiKeySummary } from "@/lib/developerApi";
import { CopyableId } from "@/components/dashboard/CopyableId";
import { cn, formatDate, formatRelative } from "@/lib/utils";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { Key } from "lucide-react";

interface ApiKeyTableProps {
  apiKeys: ApiKeySummary[];
  loading?: boolean;
  onRevoke: (id: string) => Promise<void>;
}

export function ApiKeyTable({ apiKeys, loading, onRevoke }: ApiKeyTableProps) {
  const [revokeTarget, setRevokeTarget] = useState<ApiKeySummary | null>(null);
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await onRevoke(revokeTarget.id);
    } finally {
      setRevoking(false);
      setRevokeTarget(null);
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">Chargement…</p>;
  }

  if (apiKeys.length === 0) {
    return (
      <EmptyState
        icon={Key}
        title="Aucune clé API"
        description="Remplissez le formulaire « Nouvelle clé API » pour créer votre premier tenant."
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              {["Nom", "Tenant", "Préfixe", "Créée", "Dernière utilisation", ""].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {apiKeys.map((k) => (
              <ApiKeyRow key={k.id} apiKey={k} onRevokeClick={() => setRevokeTarget(k)} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden divide-y divide-[var(--color-border)]">
        {apiKeys.map((k) => (
          <li key={k.id} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-[var(--color-text)]">{k.name}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{k.tenantName}</p>
                <CopyableId value={k.tenantId} compact />
              </div>
              {k.active ? (
                <span className="badge-success">Actif</span>
              ) : (
                <span className="badge-danger">Révoquée</span>
              )}
            </div>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">{k.keyPrefix}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Dernière utilisation :{" "}
              <span
                className={k.lastUsedAt ? "text-[var(--color-success)]" : undefined}
                title={k.lastUsedAt ? formatDate(k.lastUsedAt) : undefined}
              >
                {formatRelative(k.lastUsedAt)}
              </span>
            </p>
            {k.active && (
              <Button
                variant="danger"
                className="w-full text-xs"
                onClick={() => setRevokeTarget(k)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Révoquer
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Révoquer cette clé ?"
        description={
          revokeTarget
            ? `La clé « ${revokeTarget.name} » sera invalidée. Les applications qui l'utilisent perdront l'accès immédiatement.`
            : ""
        }
        confirmLabel="Révoquer"
        destructive
        loading={revoking}
        onConfirm={handleRevoke}
      />
    </>
  );
}

function ApiKeyRow({
  apiKey: k,
  onRevokeClick,
}: {
  apiKey: ApiKeySummary;
  onRevokeClick: () => void;
}) {
  return (
    <tr className="hover:bg-[var(--color-surface-elevated)]/50">
      <td className="px-4 py-3">
        <span className="font-medium text-[var(--color-text)]">{k.name}</span>
        {!k.active && <span className="badge-danger ml-2">Révoquée</span>}
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          <span className="text-sm text-[var(--color-text-muted)]">{k.tenantName}</span>
          <CopyableId value={k.tenantId} compact />
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">{k.keyPrefix}</td>
      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] tabular-nums">
        {formatDate(k.createdAt)}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={cn(k.lastUsedAt && "text-[var(--color-success)]")}
          title={k.lastUsedAt ? formatDate(k.lastUsedAt) : undefined}
        >
          {formatRelative(k.lastUsedAt)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {k.active && (
          <button
            type="button"
            onClick={onRevokeClick}
            className="btn-ghost min-h-[44px] inline-flex items-center gap-1 px-2 text-xs text-[var(--color-danger)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Révoquer
          </button>
        )}
      </td>
    </tr>
  );
}
