import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  busy: boolean;
  onCreate: (name: string, slug: string) => void;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
}

export default function ConsoleOrgWizard({ busy, onCreate }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    onCreate(orgName.trim(), orgSlug.trim() || slugify(orgName));
  }

  return (
    <section className="pass-wizard">
      <div className="pass-wizard__steps">
        {[1, 2, 3].map((n) => (
          <span key={n} className={step >= n ? 'is-done' : ''}>{n}</span>
        ))}
      </div>

      <h2>{t('pass.console.wizardTitle')}</h2>
      <p className="pass-panel__hint">{t('pass.console.wizardHint')}</p>

      {step === 1 && (
        <div className="pass-wizard__panel">
          <label className="account-form__field">
            <span>{t('pass.console.orgName')}</span>
            <input
              required
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
                setOrgSlug(slugify(e.target.value));
              }}
              placeholder={t('pass.console.orgNamePlaceholder')}
            />
          </label>
          <button type="button" className="pass-btn pass-btn--solid pass-btn--lg" disabled={!orgName.trim()} onClick={() => setStep(2)}>
            {t('pass.console.next')}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="pass-wizard__panel">
          <label className="account-form__field">
            <span>{t('pass.console.orgSlug')}</span>
            <input required dir="ltr" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
            <small>{t('pass.console.orgSlugHint')}</small>
          </label>
          <div className="pass-wizard__actions">
            <button type="button" className="pass-btn pass-btn--outline pass-btn--lg" onClick={() => setStep(1)}>
              {t('pass.console.back')}
            </button>
            <button type="button" className="pass-btn pass-btn--solid pass-btn--lg" disabled={!orgSlug.trim()} onClick={() => setStep(3)}>
              {t('pass.console.next')}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form className="pass-wizard__panel" onSubmit={submit}>
          <div className="pass-wizard__review">
            <div><strong>{t('pass.console.orgName')}</strong><span>{orgName}</span></div>
            <div><strong>{t('pass.console.orgSlug')}</strong><span dir="ltr">{orgSlug}</span></div>
          </div>
          <div className="pass-wizard__actions">
            <button type="button" className="pass-btn pass-btn--outline pass-btn--lg" onClick={() => setStep(2)}>
              {t('pass.console.back')}
            </button>
            <button type="submit" className="pass-btn pass-btn--solid pass-btn--lg" disabled={busy}>
              {busy ? t('pass.wait') : t('pass.console.createOrgBtn')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
