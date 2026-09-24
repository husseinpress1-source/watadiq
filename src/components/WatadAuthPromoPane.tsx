import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

type Props = {
  topLink?: { to: string; label: string };
};

export default function WatadAuthPromoPane({ topLink }: Props) {
  const { t } = useTranslation();
  const action = topLink ?? { to: '/account/sign-in', label: t('auth.signIn') };

  return (
    <aside className="watad-auth__promo-pane" aria-label={t('auth.promoAria')}>
      <div className="watad-auth__promo-bg" aria-hidden="true">
        <img src="/images/auth/sign-in-hero-1280.webp" alt="" decoding="async" />
      </div>
      <div className="watad-auth__promo-scrim" aria-hidden="true" />

      <div className="watad-auth__promo-top">
        <div className="watad-auth__lang">
          <LanguageSwitcher variant="auth" />
        </div>
        <Link to={action.to} className="watad-auth__promo-signup">
          {action.label}
        </Link>
      </div>
    </aside>
  );
}
