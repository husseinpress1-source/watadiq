import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutContextValue {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

const unlockBodyScroll = () => {
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('position');
};

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    unlockBodyScroll();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    unlockBodyScroll();
  }, [location.pathname]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    unlockBodyScroll();
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) closeMenu();
    else openMenu();
  }, [menuOpen, openMenu, closeMenu]);

  return (
    <LayoutContext.Provider value={{ menuOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
