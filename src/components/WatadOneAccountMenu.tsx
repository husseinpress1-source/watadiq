import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../context/LayoutContext';
import { useWatadOne } from '../context/WatadOneContext';
import './WatadOneAccountMenu.scss';

type Props = {
  variant?: 'header' | 'mobile' | 'mobileMenu';
};

export default function WatadOneAccountMenu({ variant = 'header' }: Props) {
  const { t } = useTranslation();
  const { closeMenu } = useLayout();
  const { account, loading, isAdmin, logout } = useWatadOne();

  function leaveMenu() {
    if (variant === 'mobileMenu') closeMenu();
  }

  if (loading) return null;

  if (!account) {
    if (variant === 'mobile' || variant === 'mobileMenu') {
      return (
        <Link
          to="/account/sign-in"
          className={`watad-account-nav watad-account-nav--mobile${variant === 'mobileMenu' ? ' watad-account-nav--mobile-menu' : ''}`}
          onClick={leaveMenu}
        >
          {t('auth.signIn')}
        </Link>
      );
    }
    return (
      <Link to="/account/sign-in" className="met-header__signin">
        {t('auth.signIn')}
      </Link>
    );
  }

  if (variant === 'mobileMenu') {
    const firstName = account.fullName.trim().split(/\s+/)[0] || account.fullName;

    return (
      <div className="watad-account-nav watad-account-nav--mobile-menu-signed">
        <p className="watad-account-nav__menu-greeting">
          {t('auth.signedInAs', { name: firstName })}
        </p>
        {isAdmin ? (
          <Link to="/admin/blog" className="watad-account-nav__menu-secondary" onClick={leaveMenu}>
            {t('adminBlog.shortNav')}
          </Link>
        ) : null}
        <button
          type="button"
          className="watad-account-nav__menu-signout"
          onClick={() => {
            leaveMenu();
            logout();
          }}
        >
          {t('auth.signOut')}
        </button>
      </div>
    );
  }

  return (
    <div className={`watad-account-nav watad-account-nav--signed watad-account-nav--${variant}`}>
      {isAdmin ? (
        <Link to="/admin/blog" className="watad-account-nav__pill" onClick={leaveMenu}>
          {t('adminBlog.shortNav')}
        </Link>
      ) : null}
      <span className="watad-account-nav__label">{account.fullName.split(' ')[0]}</span>
      <button
        type="button"
        className="watad-account-nav__out"
        onClick={() => {
          leaveMenu();
          logout();
        }}
      >
        {t('auth.signOut')}
      </button>
    </div>
  );
}
