'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { AlertBanner } from '@/components/portal/AlertBanner';
import { SecretReveal } from '@/components/portal/SecretReveal';
import { ApiKeyList } from '@/components/portal/dashboard/ApiKeyList';
import { ApiKeySection } from '@/components/portal/dashboard/ApiKeySection';
import { QuickResources } from '@/components/portal/dashboard/QuickResources';
import { TenantsReadOnly } from '@/components/portal/dashboard/TenantsReadOnly';
import { useSidebar } from '@/components/SidebarContext';
import { useDeveloperPortal } from '@/hooks/useDeveloperPortal';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const { openSidebar } = useSidebar();
  const user = useAuthStore((s) => s.user);
  const portal = useDeveloperPortal();

  useEffect(() => {
    void portal.load();
  }, [portal.load]);

  const subtitle = user
    ? `${user.firstName} ${user.lastName} · ${user.email}`
    : 'Gérez vos clés API et tenants';

  return (
    <>
      <PortalHeader
        title="Clés API"
        subtitle={subtitle}
        onMenuClick={openSidebar}
        actions={
          <Link href="/docs" className="btn-secondary hidden min-h-[36px] px-3 text-xs sm:inline-flex">
            <BookOpen className="h-3.5 w-3.5" />
            Documentation
          </Link>
        }
      />

      <main id="portal-main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {portal.error && (
            <AlertBanner variant="error" live className="mb-8">
              {portal.error}
            </AlertBanner>
          )}

          {portal.revealedSecret && (
            <div className="mb-8">
              <SecretReveal
                secret={portal.revealedSecret}
                tenantId={portal.revealedTenantId}
                onDismiss={portal.dismissSecret}
              />
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
            <div className="flex min-w-0 flex-col gap-5">
              <ApiKeyList
                apiKeys={portal.apiKeys}
                loading={portal.loading}
                onRevoke={portal.revokeApiKey}
              />
              {portal.tenants.length > 0 && <TenantsReadOnly tenants={portal.tenants} />}
            </div>

            <aside className="flex flex-col gap-5 xl:sticky xl:top-20">
              <ApiKeySection
                authOk={portal.authOk === true}
                error={portal.keyError}
                onCreate={async (payload) => {
                  await portal.createApiKey(payload);
                }}
              />
              <QuickResources />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
