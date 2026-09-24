import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../context/LayoutContext';
import { navHrefs } from '../data/homepage';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import WatadOneAccountMenu from './WatadOneAccountMenu';
import WatadWordmark from './WatadWordmark';
import MobileMenu from './MobileMenu';
import './Header.scss';

function isNavActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

type HeaderMode = 'transparent' | 'solid' | 'hidden';

function isLegalRoute(pathname: string) {
  return pathname === '/privacy' || pathname === '/terms';
}

/** Full-bleed hero pages: header fades in at top, solid once you scroll down */
function isHeroFadeRoute(pathname: string) {
  if (pathname === '/' || pathname === '/live') return true;
  if (pathname.startsWith('/account/')) return true;
  return false;
}

function resolveHeaderMode(
  y: number,
  diff: number,
  heroFadeAtTop: boolean,
  autoHideOnScroll: boolean,
  current: HeaderMode,
): HeaderMode {
  if (autoHideOnScroll) {
    if (y > 72 && diff > 4) return 'hidden';
    if (diff < -4) return 'solid';
    if (y <= 72) return 'solid';
    return current;
  }

  if (heroFadeAtTop && y < 48) return 'transparent';
  return 'solid';
}

export default function Header() {
  const { toggleMenu } = useLayout();
  const { t } = useTranslation();
  const location = useLocation();
  const heroFadeAtTop = isHeroFadeRoute(location.pathname);
  const autoHideOnScroll = isLegalRoute(location.pathname);
  const [headerMode, setHeaderMode] = useState<HeaderMode>(() => {
    if (autoHideOnScroll) return 'solid';
    return heroFadeAtTop && window.scrollY < 48 ? 'transparent' : 'solid';
  });
  const lastScrollY = useRef(0);
  const headerModeRef = useRef(headerMode);
  headerModeRef.current = headerMode;

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    if (autoHideOnScroll) {
      setHeaderMode('solid');
    } else {
      setHeaderMode(heroFadeAtTop && window.scrollY < 48 ? 'transparent' : 'solid');
    }

    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastScrollY.current;
        const next = resolveHeaderMode(y, diff, heroFadeAtTop, autoHideOnScroll, headerModeRef.current);

        if (next !== headerModeRef.current) {
          setHeaderMode(next);
        }

        lastScrollY.current = y;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [location.pathname, heroFadeAtTop, autoHideOnScroll]);

  useEffect(() => {
    const offset =
      autoHideOnScroll && headerMode === 'hidden' ? '0px' : 'var(--header-h)';
    document.documentElement.style.setProperty('--header-offset', offset);
    return () => {
      document.documentElement.style.setProperty('--header-offset', 'var(--header-h)');
    };
  }, [headerMode, autoHideOnScroll]);

  return (
    <>
      <header
        className={cn(
          'met-header',
          headerMode === 'transparent' && 'met-header--transparent',
          headerMode === 'solid' && 'met-header--solid',
          headerMode === 'hidden' && 'met-header--hidden',
        )}
      >
        <div className="met-header__bar">
          <div className="met-header__inner">
            <div className="met-header__start">
              <Link to="/" className="met-header__logo met-header__logo--classic" aria-label={t('common.brandName')}>
                <img
                  src="/images/watad-logo-red.png"
                  alt=""
                  className="met-header__logo-img"
                  width={120}
                  height={34}
                  decoding="async"
                  draggable={false}
                  aria-hidden="true"
                />
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

              <button
                type="button"
                className="met-header__icon-btn met-header__menu-btn"
                onClick={toggleMenu}
                aria-label={t('common.openMenu')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <Link to="/" className="met-header__logo met-header__logo--mobile" aria-label={t('common.brandName')}>
              <WatadWordmark />
            </Link>

            <div className="met-header__end">
              <div className="met-header__end-desktop">
                <WatadOneAccountMenu variant="header" />
                <LanguageSwitcher variant="header" />
              </div>
              <span className="met-header__trailing-spacer" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu />
    </>
  );
}
