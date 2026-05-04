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
