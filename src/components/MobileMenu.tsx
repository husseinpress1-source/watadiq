import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLayout } from '../context/LayoutContext';
import { navHrefs } from '../data/homepage';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import WatadOneAccountMenu from './WatadOneAccountMenu';
import WatadWordmark from './WatadWordmark';
import './MobileMenu.scss';

const ease = [0.22, 1, 0.36, 1] as const;

export default function MobileMenu() {
  const { menuOpen, closeMenu } = useLayout();
  const { t, i18n } = useTranslation();
  const menuDir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
  const location = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const screen = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.28 } },
        exit: { opacity: 0, transition: { duration: 0.22 } },
      };

  const list = {
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.05, delayChildren: 0.06 },
    },
  };

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
        exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
      };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="mobile-menu"
          className={`mobile-menu mobile-menu--${menuDir}`}
          dir={menuDir}
          role="dialog"
          aria-modal="true"
          aria-label={t('common.openMenu')}
          lang={i18n.language.startsWith('ar') ? 'ar' : 'en'}
          initial="hidden"
          animate="show"
          exit="exit"
          variants={screen}
        >
          <header className="mobile-menu__head">
            <span className="mobile-menu__head-spacer" aria-hidden="true" />
            <Link to="/" className="mobile-menu__logo" onClick={closeMenu} aria-label={t('common.home')}>
              <WatadWordmark compact />
            </Link>
            <button
              type="button"
              className="mobile-menu__close"
              onClick={closeMenu}
              aria-label={t('common.closeMenu')}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <nav className="mobile-menu__nav" aria-label="Main navigation">
            <motion.ul variants={list} initial="hidden" animate="show" exit="hidden">
              {navHrefs.map((link) => {
                const active =
                  location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);

                return (
                  <motion.li key={link.key} variants={item}>
                    <Link
                      to={link.href}
                      className={`mobile-menu__link${active ? ' is-active' : ''}`}
                      onClick={closeMenu}
                    >
                      <span className="mobile-menu__link-text">{t(`nav.${link.key}`)}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </nav>

          <motion.footer
            className="mobile-menu__footer"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.35, duration: 0.35, ease }}
          >
            <div className="mobile-menu__actions">
              <WatadOneAccountMenu variant="mobileMenu" />
              <LanguageSwitcher variant="mobileMenu" />
            </div>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
