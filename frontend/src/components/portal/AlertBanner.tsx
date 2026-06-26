"use client";

import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  live?: boolean;
}

const styles: Record<AlertVariant, { border: string; bg: string; icon: typeof AlertCircle; color: string }> = {
  error: {
    border: "oklch(0.62 0.22 25 / 0.3)",
    bg: "oklch(0.62 0.22 25 / 0.08)",
    icon: AlertCircle,
    color: "var(--color-danger)",
  },
  warning: {
    border: "oklch(0.78 0.14 85 / 0.35)",
    bg: "oklch(0.78 0.14 85 / 0.08)",
    icon: AlertTriangle,
    color: "var(--color-warning)",
  },
  success: {
    border: "oklch(0.72 0.17 155 / 0.3)",
    bg: "oklch(0.72 0.17 155 / 0.08)",
    icon: CheckCircle2,
    color: "var(--color-success)",
  },
  info: {
    border: "oklch(0.51 0.22 275 / 0.3)",
    bg: "oklch(0.51 0.22 275 / 0.08)",
    icon: AlertCircle,
    color: "var(--color-primary)",
  },
};

export function AlertBanner({
  variant = "info",
  title,
  children,
  className,
  live,
}: AlertBannerProps) {
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div
      className={cn("rounded-xl border px-4 py-3", className)}
      style={{ borderColor: s.border, background: s.bg }}
      role={variant === "error" ? "alert" : undefined}
      aria-live={live ? "polite" : undefined}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: s.color }} aria-hidden />
        <div className="min-w-0 text-sm">
          {title && (
            <p className="font-medium mb-1" style={{ color: s.color }}>
              {title}
            </p>
          )}
          <div className="text-[var(--color-text-muted)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
