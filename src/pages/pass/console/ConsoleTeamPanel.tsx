import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyField from '../../../components/pass/CopyField';
import PassSelect from '../../../components/pass/PassSelect';
import { passApi, MEMBER_ROLES, type Member } from '../../../lib/watad-pass';

type Props = {
  orgSlug: string;
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string | null) => void;
  setNotice: (v: string | null) => void;
};

export default function ConsoleTeamPanel({ orgSlug, busy, setBusy, setError, setNotice }: Props) {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('developer');
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  function load() {
    passApi.members(orgSlug).then((r) => setMembers(r.members)).catch(() => setMembers([]));
  }

  useEffect(load, [orgSlug]);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInviteToken(null);
    try {
      const res = await passApi.inviteMember(orgSlug, inviteEmail.trim(), inviteRole);
      setInviteToken(res.invite_token);
      setNotice(t('pass.console.inviteSent'));
      setInviteEmail('');
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(userId: string, role: string) {
    setBusy(true);
    try {
      await passApi.changeMemberRole(orgSlug, userId, role);
      setNotice(t('pass.console.roleUpdated'));
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string, email: string) {
    if (!window.confirm(t('pass.console.confirmRemoveMember', { email }))) return;
    setBusy(true);
    try {
      await passApi.removeMember(orgSlug, userId);
      load();
    } catch {
      setError(t('pass.errors.generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="pass-panel">
      <h2>{t('pass.console.teamTitle')}</h2>
      <p className="pass-panel__hint">{t('pass.console.teamHint')}</p>

      <form className="account-form pass-form pass-console-invite" onSubmit={invite}>
        <label className="account-form__field">
          <span>{t('pass.console.inviteEmail')}</span>
          <input type="email" required dir="ltr" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
        </label>
        <div className="account-form__field">
          <PassSelect
            label={t('pass.console.inviteRole')}
            value={inviteRole}
            onChange={setInviteRole}
            options={MEMBER_ROLES.map((r) => ({ value: r, label: t(`pass.console.roles.${r}`) }))}
          />
        </div>
        <button type="submit" className="pass-btn pass-btn--solid pass-btn--lg" disabled={busy}>
          {t('pass.console.inviteBtn')}
        </button>
      </form>

      {inviteToken && (
        <div className="pass-secret-warn">
          <CopyField label={t('pass.console.inviteToken')} value={inviteToken} />
          <p>{t('pass.console.inviteTokenHint')}</p>
        </div>
      )}

      {members === null ? (
        <p>{t('pass.wait')}</p>
      ) : members.length === 0 ? (
        <p className="pass-empty">{t('pass.console.noMembers')}</p>
      ) : (
        <ul className="pass-key-list pass-team-list">
          {members.map((m) => (
            <li key={m.user_id}>
              <div>
                <strong>{m.display_name || m.email}</strong>
                <span dir="ltr">{m.email}</span>
                <span className="pass-meta">{m.joined_at}</span>
              </div>
              <div className="pass-team-list__actions">
                <div className="w-44">
                  <PassSelect
                    value={m.role}
                    disabled={busy}
                    onChange={(role) => changeRole(m.user_id, role)}
                    options={MEMBER_ROLES.map((r) => ({ value: r, label: t(`pass.console.roles.${r}`) }))}
                  />
                </div>
                <button type="button" className="pass-btn pass-btn--outline pass-btn--sm" onClick={() => remove(m.user_id, m.email)}>
                  {t('pass.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
