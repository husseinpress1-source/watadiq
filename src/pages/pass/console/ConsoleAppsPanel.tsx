import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassSelect from '../../../components/pass/PassSelect';
import {
  oBtn,
  oBtnSm,
  oInput,
  oLabel,
  PassEmpty,
  PassSection,
} from '../../../components/pass/pass-ui';
import { consoleAppPath, passApi, type DevApp } from '../../../lib/watad-pass';

type Props = {
  orgSlug: string;
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
}

function envBadgeClass(env: string) {
  return env === 'production'
    ? 'border-blue-200 bg-blue-50 text-blue-900'
    : 'border-amber-200 bg-amber-50 text-amber-900';
}

function statusBadgeClass(status: string) {
  return status === 'active'
    ? 'border-green-200 bg-green-50 text-green-900'
    : 'border-red-200 bg-red-50 text-red-900';
}

export default function ConsoleAppsPanel({ orgSlug, busy, setBusy, setError }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apps, setApps] = useState<DevApp[] | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [appName, setAppName] = useState('');
  const [appSlug, setAppSlug] = useState('');
  const [environment, setEnvironment] = useState('development');
  const [clientType, setClientType] = useState('public');

  function loadApps() {
    passApi.apps(orgSlug).then((r) => setApps(r.applications)).catch(() => setApps([]));
  }

  useEffect(loadApps, [orgSlug]);

  async function createApp(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await passApi.createApp(orgSlug, {
        name: appName.trim(),
        slug: appSlug.trim() || slugify(appName),
        environment,
        client_type: clientType,
      });
      setAppName('');
      setAppSlug('');
      setShowCreate(false);
      loadApps();
      navigate(consoleAppPath(orgSlug, res.application.id), {
        state: {
          notice: t('pass.console.appCreated'),
          clientSecret: res.client_secret ?? null,
        },
      });
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <PassSection
      title={t('pass.console.yourApps')}
      hint={t('pass.console.appsHint')}
      action={
        <button type="button" className={oBtnSm} onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? t('pass.console.cancel') : t('pass.console.newApp')}
        </button>
      }
    >
      {showCreate && (
        <form onSubmit={createApp} className="mb-10 grid gap-5 rounded-2xl border border-line bg-white p-6 lg:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={oLabel}>{t('pass.console.appName')}</span>
              <input
                required
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value);
                  setAppSlug(slugify(e.target.value));
                }}
                className={oInput}
              />
            </label>
            <label className="block">
              <span className={oLabel}>{t('pass.console.appSlug')}</span>
              <input
                required
                dir="ltr"
                value={appSlug}
                onChange={(e) => setAppSlug(e.target.value)}
                className={oInput}
              />
            </label>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <PassSelect
              label={t('pass.console.environment')}
              value={environment}
              onChange={setEnvironment}
              options={[
                { value: 'development', label: t('pass.console.envDev') },
                { value: 'production', label: t('pass.console.envProd') },
              ]}
            />
            <PassSelect
              label={t('pass.console.type')}
              value={clientType}
              onChange={setClientType}
              options={[
                { value: 'public', label: t('pass.console.typePublic') },
                { value: 'confidential', label: t('pass.console.typeConfidential') },
              ]}
            />
          </div>
          <div className="flex flex-nowrap gap-3 pt-2">
            <button type="submit" className={`${oBtn} flex-1`} disabled={busy}>
              {t('pass.console.createAppBtn')}
            </button>
            <button type="button" className={oBtn} disabled={busy} onClick={() => setShowCreate(false)}>
              {t('pass.console.cancel')}
            </button>
          </div>
        </form>
      )}

      {apps === null ? (
        <p className="text-lg text-muted">{t('pass.wait')}</p>
      ) : apps.length === 0 ? (
        <PassEmpty>{t('pass.console.noApps')}</PassEmpty>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {apps.map((a) => (
            <li key={a.id}>
              <Link
                to={consoleAppPath(orgSlug, a.id)}
                className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition-colors hover:border-brand lg:p-8"
              >
                <strong className="truncate text-xl font-bold text-ink">{a.name}</strong>
                <span className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`whitespace-nowrap rounded-xl border px-3 py-1 text-xs font-bold uppercase ${envBadgeClass(a.environment)}`}>
                    {a.environment}
                  </span>
                  <span className={`whitespace-nowrap rounded-xl border px-3 py-1 text-xs font-bold uppercase ${statusBadgeClass(a.status)}`}>
                    {a.status}
                  </span>
                  <span className="whitespace-nowrap rounded-xl border border-line px-3 py-1 text-xs font-semibold text-muted">
                    {a.client_type}
                  </span>
                </span>
                <span dir="ltr" className="mt-4 block truncate font-mono text-sm text-muted">
                  {a.client_id ?? ''}
                </span>
                <span className="mt-4 text-base font-semibold text-brand">{t('pass.console.openApp')}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PassSection>
  );
}
