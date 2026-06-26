'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { PortalShell } from '@/components/portal/PortalShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PortalShell>{children}</PortalShell>
    </AuthGuard>
  );
}
