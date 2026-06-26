"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  ok: boolean | null;
  label: string;
  loading?: boolean;
  className?: string;
}

export function StatusPill({ ok, label, loading, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={{
        borderColor:
          loading || ok === null
            ? "var(--color-border)"
            : ok
              ? "oklch(0.72 0.17 155 / 0.35)"
              : "oklch(0.62 0.22 25 / 0.35)",
        background:
          loading || ok === null
            ? "var(--color-surface-elevated)"
            : ok
              ? "oklch(0.72 0.17 155 / 0.08)"
              : "oklch(0.62 0.22 25 / 0.08)",
        color:
          loading || ok === null
            ? "var(--color-text-muted)"
            : ok
              ? "var(--color-success)"
              : "var(--color-danger)",
      }}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      ) : ok ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden />
      )}
      {label}
    </span>
  );
}
