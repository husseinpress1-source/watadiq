import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWatadAuth, userInitials, userLabel } from '../context/WatadAuthContext';
import './WatadUserMenu.scss';

interface WatadUserMenuProps {
  variant?: 'header' | 'mobile';
}

export default function WatadUserMenu({ variant = 'header' }: WatadUserMenuProps) {
  const { t } = useTranslation();
  const { user, loading, openSignIn, logout } = useWatadAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        type="button"
        className={variant === 'mobile' ? 'watad-user-menu__signin-mobile' : 'met-btn met-header__pass-cta'}
        onClick={() => openSignIn('login')}
        aria-label={t('pass.navCta')}
      >
        <img
          src="/images/watad-one-lockup-64.png"
          alt="WATAD ONE"
          className="watad-user-menu__signin-logo"
          height={variant === 'mobile' ? 22 : 20}
          width={variant === 'mobile' ? 66 : 60}
        />
        {variant !== 'mobile' && t('pass.navCta')}
      </button>
    );
  }

  const label = userLabel(user);

  return (
    <div className={`watad-user-menu${variant === 'mobile' ? ' watad-user-menu--mobile' : ''}`} ref={rootRef}>
      <button
        type="button"
        className={`watad-user-menu__trigger watad-user-menu__trigger--${variant}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="watad-user-menu__avatar" aria-hidden="true">
          {user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{userInitials(user)}</span>}
        </span>
        <span className="watad-user-menu__name">{label}</span>
        <svg className="watad-user-menu__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="watad-user-menu__panel" role="menu">
          <div className="watad-user-menu__head">
            <span className="watad-user-menu__avatar watad-user-menu__avatar--lg">
              {user.avatar_url ? <img src={user.avatar_url} alt="" /> : <span>{userInitials(user)}</span>}
            </span>
            <div className="watad-user-menu__meta">
              <strong>{label}</strong>
              <span dir="ltr">{user.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="watad-user-menu__item"
            role="menuitem"
            onClick={() => { setOpen(false); openSignIn('profile'); }}
          >
            {t('pass.signInModal.editProfile')}
          </button>
          <Link to="/pass/console" className="watad-user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            {t('pass.platformTabs.console')}
          </Link>
          <Link to="/pass/developers" className="watad-user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            {t('pass.signInModal.forDevelopers')}
          </Link>
          <hr className="watad-user-menu__sep" />
          <button
            type="button"
            className="watad-user-menu__item watad-user-menu__item--danger"
            role="menuitem"
            onClick={() => { setOpen(false); void logout(); }}
          >
            {t('pass.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
