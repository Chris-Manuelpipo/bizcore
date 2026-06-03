'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SidebarContext } from '@/components/SidebarContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="min-h-screen bg-[var(--surface-2)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64">
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
