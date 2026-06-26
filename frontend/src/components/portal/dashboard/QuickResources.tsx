"use client";

import Link from "next/link";
import { BookOpen, ExternalLink, Rocket, Terminal } from "lucide-react";
import { API_BASE } from "@/lib/config";

const links = [
  {
    href: "/guides/premier-appel-api",
    label: "Premier appel API",
    description: "Guide pas à pas avec curl",
    icon: Rocket,
    external: false,
  },
  {
    href: "/docs",
    label: "Référence API",
    description: "Endpoints et exemples de payloads",
    icon: BookOpen,
    external: false,
  },
  {
    href: `${API_BASE}/swagger-ui.html`,
    label: "Swagger UI",
    description: "Contrat OpenAPI interactif",
    icon: Terminal,
    external: true,
  },
];

export function QuickResources() {
  return (
    <div className="panel p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-[var(--color-text)]">Aide</h2>
      <ul className="mt-3 space-y-0.5">
        {links.map((item) => {
          const Icon = item.icon;
          const className =
            "flex min-h-[44px] items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--color-surface-elevated)]";

          const content = (
            <>
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                  {item.label}
                  {item.external && (
                    <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden />
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                  {item.description}
                </span>
              </span>
            </>
          );

          return (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link href={item.href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
