import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../context/LayoutContext';
import { navHrefs } from '../data/homepage';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import MobileMenu from './MobileMenu';
import './Header.scss';

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const { toggleMenu } = useLayout();
  const { t } = useTranslation();
  const location = useLocation();
  const [atTop, setAtTop] = useState(true);
  const hideHeader = atTop;

  useEffect(() => {
    const onScroll = () => {
      setAtTop(window.scrollY < 48);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  return (
    <>
      <header className={cn('met-header', hideHeader ? 'met-header--transparent' : 'met-header--solid')}>
        <div className="met-header__bar">
          <div className="met-header__inner">
            <div className="met-header__start">
              <Link to="/" className="met-header__logo" aria-label="WATAD Software home">
                <img src="/images/watad-logo-red.png" alt="" className="met-header__logo-img" aria-hidden="true" />
              </Link>

              <nav className="met-header__nav" aria-label="Main navigation">
                <ul>
                  {navHrefs.map((link) => {
                    const active = isNavActive(location.pathname, link.href);

                    return (
                      <li key={link.key}>
                        <Link to={link.href} className={cn(active && 'is-active')}>
                          {t(`nav.${link.key}`)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="met-header__end">
              <div className="met-header__end-desktop">
                <LanguageSwitcher variant="header" />
              </div>

              <div className="met-header__mobile-actions">
                <button type="button" className="met-header__icon-btn" onClick={toggleMenu} aria-label={t('common.openMenu')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}
