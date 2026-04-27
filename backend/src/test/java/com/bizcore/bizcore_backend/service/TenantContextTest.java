package com.bizcore.bizcore_backend.service;

import com.bizcore.bizcore_backend.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Vérifie que TenantContext est bien un ThreadLocal isolé.
 * C'est la fondation de toute la multi-tenancy : si ce test échoue,
 * rien d'autre ne fonctionne correctement.
 */
class TenantContextTest {

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void setAndGet_shouldReturnSameUUID() {
        UUID tenantId = UUID.randomUUID();
        TenantContext.setTenantId(tenantId);
        assertEquals(tenantId, TenantContext.getTenantId());
    }

    @Test
    void clear_shouldRemoveTenantId() {
        TenantContext.setTenantId(UUID.randomUUID());
        TenantContext.clear();
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void nullByDefault_whenNeverSet() {
        // Thread frais — aucun tenant défini
        assertNull(TenantContext.getTenantId());
    }

    @Test
    void threadIsolation_differentThreadsHaveDifferentContexts() throws InterruptedException {
        UUID tenantA = UUID.randomUUID();
        UUID tenantB = UUID.randomUUID();

        TenantContext.setTenantId(tenantA);

        AtomicReference<UUID> capturedFromOtherThread = new AtomicReference<>();
        CountDownLatch latch = new CountDownLatch(1);

        Thread otherThread = new Thread(() -> {
            // L'autre thread définit son propre tenant
            TenantContext.setTenantId(tenantB);
            capturedFromOtherThread.set(TenantContext.getTenantId());
            TenantContext.clear();
            latch.countDown();
        });

        otherThread.start();
        latch.await();

        // Le thread principal voit toujours son propre tenant
        assertEquals(tenantA, TenantContext.getTenantId(),
                "Le thread principal ne doit pas voir le tenant de l'autre thread");

        // L'autre thread voyait bien son propre tenant
        assertEquals(tenantB, capturedFromOtherThread.get(),
                "L'autre thread doit voir son propre tenant");
    }

    @Test
    void overwrite_shouldReplaceExistingTenantId() {
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();
        TenantContext.setTenantId(first);
        TenantContext.setTenantId(second);
        assertEquals(second, TenantContext.getTenantId());
    }
}
