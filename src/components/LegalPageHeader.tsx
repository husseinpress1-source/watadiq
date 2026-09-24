import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LegalRichText } from './LegalRichText';
import './LegalPageHeader.scss';

interface LegalPageHeaderProps {
  title: string;
  lead: string;
  lastUpdated: string;
}

export default function LegalPageHeader({ title, lead, lastUpdated }: LegalPageHeaderProps) {
  const { t } = useTranslation();
  const tabsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const tabs = tabsRef.current;
    const page = tabs?.closest('.legal-page') as HTMLElement | null;
    if (!tabs || !page) return;

    const mq = window.matchMedia('(max-width: 1023px)');

    const syncStickyMeta = () => {
      if (!mq.matches) {
        page.style.removeProperty('--legal-sticky-meta');
        return;
      }
      page.style.setProperty('--legal-sticky-meta', `${tabs.offsetHeight}px`);
    };

    syncStickyMeta();
    const ro = new ResizeObserver(syncStickyMeta);
    ro.observe(tabs);
    mq.addEventListener('change', syncStickyMeta);
    window.addEventListener('resize', syncStickyMeta);

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', syncStickyMeta);
      window.removeEventListener('resize', syncStickyMeta);
      page.style.removeProperty('--legal-sticky-meta');
    };
  }, []);

  return (
    <header className="legal-page__hero">
      <div className="legal-page__hero-shell">
        <nav className="legal-page__breadcrumb" aria-label={t('legalCommon.breadcrumbAria')}>
          <ol>
            <li className="legal-page__breadcrumb-item">
              <Link className="legal-page__breadcrumb-link" to="/">
                {t('common.home')}
              </Link>
            </li>
            <li className="legal-page__breadcrumb-item" aria-hidden="true">
              <span className="legal-page__breadcrumb-sep">›</span>
            </li>
            <li className="legal-page__breadcrumb-item">
              <span className="legal-page__breadcrumb-muted">{t('legalCommon.breadcrumbLegal')}</span>
            </li>
            <li className="legal-page__breadcrumb-item" aria-hidden="true">
              <span className="legal-page__breadcrumb-sep">›</span>
            </li>
            <li className="legal-page__breadcrumb-item legal-page__breadcrumb-item--current">
              <span className="legal-page__breadcrumb-current" aria-current="page">
                {title}
              </span>
            </li>
          </ol>
        </nav>

        <nav
          ref={tabsRef}
          className="legal-page__doc-tabs"
          aria-label={t('legalCommon.relatedNavAria')}
        >
          <NavLink
            to="/privacy"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            end
          >
            {t('legalCommon.navPrivacy')}
          </NavLink>
          <NavLink
            to="/terms"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            end
          >
            {t('legalCommon.navTerms')}
          </NavLink>
        </nav>

        <h1 className="legal-page__hero-title">{title}</h1>
        <p className="legal-page__hero-lead">
          <LegalRichText text={lead} />
        </p>
        <p className="legal-page__updated">{lastUpdated}</p>
      </div>
    </header>
  );
}
