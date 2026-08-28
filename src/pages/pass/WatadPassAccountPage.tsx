import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import CopyField from '../../components/pass/CopyField';
import {
  cleanPassText,
  fmtPassDate,
  oBtn,
  oBtnSm,
  PassAlert,
  PassDataRow,
  PassDataTable,
  PassEmpty,
  PassPageTitle,
  PassSection,
  PassStatGrid,
  PassToolbar,
} from '../../components/pass/pass-ui';
import { passApi, PassApiError } from '../../lib/watad-pass';
import type { Device, LinkedApp, Org, Passkey, PassUser } from '../../lib/watad-pass';
import { createPasskey, webauthnSupported } from '../../lib/webauthn';

export default function WatadPassAccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<PassUser | null>(null);
  const [keys, setKeys] = useState<Passkey[] | null>(null);
  const [linked, setLinked] = useState<LinkedApp[] | null>(null);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [recoveryLeft, setRecoveryLeft] = useState<number | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passkeyReady, setPasskeyReady] = useState(false);

  useEffect(() => setPasskeyReady(webauthnSupported()), []);

  const load = useCallback(() => {
    passApi.me()
      .then((r) => setUser(r.user))
      .catch((err) => {
        if (err instanceof PassApiError && err.status === 401) {
          navigate('/pass/login?return_to=/pass/account', { replace: true });
        } else setError(t('pass.errors.generic'));
      });
    passApi.passkeys().then((r) => setKeys(r.passkeys)).catch(() => setKeys([]));
    passApi.linkedApps().then((r) => setLinked(r.consents)).catch(() => setLinked([]));
    passApi.devices().then((r) => setDevices(r.devices)).catch(() => setDevices([]));
    passApi.myOrgs().then((r) => setOrgs(r.organizations)).catch(() => setOrgs([]));
    passApi.recoveryCodesRemaining().then((r) => setRecoveryLeft(r.remaining)).catch(() => setRecoveryLeft(0));
  }, [navigate, t]);

  useEffect(load, [load]);

  async function addPasskey() {
    setBusy(true);
    setError(null);
    try {
      const begin = await passApi.passkeyRegisterBegin();
      const credential = await createPasskey((begin.publicKey ?? begin) as Record<string, unknown>);
      await passApi.passkeyRegisterFinish(credential);
      setNotice(t('pass.passkeyAdded'));
      load();
    } catch (err) {
      if (!(err instanceof Error && err.message === 'cancelled')) {
        setError(t('pass.errors.passkey'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function removePasskey(id: string) {
    if (!window.confirm(t('pass.confirmRevokePasskey'))) return;
    setBusy(true);
    try {
      await passApi.revokePasskey(id);
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function revokeApp(id: string, name: string) {
    if (!window.confirm(t('pass.confirmRevokeApp', { name }))) return;
    setBusy(true);
    setError(null);
    try {
      await passApi.revokeLinkedApp(id);
      setNotice(t('pass.appRevoked'));
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function generateRecovery() {
    if (!window.confirm(t('pass.recovery.confirmGenerate'))) return;
    setBusy(true);
    setError(null);
    try {
      const res = await passApi.generateRecoveryCodes();
      setRecoveryCodes(res.codes);
      setNotice(t('pass.recovery.generated'));
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await passApi.logout().catch(() => undefined);
    navigate('/pass', { replace: true });
  }

  if (!user) {
    return (
      <PassPageShell hideSubnav>
        <p className="py-16 text-center text-lg text-muted">{t('pass.wait')}</p>
      </PassPageShell>
    );
  }

  const stats = [
    { label: t('pass.dashboard.linkedApps'), value: linked?.length ?? '' },
    { label: t('pass.dashboard.passkeys'), value: keys?.length ?? '' },
    { label: t('pass.dashboard.devices'), value: devices?.length ?? '' },
    { label: t('pass.dashboard.orgs'), value: orgs?.length ?? '' },
  ];

  const colDevice = t('pass.dashboard.colDevice');
  const colStatus = t('pass.dashboard.colStatus');
  const colDate = t('pass.dashboard.colDate');
  const colAction = t('pass.dashboard.colAction');

  return (
    <PassPageShell>
      <PassPageTitle title={t('pass.dashboard.title')} lead={t('pass.welcome', { email: user.email })} />

      {error && <PassAlert role="alert">{error}</PassAlert>}
      {notice && <PassAlert>{notice}</PassAlert>}

      <PassStatGrid items={stats} />

      <PassSection title={t('pass.passkeysTitle')} hint={t('pass.passkeysBiometricHint')}>
        {passkeyReady && (
          <PassToolbar>
            <button type="button" className={oBtnSm} disabled={busy} onClick={addPasskey}>
              {busy ? t('pass.wait') : t('pass.addBiometricPasskey')}
            </button>
          </PassToolbar>
        )}
        {keys === null ? (
          <p className="text-lg text-muted">{t('pass.wait')}</p>
        ) : keys.length === 0 ? (
          <PassEmpty>{t('pass.noPasskeys')}</PassEmpty>
        ) : (
          <PassDataTable columns={[colDevice, colStatus, colDate, colAction]}>
            {keys.map((k) => (
              <PassDataRow
                key={k.id}
                col1={cleanPassText(k.device_label || t('pass.passkeyDefaultLabel'))}
                col2={k.backed_up ? t('pass.passkeyBackedUp') : t('pass.passkeyLocal')}
                col3={fmtPassDate(k.last_used_at ?? k.created_at)}
                action={
                  <button type="button" className={oBtnSm} onClick={() => removePasskey(k.id)}>
                    {t('pass.remove')}
                  </button>
                }
              />
            ))}
          </PassDataTable>
        )}
      </PassSection>

      <PassSection title={t('pass.devicesTitle')} hint={t('pass.devicesHint')}>
        {devices === null ? (
          <p className="text-lg text-muted">{t('pass.wait')}</p>
        ) : devices.length === 0 ? (
          <PassEmpty>{t('pass.noDevices')}</PassEmpty>
        ) : (
          <PassDataTable columns={[colDevice, t('pass.dashboard.colPlatform'), colDate]}>
            {devices.map((d) => (
              <PassDataRow
                key={d.id}
                col1={cleanPassText(d.label || d.platform)}
                col2={cleanPassText(d.platform)}
                col3={fmtPassDate(d.last_seen_at)}
              />
            ))}
          </PassDataTable>
        )}
      </PassSection>

      <PassSection
        title={t('pass.recovery.title')}
        hint={t('pass.recovery.hint')}
        action={
          <button type="button" className={oBtnSm} disabled={busy} onClick={generateRecovery}>
            {t('pass.recovery.generate')}
          </button>
        }
      >
        <p className="text-lg">{t('pass.recovery.remaining', { count: recoveryLeft ?? 0 })}</p>
        {recoveryCodes && (
          <div className="mt-6 rounded-2xl border border-line p-6">
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recoveryCodes.map((c) => (
                <code key={c} dir="ltr" className="rounded-xl border border-line bg-soft px-3 py-3 text-center font-mono text-lg">{c}</code>
              ))}
            </div>
            <p className="mb-4 text-base text-muted">{t('pass.recovery.saveOnce')}</p>
            <CopyField label={t('pass.recovery.allCodes')} value={recoveryCodes.join('\n')} />
          </div>
        )}
      </PassSection>

      <PassSection title={t('pass.linkedAppsTitle')} hint={t('pass.linkedAppsHint')}>
        {linked === null ? (
          <p className="text-lg text-muted">{t('pass.wait')}</p>
        ) : linked.length === 0 ? (
          <PassEmpty>{t('pass.noLinkedApps')}</PassEmpty>
        ) : (
          <PassDataTable columns={[t('pass.dashboard.colApp'), t('pass.dashboard.colScopes'), colDate, colAction]}>
            {linked.map((app) => (
              <PassDataRow
                key={app.id}
                col1={app.app_name}
                col2={app.scopes.join(', ')}
                col3={fmtPassDate(app.granted_at)}
                action={
                  <button type="button" className={oBtnSm} disabled={busy} onClick={() => revokeApp(app.id, app.app_name)}>
                    {t('pass.revokeApp')}
                  </button>
                }
              />
            ))}
          </PassDataTable>
        )}
      </PassSection>

      <PassSection title={t('pass.devPanelTitle')} hint={t('pass.devPanelHint')}>
        <div className="flex flex-nowrap gap-3">
          <Link to="/pass/console" className={oBtn}>{t('pass.openConsole')}</Link>
          <Link to="/pass/developers" className={oBtn}>{t('pass.platformTabs.developers')}</Link>
        </div>
      </PassSection>

      <div className="mt-12 pt-8">
        <button type="button" className={oBtn} onClick={logout}>{t('pass.logout')}</button>
      </div>
    </PassPageShell>
  );
}
