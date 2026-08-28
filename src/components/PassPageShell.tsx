import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useCookieConsent } from '../context/CookieConsentContext';
import PassZoneHeader from './pass/PassZoneHeader';
import '../pages/pass/pass-tw.css';

type PassPageShellProps = {
  children: ReactNode;
  hideSubnav?: boolean;
};

export default function PassPageShell({ children, hideSubnav = false }: PassPageShellProps) {
  const { t } = useTranslation();
  const { openSettings } = useCookieConsent();

  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      <PassZoneHeader hideSubnav={hideSubnav} />
      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-16 xl:px-16">
        <div className="mx-auto w-full max-w-[1440px]">
          {children}
        </div>
        <div className="mx-auto mt-10 w-full max-w-[1440px] text-center">
          <button
            type="button"
            onClick={openSettings}
            className="border-0 bg-transparent text-sm font-semibold text-faint underline underline-offset-4 hover:text-brand"
          >
            {t('cookies.manageLink')}
          </button>
        </div>
      </main>
    </div>
  );
}