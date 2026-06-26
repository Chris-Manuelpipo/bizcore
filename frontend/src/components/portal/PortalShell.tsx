"use client";

import { useState } from "react";
import { SidebarContext } from "@/components/SidebarContext";
import { PortalSidebar } from "./PortalSidebar";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <a href="#portal-main" className="skip-link">
          Aller au contenu
        </a>
        <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <div className="flex min-h-screen flex-col">{children}</div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
