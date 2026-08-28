import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { oBtn } from './pass/pass-ui';
import '../pages/pass/pass-tw.css';
import '../pages/pass/WatadPassPages.scss';

/** Homepage promo strip — WATAD ONE identity lives on the same company site. */
export default function WatadPassHomeStrip() {
  const { t } = useTranslation();

  return (
    <section className="pass-home-strip" aria-labelledby="pass-home-strip-title">
      <div className="pass-home-strip__inner">
        <div className="pass-home-strip__content">
          <div className="pass-home-strip__brand">
            <img src="/images/watad-logo-red.png" alt="WATAD" width={44} height={44} loading="lazy" decoding="async" />
            <span>WATAD ONE</span>
          </div>
          <h2 id="pass-home-strip-title">{t('pass.homeStripTitle')}</h2>
          <p>{t('pass.homeStripText')}</p>
          <div className="pass-hero__actions flex flex-wrap gap-3">
            <Link to="/pass" className={oBtn}>
              {t('pass.homeStripLearn')}
            </Link>
            <Link to="/pass/login" className={oBtn}>
              {t('pass.ctaLogin')}
            </Link>
            <Link to="/pass/console" className={oBtn}>
              {t('pass.ctaDevelopers')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
