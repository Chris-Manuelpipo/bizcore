"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "javascript", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-[var(--color-border)]", className)}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2">
        <span className="font-mono text-xs text-[var(--color-text-muted)]">{language}</span>
        <button
          type="button"
          onClick={copy}
          className="btn-ghost min-h-[36px] px-2 py-1 text-xs"
          aria-label={copied ? "Copié" : "Copier le code"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[var(--color-success)]" />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copier
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[var(--color-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-text)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
