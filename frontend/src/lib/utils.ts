import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEndpoint(method: string, path: string) {
  return { method: method.toUpperCase(), path };
}

export function getMethodColor(method: string) {
  const colors: Record<string, string> = {
    GET: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    PUT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    PATCH: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return colors[method.toUpperCase()] ?? "text-gray-400 bg-gray-400/10";
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const relativeFormatter = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

export function formatDate(value?: string | null): string {
  if (!value) return "Jamais";
  return dateFormatter.format(new Date(value));
}

export function formatRelative(value?: string | null): string {
  if (!value) return "Jamais";
  const diffMs = new Date(value).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return relativeFormatter.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return relativeFormatter.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return relativeFormatter.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return relativeFormatter.format(diffDay, "day");
  return formatDate(value);
}
