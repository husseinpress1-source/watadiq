import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLayout } from '../context/LayoutContext';
import { navHrefs } from '../data/homepage';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import './MobileMenu.scss';

const ease = [0.22, 1, 0.36, 1] as const;

export default function MobileMenu() {
  const { menuOpen, closeMenu } = useLayout();
  const { t } = useTranslation();
  const location = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const overlay = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.28 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };

  const panel = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.22, ease } },
      };

  const list = {
    show: {
      transition: reduceMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
        exit: { opacity: 0, y: 12, transition: { duration: 0.15 } },
      };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('common.openMenu')}
          initial="hidden"
          animate="show"
          exit="exit"
          variants={overlay}
        >
          <motion.div className="mobile-menu__page" variants={panel}>
            <button
              type="button"
              className="mobile-menu__close"
              onClick={closeMenu}
              aria-label={t('common.closeMenu')}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

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
                        {t(`nav.${link.key}`)}
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </nav>

            <motion.div
              className="mobile-menu__footer"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.35, ease }}
            >
              <LanguageSwitcher variant="mobile" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
