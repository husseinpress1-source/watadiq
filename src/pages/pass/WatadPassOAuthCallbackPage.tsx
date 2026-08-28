import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import { oBtn, PassSection } from '../../components/pass/pass-ui';
import {
  consumeOAuthDemoState,
  exchangeOAuthCode,
  fetchUserInfo,
} from '../../lib/watad-pass';

type Stage = 'working' | 'done' | 'error';

export default function WatadPassOAuthCallbackPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [stage, setStage] = useState<Stage>('working');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ sub: string; email?: string; name?: string } | null>(null);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error');

    if (oauthError) {
      setStage('error');
      setError(oauthError);
      return;
    }
    if (!code || !state) {
      setStage('error');
      setError('missing_code');
      return;
    }

    const saved = consumeOAuthDemoState();
    if (!saved || saved.state !== state) {
      setStage('error');
      setError('state_mismatch');
      return;
    }

    setClientId(saved.clientId);
    exchangeOAuthCode(saved.clientId, code, saved.verifier, saved.redirectUri)
      .then((tokens) => fetchUserInfo(tokens.access_token))
      .then((info) => {
        setUser(info);
        const dest = saved.returnTo && saved.returnTo.startsWith('/') ? saved.returnTo : '/';
        window.location.replace(dest);
      })
      .catch((err) => {
        setStage('error');
        setError(err instanceof Error ? err.message : 'exchange_failed');
      });
  }, [params]);

  return (
    <PassPageShell>
      {stage === 'working' && (
        <p className="text-xl text-muted">{t('pass.oauthDemo.working')}</p>
      )}

      {stage === 'error' && (
        <PassSection title={t('pass.oauthDemo.failedTitle')}>
          <div className="rounded-2xl border border-line bg-soft p-8">
            <p dir="ltr" className="font-mono text-base text-ink">{error}</p>
            <div className="mt-6">
              <Link to="/pass/console" className={oBtn}>
                {t('pass.oauthDemo.backConsole')}
              </Link>
            </div>
          </div>
        </PassSection>
      )}

      {stage === 'done' && user && (
        <PassSection title={t('pass.oauthDemo.successTitle')} hint={t('pass.oauthDemo.successHint')}>
          <div className="rounded-3xl border border-line bg-white p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/40 bg-soft text-2xl font-bold text-brand">
                {(user.email || user.name || 'W').slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <strong className="block truncate text-2xl font-bold text-ink">
                  {user.name || user.email || t('pass.oauthDemo.signedInUser')}
                </strong>
                {user.email && <span className="text-lg text-muted">{user.email}</span>}
              </div>
            </div>
            <dl className="mt-8 grid gap-4 border-t border-line pt-8">
              <div className="flex flex-nowrap items-center justify-between gap-4">
                <dt className="text-base text-muted">sub</dt>
                <dd dir="ltr" className="truncate font-mono text-base text-ink">{user.sub}</dd>
              </div>
              <div className="flex flex-nowrap items-center justify-between gap-4">
                <dt className="text-base text-muted">client_id</dt>
                <dd dir="ltr" className="truncate font-mono text-base text-ink">{clientId}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/pass/console" className={oBtn}>
                {t('pass.oauthDemo.backConsole')}
              </Link>
              <Link to="/pass/account" className={oBtn}>
                {t('pass.platformTabs.account')}
              </Link>
            </div>
          </div>
        </PassSection>
      )}
    </PassPageShell>
  );
}
