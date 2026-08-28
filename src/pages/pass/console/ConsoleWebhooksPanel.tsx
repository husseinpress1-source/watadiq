import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyField from '../../../components/pass/CopyField';
import PassMultiSelect from '../../../components/pass/PassMultiSelect';
import { oBtn, oBtnSm, oInput, oLabel, PassEmpty, PassRow, PassRowList, PassSection } from '../../../components/pass/pass-ui';
import { passApi, WEBHOOK_EVENTS, type Webhook, type WebhookDelivery } from '../../../lib/watad-pass';

type Props = {
  orgSlug: string;
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
};

export default function ConsoleWebhooksPanel({ orgSlug, busy, setBusy, setError, setNotice }: Props) {
  const { t } = useTranslation();
  const [hooks, setHooks] = useState<Webhook[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['consent.granted']);

  function load() {
    passApi.webhooks(orgSlug).then((r) => setHooks(r.webhooks)).catch(() => setHooks([]));
  }

  useEffect(load, [orgSlug]);

  useEffect(() => {
    if (!selectedId) { setDeliveries([]); return; }
    passApi.webhookDeliveries(orgSlug, selectedId).then((r) => setDeliveries(r.deliveries)).catch(() => setDeliveries([]));
  }, [orgSlug, selectedId]);

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!events.length) return;
    setBusy(true);
    setWebhookSecret(null);
    try {
      const res = await passApi.createWebhook(orgSlug, url.trim(), events);
      setWebhookSecret(res.secret);
      setNotice(t('pass.console.webhookCreated'));
      setUrl('');
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t('pass.console.confirmDeleteWebhook'))) return;
    setBusy(true);
    try {
      await passApi.deleteWebhook(orgSlug, id);
      if (selectedId === id) setSelectedId(null);
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function rotate(id: string) {
    setBusy(true);
    try {
      const res = await passApi.rotateWebhookSecret(orgSlug, id);
      setWebhookSecret(res.secret);
      setNotice(t('pass.console.webhookSecretRotated'));
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 xl:grid-cols-2">
      <PassSection title={t('pass.console.webhooksTitle')} hint={t('pass.console.webhooksHint')}>
        <form onSubmit={create} className="grid gap-6">
          <label className="block">
            <span className={oLabel}>{t('pass.console.webhookUrl')}</span>
            <input
              required
              dir="ltr"
              placeholder="https://your-app.com/webhooks/watad"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={oInput}
            />
          </label>

          <PassMultiSelect
            label={t('pass.console.webhookEvents')}
            hint={t('pass.console.webhookEventsPlaceholder')}
            values={events}
            options={WEBHOOK_EVENTS}
            onChange={setEvents}
            disabled={busy}
            selectAllLabel={t('pass.console.selectAllEvents')}
            clearLabel={t('pass.console.clearEvents')}
          />

          <button type="submit" className={`${oBtn} w-full text-lg`} disabled={busy || !events.length}>
            {t('pass.console.createWebhook')}
          </button>
        </form>

        {webhookSecret && (
          <div className="mt-8 rounded-2xl border border-line p-6">
            <CopyField label={t('pass.console.webhookSecret')} value={webhookSecret} />
            <p className="mt-3 text-base text-muted">{t('pass.console.secretOnce')}</p>
          </div>
        )}
      </PassSection>

      <PassSection title={t('pass.console.yourWebhooks')}>
        {hooks === null ? (
          <p className="text-lg text-muted">{t('pass.wait')}</p>
        ) : hooks.length === 0 ? (
          <PassEmpty>{t('pass.console.noWebhooks')}</PassEmpty>
        ) : (
          <PassRowList>
            {hooks.map((h) => (
              <PassRow
                key={h.id}
                main={
                  <>
                    <strong dir="ltr" className="min-w-0 truncate font-mono text-lg">{h.url}</strong>
                    <span className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto">
                      {h.events.map((ev) => (
                        <span key={ev} dir="ltr" className="whitespace-nowrap rounded-xl border border-line px-3 py-1 font-mono text-sm">{ev}</span>
                      ))}
                      <span className="whitespace-nowrap rounded-xl border border-line px-3 py-1 text-sm">{h.status}</span>
                    </span>
                  </>
                }
                action={
                  <>
                    <button type="button" className={oBtnSm} onClick={() => setSelectedId(h.id)}>{t('pass.console.viewDeliveries')}</button>
                    <button type="button" className={oBtnSm} onClick={() => rotate(h.id)}>{t('pass.console.rotateWebhookSecret')}</button>
                    <button type="button" className={oBtnSm} onClick={() => remove(h.id)}>{t('pass.remove')}</button>
                  </>
                }
              />
            ))}
          </PassRowList>
        )}
      </PassSection>

      {selectedId && (
        <div className="xl:col-span-2">
          <PassSection title={t('pass.console.deliveriesTitle')}>
            {deliveries.length === 0 ? (
              <PassEmpty>{t('pass.console.noDeliveries')}</PassEmpty>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-soft text-start">
                      <th className="px-6 py-4 text-start text-sm font-bold text-muted">{t('pass.console.event')}</th>
                      <th className="px-6 py-4 text-start text-sm font-bold text-muted">{t('pass.console.status')}</th>
                      <th className="px-6 py-4 text-start text-sm font-bold text-muted">{t('pass.console.attempt')}</th>
                      <th className="px-6 py-4 text-start text-sm font-bold text-muted">{t('pass.console.time')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d, i) => (
                      <tr key={d.id} className={i > 0 ? 'border-t border-line' : ''}>
                        <td dir="ltr" className="px-6 py-4 font-mono">{d.event_type}</td>
                        <td className="px-6 py-4 font-mono">{d.response_status || ''}</td>
                        <td className="px-6 py-4 font-mono">{d.attempt}</td>
                        <td dir="ltr" className="px-6 py-4 font-mono text-muted">{d.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PassSection>
        </div>
      )}
    </div>
  );
}
