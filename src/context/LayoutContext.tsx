import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutContextValue {
  menuOpen: boolean;
  searchOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
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

  const openMenu = useCallback(() => {
    setSearchOpen(false);
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
    setMenuOpen(false);
    setSearchOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    unlockBodyScroll();
  }, []);

  const toggleSearch = useCallback(() => {
    if (searchOpen) closeSearch();
    else openSearch();
  }, [searchOpen, openSearch, closeSearch]);

  return (
    <LayoutContext.Provider
      value={{ menuOpen, searchOpen, openMenu, closeMenu, toggleMenu, openSearch, closeSearch, toggleSearch }}
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
