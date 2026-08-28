import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const { closeMenu, closeSearch } = useLayout();

  useEffect(() => {
    window.scrollTo(0, 0);
    closeMenu();
    closeSearch();
  }, [pathname, closeMenu, closeSearch]);

  return null;
}
