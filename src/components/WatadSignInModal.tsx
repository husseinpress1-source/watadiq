import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { useTranslation } from 'react-i18next';

import { useWatadAuth, userInitials, userLabel } from '../context/WatadAuthContext';

import { passApi } from '../lib/watad-pass';

import './WatadSignInModal.scss';



export default function WatadSignInModal() {

  const { t } = useTranslation();

  const { user, signInOpen, signInView, closeSignIn, refreshUser } = useWatadAuth();

  const dialogRef = useRef<HTMLDivElement>(null);



  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');

  const [profileNotice, setProfileNotice] = useState<string | null>(null);



  useEffect(() => {

    if (!signInOpen || !user) return;

    setDisplayName(user.display_name ?? '');

    setAvatarUrl(user.avatar_url ?? '');

    setError(null);

    setProfileNotice(null);

  }, [signInOpen, user]);



  useEffect(() => {

    if (!signInOpen) return;

    const onKey = (e: KeyboardEvent) => {

      if (e.key === 'Escape') closeSignIn();

    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);

  }, [signInOpen, closeSignIn]);



  if (!signInOpen || signInView !== 'profile' || !user) return null;



  async function saveProfile(e: FormEvent) {

    e.preventDefault();

    setBusy(true);

    setError(null);

    setProfileNotice(null);

    try {

      await passApi.updateProfile({

        display_name: displayName.trim(),

        avatar_url: avatarUrl.trim(),

      });

      await refreshUser();

      setProfileNotice(t('pass.signInModal.profileSaved'));

    } catch {

      setError(t('pass.errors.generic'));

    } finally {

      setBusy(false);

    }

  }



  function onAvatarFile(e: ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0];

    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 180_000) {

      setError(t('pass.signInModal.avatarTooLarge'));

      return;

    }

    const reader = new FileReader();

    reader.onload = () => {

      if (typeof reader.result === 'string') setAvatarUrl(reader.result);

    };

    reader.readAsDataURL(file);

  }



  return (

    <div className="watad-signin" role="presentation" onClick={closeSignIn}>

      <div

        ref={dialogRef}

        className="watad-signin__dialog"

        role="dialog"

        aria-modal="true"

        aria-labelledby="watad-signin-title"

        onClick={(e) => e.stopPropagation()}

      >

        <button type="button" className="watad-signin__close" onClick={closeSignIn} aria-label={t('common.closeMenu')}>

          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

            <path d="M18 6L6 18M6 6l12 12" />

          </svg>

        </button>



        <div className="watad-signin__brand">

          <img
            src="/images/watad-one-lockup-44.png"
            alt="WATAD ONE"
            className="watad-signin__brand-logo"
            height={44}
            width={132}
          />

        </div>



        <h2 id="watad-signin-title" className="watad-signin__title">{t('pass.signInModal.profileTitle')}</h2>

        <p className="watad-signin__lead">{t('pass.signInModal.profileLead')}</p>



        {error && <p className="watad-signin__error" role="alert">{error}</p>}

        {profileNotice && <p className="watad-signin__notice">{profileNotice}</p>}



        <form className="watad-signin__form" onSubmit={saveProfile}>

          <div className="watad-signin__avatar-row">

            <div className="watad-signin__avatar-preview" aria-hidden="true">

              {avatarUrl ? (

                <img src={avatarUrl} alt="" />

              ) : (

                <span>{userInitials(user)}</span>

              )}

            </div>

            <label className="watad-signin__avatar-upload">

              <input type="file" accept="image/*" onChange={onAvatarFile} hidden />

              {t('pass.signInModal.changePhoto')}

            </label>

          </div>



          <label className="watad-signin__field">

            <span>{t('pass.signInModal.displayName')}</span>

            <input

              type="text"

              value={displayName}

              onChange={(e) => setDisplayName(e.target.value)}

              placeholder={userLabel(user)}

              maxLength={80}

            />

          </label>



          <label className="watad-signin__field">

            <span>{t('pass.email')}</span>

            <input type="email" value={user.email} disabled dir="ltr" />

          </label>



          <button type="submit" className="watad-signin__primary" disabled={busy}>

            {busy ? t('pass.wait') : t('pass.signInModal.saveProfile')}

          </button>

        </form>

      </div>

    </div>

  );

}


