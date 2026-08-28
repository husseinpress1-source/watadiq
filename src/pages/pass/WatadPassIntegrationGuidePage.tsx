import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import PassCodeBlock from '../../components/pass/PassCodeBlock';
import {
  oBtnLg,
  PassPageTitle,
  PassSection,
} from '../../components/pass/pass-ui';
import { DEV_CONSOLE_PATH, IDENTITY_PUBLIC } from '../../lib/watad-pass';
import './WatadPassPages.scss';

const TOC_KEYS = [
  'overview',
  'prerequisites',
  'console',
  'redirects',
  'flow',
  'spa',
  'server',
  'tokens',
  'scopes',
  'consent',
  'test',
  'troubleshoot',
] as const;

type SectionKey = (typeof TOC_KEYS)[number];

type GuideSection = {
  title: string;
  lead?: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

type FlowStep = { num: string; title: string; text: string };

export default function WatadPassIntegrationGuidePage() {
  const { t } = useTranslation();
  const api = IDENTITY_PUBLIC;
  const web = typeof window !== 'undefined' ? window.location.origin : 'https://www.watadiq.com';

  const sections = t('pass.devGuide.sections', { returnObjects: true }) as Record<SectionKey, GuideSection>;
  const flowSteps = t('pass.devGuide.flowSteps', { returnObjects: true }) as FlowStep[];
  const redirectRules = t('pass.devGuide.redirectRules', { returnObjects: true }) as string[];
  const scopeRows = t('pass.devGuide.scopeRows', { returnObjects: true }) as { scope: string; desc: string }[];
  const faq = t('pass.devGuide.faq', { returnObjects: true }) as { q: string; a: string }[];

  const spaExample = `// 1) Generate PKCE verifier + challenge (browser)
const verifier = crypto.randomUUID() + crypto.randomUUID();
const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
  .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');

sessionStorage.setItem('pkce_verifier', verifier);

// 2) Redirect user to authorize
const params = new URLSearchParams({
  client_id: 'YOUR_CLIENT_ID',
  redirect_uri: '${web}/auth/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: crypto.randomUUID(),
  code_challenge: challenge,
  code_challenge_method: 'S256',
});
window.location.href = '${api}/oauth/authorize?' + params;

// 3) On callback — exchange code for tokens (from your backend or SPA)
const tokenRes = await fetch('${api}/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: 'YOUR_CLIENT_ID',
    code: authorizationCodeFromUrl,
    redirect_uri: '${web}/auth/callback',
    code_verifier: sessionStorage.getItem('pkce_verifier') ?? '',
  }),
});
const tokens = await tokenRes.json();`;

  const serverExample = `// Node / Go / any backend — confidential client
POST ${api}/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&code=AUTH_CODE_FROM_CALLBACK
&redirect_uri=${encodeURIComponent(`${web}/auth/callback`)}
&code_verifier=PKCE_VERIFIER_FROM_SESSION`;

  const authorizeTemplate = `${api}/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(`${web}/auth/callback`)}&response_type=code&scope=openid+profile+email&state=RANDOM&code_challenge=PKCE_CHALLENGE&code_challenge_method=S256`;

  function renderSection(key: SectionKey) {
    const sec = sections[key];
    if (!sec) return null;

    return (
      <section id={key} className="pass-guide__section">
        <h2 className="pass-guide__section-title">{sec.title}</h2>
        {sec.lead && <p className="pass-guide__lead">{sec.lead}</p>}
        {sec.paragraphs?.map((p) => (
          <p key={p.slice(0, 40)} className="pass-guide__p">{p}</p>
        ))}
        {sec.bullets && sec.bullets.length > 0 && (
          <ul className="pass-guide__list">
            {sec.bullets.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
        )}
        {sec.note && <p className="pass-guide__note">{sec.note}</p>}

        {key === 'flow' && (
          <ol className="pass-guide__flow">
            {flowSteps.map((step) => (
              <li key={step.num} className="pass-guide__flow-step">
                <span className="pass-guide__flow-num">{step.num}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {key === 'redirects' && (
          <ul className="pass-guide__rules">
            {redirectRules.map((rule) => (
              <li key={rule.slice(0, 40)}>{rule}</li>
            ))}
          </ul>
        )}

        {key === 'spa' && (
          <PassCodeBlock title={t('pass.devGuide.code.spaTitle')} code={spaExample} language="javascript" />
        )}

        {key === 'server' && (
          <PassCodeBlock title={t('pass.devGuide.code.serverTitle')} code={serverExample} language="http" />
        )}

        {key === 'tokens' && (
          <PassCodeBlock title={t('pass.devGuide.code.authorizeTitle')} code={authorizeTemplate} />
        )}

        {key === 'scopes' && (
          <div className="pass-guide__table-wrap">
            <table className="pass-guide__table">
              <thead>
                <tr>
                  <th>{t('pass.devGuide.scopeCol')}</th>
                  <th>{t('pass.devGuide.scopeDescCol')}</th>
                </tr>
              </thead>
              <tbody>
                {scopeRows.map((row) => (
                  <tr key={row.scope}>
                    <td dir="ltr"><code>{row.scope}</code></td>
                    <td>{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {key === 'troubleshoot' && (
          <div className="pass-guide__faq">
            {faq.map((item) => (
              <details key={item.q} className="pass-guide__faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <PassPageShell>
      <div className="pass-guide">
        <Link to="/pass/developers" className="pass-guide__back">
          ← {t('pass.devGuide.backToDevelopers')}
        </Link>

        <PassPageTitle title={t('pass.devGuide.title')} lead={t('pass.devGuide.lead')} />

        <div className="pass-guide__layout">
          <aside className="pass-guide__toc" aria-label={t('pass.devGuide.tocTitle')}>
            <p className="pass-guide__toc-label">{t('pass.devGuide.tocTitle')}</p>
            <nav>
              <ul>
                {TOC_KEYS.map((key) => (
                  <li key={key}>
                    <a href={`#${key}`}>{sections[key]?.title ?? t(`pass.devGuide.toc.${key}`)}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="pass-guide__content">
            <div className="pass-guide__hero-card">
              <div className="pass-guide__hero-grid">
                <div>
                  <span className="pass-guide__hero-label">{t('pass.devGuide.hero.api')}</span>
                  <code dir="ltr">{api}</code>
                </div>
                <div>
                  <span className="pass-guide__hero-label">{t('pass.devGuide.hero.discovery')}</span>
                  <code dir="ltr">{api}/.well-known/openid-configuration</code>
                </div>
                <div>
                  <span className="pass-guide__hero-label">{t('pass.devGuide.hero.console')}</span>
                  <code dir="ltr">{web}/pass/console</code>
                </div>
              </div>
            </div>

            {TOC_KEYS.map((key) => renderSection(key))}

            <PassSection title={t('pass.devGuide.ctaTitle')} hint={t('pass.devGuide.ctaHint')}>
              <div className="flex flex-wrap gap-4">
                <Link to={DEV_CONSOLE_PATH} className={oBtnLg}>
                  {t('pass.openConsole')}
                </Link>
                <Link to="/pass/login" className={oBtnLg}>
                  {t('pass.ctaLogin')}
                </Link>
              </div>
            </PassSection>
          </div>
        </div>
      </div>
    </PassPageShell>
  );
}
