'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyableIdProps {
  value: string;
  /** Afficher les 8 premiers et 4 derniers caractères sur mobile */
  compact?: boolean;
  className?: string;
}

function displayValue(value: string, compact: boolean) {
  if (!compact || value.length <= 20) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export function CopyableId({ value, compact = false, className = '' }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-center gap-1.5 min-w-0 ${className}`}>
      <code
        className="text-xs font-mono text-[var(--color-text-muted)] truncate"
        title={value}
      >
        {displayValue(value, compact)}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copier l'identifiant"
        className="shrink-0 p-1 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
