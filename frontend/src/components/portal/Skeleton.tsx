"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-[var(--color-surface-elevated)]", className)}
      aria-hidden
    />
  );
}

export function PortalPageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Chargement">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}
