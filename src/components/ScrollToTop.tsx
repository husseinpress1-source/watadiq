import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const { closeMenu } = useLayout();

  useEffect(() => {
    window.scrollTo(0, 0);
    closeMenu();
  }, [pathname, closeMenu]);

  return null;
}
