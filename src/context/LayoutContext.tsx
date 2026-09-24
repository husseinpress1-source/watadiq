import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutContextValue {
  menuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

const unlockBodyScroll = () => {
  document.body.style.removeProperty('overflow');
  document.body.style.removeProperty('position');
};

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    unlockBodyScroll();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    unlockBodyScroll();
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) {
        setMenuOpen(false);
        unlockBodyScroll();
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    closeMenu();
  }, [closeMenu]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    unlockBodyScroll();
  }, []);

  return (
    <LayoutContext.Provider
      value={{ menuOpen, openMenu, closeMenu, toggleMenu, searchOpen, openSearch, closeSearch }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
