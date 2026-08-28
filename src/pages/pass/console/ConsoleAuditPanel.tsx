import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { passApi, type AuditEvent } from '../../../lib/watad-pass';

type Props = { orgSlug: string };

export default function ConsoleAuditPanel({ orgSlug }: Props) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<AuditEvent[] | null>(null);

  useEffect(() => {
    passApi.audit(orgSlug).then((r) => setEvents(r.events)).catch(() => setEvents([]));
  }, [orgSlug]);

  return (
    <section className="pass-panel">
      <h2>{t('pass.console.auditTitle')}</h2>
      <p className="pass-panel__hint">{t('pass.console.auditHint')}</p>

      {events === null ? (
        <p>{t('pass.wait')}</p>
      ) : events.length === 0 ? (
        <p className="pass-empty">{t('pass.console.noAudit')}</p>
      ) : (
        <div className="pass-audit-table-wrap">
          <table className="pass-audit-table">
            <thead>
              <tr>
                <th>{t('pass.console.action')}</th>
                <th>{t('pass.console.actor')}</th>
                <th>{t('pass.console.target')}</th>
                <th>{t('pass.console.time')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td dir="ltr">{e.action}</td>
                  <td dir="ltr">{e.actor_type}:{e.actor_id.slice(0, 8)}…</td>
                  <td dir="ltr">{e.target_type}:{e.target_id.slice(0, 8)}…</td>
                  <td dir="ltr">{e.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
