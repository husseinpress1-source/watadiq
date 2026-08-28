import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import { cleanPassText, oBtnLg } from '../../components/pass/pass-ui';
import { DEV_CONSOLE_PATH } from '../../lib/watad-pass';
import '../AccountPages.scss';
import './WatadPassPages.scss';

export default function WatadPassLandingPage() {
  const { t } = useTranslation();

  const features = t('pass.features', { returnObjects: true }) as { title: string; text: string }[];
  const steps = t('pass.steps', { returnObjects: true }) as { title: string; text: string }[];

  return (
    <PassPageShell>
      <section className="pass-landing-hero">
        <p className="pass-landing-hero__eyebrow">{t('pass.eyebrow')}</p>
        <h1>{cleanPassText(t('pass.heroTitle'))}</h1>
        <p className="pass-landing-hero__lead">{cleanPassText(t('pass.heroLead'))}</p>
        <div className="pass-landing-hero__actions">
          <Link to="/pass/login" className={oBtnLg}>
            {t('pass.ctaLogin')}
          </Link>
          <Link to={DEV_CONSOLE_PATH} className={oBtnLg}>
            {t('pass.ctaDevelopers')}
          </Link>
        </div>
      </section>

      <section className="pass-section">
        <h2 className="pass-section__title">{t('pass.featuresTitle')}</h2>
        <div className="pass-grid">
          {features.map((f) => (
            <article key={f.title} className="pass-card">
              <h3>{f.title}</h3>
              <p>{cleanPassText(f.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pass-section">
        <h2 className="pass-section__title">{t('pass.stepsTitle')}</h2>
        <ol className="pass-steps">
          {steps.map((s, i) => (
            <li key={s.title}>
              <span className="pass-steps__num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{cleanPassText(s.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pass-cta-band">
        <h2>{t('pass.bandTitle')}</h2>
        <p>{cleanPassText(t('pass.bandText'))}</p>
        <Link to="/pass/login" className={oBtnLg}>
          {t('pass.ctaStart')}
        </Link>
      </section>
    </PassPageShell>
  );
}
