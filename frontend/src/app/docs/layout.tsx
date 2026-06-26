"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Key } from "lucide-react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalShell } from "@/components/portal/PortalShell";
import { DocsNav } from "@/components/portal/docs/DocsNav";
import { useSidebar } from "@/components/SidebarContext";
import { useAuthStore } from "@/store/useAuthStore";

function DocsPortalFrame({ children }: { children: React.ReactNode }) {
  const { openSidebar } = useSidebar();
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "");
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  return (
    <>
      <PortalHeader
        title="Documentation"
        subtitle="Référence API BizCore"
        onMenuClick={openSidebar}
        actions={
          <Link href="/dashboard" className="btn-secondary hidden min-h-[36px] px-3 text-xs sm:inline-flex">
            <Key className="h-3.5 w-3.5" />
            Gérer mes clés
          </Link>
        }
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <DocsNav
          hash={hash}
          search={search}
          onSearchChange={setSearch}
          navOpen={navOpen}
          onNavOpenChange={setNavOpen}
          stickyTopClass="top-0"
        />
        <div className="min-w-0 flex-1 overflow-y-auto">
          <main
            id="portal-main"
            className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

function DocsPublicFrame({ children }: { children: React.ReactNode }) {
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "");
    onHash();
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col pt-14 lg:flex-row">
      <DocsNav
        hash={hash}
        search={search}
        onSearchChange={setSearch}
        navOpen={navOpen}
        onNavOpenChange={setNavOpen}
      />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { _hasHydrated, isSessionValid } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isAuthenticated = mounted && _hasHydrated && isSessionValid();

  if (isAuthenticated) {
    return (
      <PortalShell>
        <DocsPortalFrame>{children}</DocsPortalFrame>
      </PortalShell>
    );
  }

  return <DocsPublicFrame>{children}</DocsPublicFrame>;
}
