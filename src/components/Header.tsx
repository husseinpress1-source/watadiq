import { useEffect, useState } from 'react';
import cn from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../context/LayoutContext';
import { navHrefs, passNavTab } from '../data/homepage';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import SearchOverlay from './SearchOverlay';
import MobileMenu from './MobileMenu';
import WatadUserMenu from './WatadUserMenu';
import './Header.scss';

export default function Header() {
  const { toggleMenu, openSearch } = useLayout();
  const { t } = useTranslation();
  const location = useLocation();
  const [atTop, setAtTop] = useState(true);
  const hideHeader = atTop;
  const passActive = location.pathname.startsWith('/pass');

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
        <div className="met-header__utility">
          <div className="met-header__inner">
            <Link to="/" className="met-header__logo" aria-label="WATAD Software home">
              <img src="/images/watad-logo-white.png" alt="" className="met-header__logo-img" aria-hidden="true" />
            </Link>

            <div className="met-header__utility-actions met-header__utility-actions--desktop">
              <WatadUserMenu variant="header" />
            </div>

            <div className="met-header__mobile-actions">
              <button type="button" className="met-header__search" onClick={openSearch} aria-label={t('common.search')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button type="button" className="met-header__hamburger" onClick={toggleMenu} aria-label={t('common.openMenu')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="met-header__nav-bar">
          <div className="met-header__inner">
            <nav className="met-header__nav" aria-label="Main navigation">
              <ul>
                {navHrefs.map((link) => (
                  <li key={link.key}>
                    <Link to={link.href}>{t(`nav.${link.key}`)}</Link>
                  </li>
                ))}
                <li className="met-header__pass-tab-wrap">
                  <Link
                    to={passNavTab.href}
                    className={cn('met-header__pass-tab', passActive && 'met-header__pass-tab--active')}
                  >
                    {t('nav.pass')}
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="met-header__nav-actions">
              <Link to="/contact" className="met-header__nav-link">{t('common.contact')}</Link>
              <Link to="/pricing" className="met-header__nav-link">{t('common.pricing')}</Link>
              <LanguageSwitcher variant="header" />
              <button type="button" className="met-header__search met-header__search--desktop" onClick={openSearch} aria-label={t('common.search')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay />
      <MobileMenu />
    </>
  );
}
