"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CopyableId } from "@/components/dashboard/CopyableId";
import { AlertBanner } from "./AlertBanner";
import { Button } from "./Button";

interface SecretRevealProps {
  secret: string;
  tenantId?: string | null;
  onDismiss: () => void;
}

export function SecretReveal({ secret, tenantId, onDismiss }: SecretRevealProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AlertBanner variant="warning" title="Clé générée : copiez-la maintenant" live>
      <p className="mb-3">
        Collez-la dans votre app via l&apos;en-tête{" "}
        <code className="font-mono text-[var(--color-primary)]">X-Api-Key</code>. BizCore ne
        l&apos;affichera plus.
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
        <code className="flex-1 break-all font-mono text-sm text-[var(--color-text)]">{secret}</code>
        <button
          type="button"
          onClick={copy}
          className="btn-ghost min-h-[44px] min-w-[44px] shrink-0 p-2"
          aria-label={copied ? "Copié" : "Copier la clé"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--color-success)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {copied && (
        <p className="mt-2 text-xs text-[var(--color-success)]" aria-live="polite">
          Copié dans le presse-papiers
        </p>
      )}
      {tenantId && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-[var(--color-text-muted)]">
            ID tenant pour{" "}
            <code className="font-mono text-[var(--color-primary)]">tenantId</code> à
            l&apos;inscription utilisateur.
          </p>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
            <CopyableId value={tenantId} className="w-full" />
          </div>
        </div>
      )}
      <Button variant="ghost" className="mt-3" onClick={onDismiss}>
        J&apos;ai copié la clé
      </Button>
    </AlertBanner>
  );
}
