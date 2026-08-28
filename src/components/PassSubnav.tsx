import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { passApi } from '../lib/watad-pass';

type Tab = { key: string; href: string; auth?: boolean; guest?: boolean };

const tabs: Tab[] = [
  { key: 'overview', href: '/pass' },
  { key: 'developers', href: '/pass/developers' },
  { key: 'login', href: '/pass/login', guest: true },
  { key: 'account', href: '/pass/account', auth: true },
  { key: 'console', href: '/pass/console', auth: true },
];

export default function PassSubnav() {
  const { t } = useTranslation();
  const location = useLocation();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    passApi.me()
      .then(() => { if (mounted) setSignedIn(true); })
      .catch(() => { if (mounted) setSignedIn(false); });
    return () => { mounted = false; };
  }, [location.pathname]);

  const visible = tabs.filter((tab) => {
    if (tab.auth) return signedIn === true;
    if (tab.guest) return signedIn === false;
    return true;
  });

  return (
    <nav className="-mx-1 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-1 py-3 sm:gap-2 sm:py-4" aria-label={t('pass.platformNavLabel')}>
      {visible.map((tab) => {
        const active =
          tab.href === '/pass'
            ? location.pathname === '/pass'
            : tab.href === '/pass/developers'
              ? location.pathname.startsWith('/pass/developers')
              : location.pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            to={tab.href}
            className={cn(
              'inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-2xl px-3.5 text-sm font-semibold transition-colors sm:h-12 sm:px-5 sm:text-base lg:h-14 lg:px-6 lg:text-lg',
              active
                ? 'bg-brand text-white'
                : 'border border-line bg-white text-muted hover:border-brand hover:text-brand',
            )}
          >
            {t(`pass.platformTabs.${tab.key}`)}
          </Link>
        );
      })}
    </nav>
  );
}
