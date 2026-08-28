import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PassPageShell from '../../components/PassPageShell';
import PassOrgTabs from '../../components/pass/PassOrgTabs';
import PassSelect from '../../components/pass/PassSelect';
import { PassAlert, PassPageTitle } from '../../components/pass/pass-ui';
import { passApi, PassApiError, type Org } from '../../lib/watad-pass';
import ConsoleOrgWizard from './console/ConsoleOrgWizard';
import ConsoleAppsPanel from './console/ConsoleAppsPanel';
import ConsoleTeamPanel from './console/ConsoleTeamPanel';
import ConsoleWebhooksPanel from './console/ConsoleWebhooksPanel';
import ConsoleAuditPanel from './console/ConsoleAuditPanel';

export default function WatadPassConsolePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgFromUrl = searchParams.get('org') ?? '';

  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [orgSlug, setOrgSlug] = useState(orgFromUrl);
  const [orgTab, setOrgTab] = useState('apps');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadOrgs = useCallback(() => {
    passApi.myOrgs()
      .then((r) => {
        setOrgs(r.organizations);
        const preferred = orgFromUrl || orgSlug;
        const match = r.organizations.find((o) => o.slug === preferred);
        if (match) setOrgSlug(match.slug);
        else if (r.organizations.length) setOrgSlug(r.organizations[0].slug);
      })
      .catch((err) => {
        if (err instanceof PassApiError && err.status === 401) {
          navigate('/pass/login?return_to=/pass/console', { replace: true });
        } else setError(t('pass.errors.generic'));
      });
  }, [navigate, orgFromUrl, orgSlug, t]);

  useEffect(loadOrgs, [loadOrgs]);

  const orgTabs = useMemo(() => [
    { key: 'apps', label: t('pass.console.tabs.apps') },
    { key: 'team', label: t('pass.console.tabs.team') },
    { key: 'webhooks', label: t('pass.console.tabs.webhooks') },
    { key: 'audit', label: t('pass.console.tabs.audit') },
  ], [t]);

  async function createOrg(name: string, slug: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const org = await passApi.createOrg(name, slug);
      setOrgs([org]);
      setOrgSlug(org.slug);
      setNotice(t('pass.console.orgCreated'));
      await passApi.myOrgs().then((r) => {
        setOrgs(r.organizations);
        const match = r.organizations.find((o) => o.slug === org.slug);
        if (match) setOrgSlug(match.slug);
      });
    } catch (err) {
      setError(err instanceof PassApiError && err.code === 'slug_taken' ? t('pass.console.slugTaken') : t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  const panelProps = { orgSlug, busy, setBusy, setError, setNotice };

  return (
    <PassPageShell>
      <PassPageTitle title={t('pass.console.title')} lead={t('pass.console.intro')} />

      {error && <PassAlert role="alert">{error}</PassAlert>}
      {notice && <PassAlert>{notice}</PassAlert>}

      {orgs === null ? (
        <p className="text-sm text-muted">{t('pass.wait')}</p>
      ) : orgs.length === 0 ? (
        <ConsoleOrgWizard busy={busy} onCreate={createOrg} />
      ) : (
        <>
          <div className="mb-10 max-w-lg">
            <PassSelect
              label={t('pass.console.selectOrg')}
              value={orgSlug}
              onChange={setOrgSlug}
              options={orgs.map((o) => ({
                value: o.slug,
                label: o.name,
                sub: o.slug,
                chip: o.my_role || undefined,
              }))}
            />
          </div>

          <PassOrgTabs tabs={orgTabs} active={orgTab} onChange={setOrgTab} />

          {orgTab === 'apps' && <ConsoleAppsPanel {...panelProps} />}
          {orgTab === 'team' && <ConsoleTeamPanel {...panelProps} />}
          {orgTab === 'webhooks' && <ConsoleWebhooksPanel {...panelProps} />}
          {orgTab === 'audit' && <ConsoleAuditPanel orgSlug={orgSlug} />}
        </>
      )}
    </PassPageShell>
  );
}
