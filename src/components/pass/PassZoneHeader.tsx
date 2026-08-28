import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassSubnav from '../PassSubnav';

/** Scrolls with the page — not sticky. */
export default function PassZoneHeader({ hideSubnav = false }: { hideSubnav?: boolean }) {
  const { t } = useTranslation();

  return (
    <header>
      <div className="bg-brand px-4 py-4 text-white sm:px-6 sm:py-5 lg:px-12 lg:py-6 xl:px-16">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 sm:gap-6">
          <Link
            to="/"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-2xl border border-white/50 bg-transparent px-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand sm:h-11 sm:gap-2 sm:px-5 sm:text-base lg:h-12"
          >
            <span aria-hidden="true">←</span>
            {t('pass.backHome')}
          </Link>
          <span className="flex shrink-0 items-center gap-2 sm:gap-3">
            <img src="/images/watad-logo-white.png" alt="" className="h-7 w-auto object-contain opacity-95 sm:h-8" />
            <span className="hidden text-base font-bold tracking-[0.12em] sm:inline sm:text-lg lg:text-xl">WATAD ONE</span>
          </span>
        </div>
      </div>
      {!hideSubnav && (
        <div className="border-b border-line bg-white px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[1440px]">
            <PassSubnav />
          </div>
        </div>
      )}
    </header>
  );
}
