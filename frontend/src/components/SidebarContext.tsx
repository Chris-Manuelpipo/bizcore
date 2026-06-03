'use client';

import { createContext, useContext } from 'react';

/**
 * Permet aux pages (via <Header>) d'ouvrir la sidebar mobile dont l'état
 * vit dans le layout du dashboard. Évite de câbler onMenuClick page par page.
 */
export const SidebarContext = createContext<{ openSidebar: () => void }>({
  openSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
