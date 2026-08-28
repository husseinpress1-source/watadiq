import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import {
  oBtnLg,
  PassDataRow,
  PassDataTable,
  PassPageTitle,
  PassSection,
} from '../../components/pass/pass-ui';
import { DEV_CONSOLE_PATH, IDENTITY_PUBLIC } from '../../lib/watad-pass';

export default function WatadPassDevelopersPage() {
  const { t } = useTranslation();
  const items = t('pass.devItems', { returnObjects: true }) as { title: string; text: string }[];
  const steps = t('pass.devSteps', { returnObjects: true }) as { title: string; text: string }[];
  const quickLinks = t('pass.devQuickLinks', { returnObjects: true }) as { title: string; text: string; href: string }[];

  const endpoints = [
    { label: t('pass.devEndpointIssuer'), value: IDENTITY_PUBLIC },
    { label: t('pass.devEndpointAuthorize'), value: `${IDENTITY_PUBLIC}/oauth/authorize` },
    { label: t('pass.devEndpointToken'), value: `${IDENTITY_PUBLIC}/oauth/token` },
    { label: t('pass.devEndpointJwks'), value: `${IDENTITY_PUBLIC}/.well-known/jwks.json` },
  ];

  return (
    <PassPageShell>
      <PassPageTitle title={t('pass.devTitle')} lead={t('pass.devIntro')} />

      <section className="pass-dev-hero">
        <div className="pass-dev-hero__content">
          <p className="pass-dev-hero__eyebrow">{t('pass.devGuide.eyebrow')}</p>
          <h2 className="pass-dev-hero__title">{t('pass.devGuide.promoTitle')}</h2>
          <p className="pass-dev-hero__text">{t('pass.devGuide.promoText')}</p>
          <div className="pass-dev-hero__actions">
            <Link to="/pass/developers/guide" className="pass-btn pass-btn--solid pass-btn--lg">
              {t('pass.devGuide.openGuide')}
            </Link>
            <Link to={DEV_CONSOLE_PATH} className="pass-btn pass-btn--outline pass-btn--lg">
              {t('pass.openConsole')}
            </Link>
          </div>
        </div>
      </section>

      <PassSection title={t('pass.devQuickLinksTitle')}>
        <div className="pass-dev-links">
          {quickLinks.map((link) => (
            <Link key={link.href} to={link.href} className="pass-dev-links__item">
              <strong>{link.title}</strong>
              <p>{link.text}</p>
              <span className="pass-dev-links__arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </PassSection>

      <PassSection title={t('pass.devFeaturesTitle')}>
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex min-h-[8rem] flex-col justify-center rounded-2xl border border-line px-6 py-6 lg:min-h-[9rem] lg:px-8 lg:py-8"
            >
              <h3 className="text-xl font-bold text-ink lg:text-2xl">{item.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted lg:text-lg">{item.text}</p>
            </div>
          ))}
        </div>
      </PassSection>

      <PassSection title={t('pass.devStepsTitle')}>
        <PassDataTable columns={[t('pass.devColStep'), t('pass.devColTitle'), t('pass.devColDetail')]}>
          {steps.map((s, i) => (
            <PassDataRow
              key={s.title}
              col1={String(i + 1)}
              col2={s.title}
              col3={s.text}
              col3Mono={false}
            />
          ))}
        </PassDataTable>
      </PassSection>

      <PassSection title={t('pass.devEndpointsTitle')}>
        <PassDataTable columns={[t('pass.devColEndpoint'), t('pass.devColUrl')]}>
          {endpoints.map((ep) => (
            <PassDataRow key={ep.label} columns={2} col1={ep.label} col2={ep.value} />
          ))}
        </PassDataTable>
      </PassSection>

      <PassSection title={t('pass.devCtaTitle')} hint={t('pass.devCtaText')}>
        <div className="flex flex-wrap gap-4">
          <Link to="/pass/developers/guide" className={oBtnLg}>
            {t('pass.devGuide.openGuide')}
          </Link>
          <Link to={DEV_CONSOLE_PATH} className={oBtnLg}>
            {t('pass.openConsole')}
          </Link>
          <Link to="/pass/login" className={oBtnLg}>
            {t('pass.ctaLogin')}
          </Link>
        </div>
      </PassSection>
    </PassPageShell>
  );
}
