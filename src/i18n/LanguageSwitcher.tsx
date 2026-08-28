import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LOCALE_OPTIONS } from './helpers';
import LocaleFlag from './LocaleFlag';
import './LanguageSwitcher.scss';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'mobile';
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function LanguageSwitcher({ variant = 'footer' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  const activeCode = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const activeOption = LOCALE_OPTIONS.find((option) => option.code === activeCode) ?? LOCALE_OPTIONS[0];

  function setLanguage(code: string) {
    void i18n.changeLanguage(code);
    setPickerOpen(false);
  }

  useEffect(() => {
    if (variant !== 'mobile' || !pickerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPickerOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pickerOpen, variant]);

  if (variant === 'header') {
    const next = activeCode === 'ar' ? 'en' : 'ar';
    const label = activeCode === 'ar' ? t('common.arabic') : t('common.english');
    return (
      <button type="button" className="lang-switcher lang-switcher--header" onClick={() => setLanguage(next)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M2 12h20M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {label}
      </button>
    );
  }

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          className="lang-switcher__mobile-trigger"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
        >
          <span className="lang-switcher__mobile-flag" aria-hidden="true">
            <LocaleFlag code={activeCode} />
          </span>
          <span className="lang-switcher__mobile-copy">
            <span className="lang-switcher__mobile-label">{t(activeOption.labelKey)}</span>
            <span className="lang-switcher__mobile-sub">
              {activeCode === 'ar' ? t('common.arabicHint') : t('common.englishHint')}
            </span>
          </span>
          <span className="lang-switcher__mobile-chevron" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              key="lang-picker"
              className="lang-picker"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              onClick={() => setPickerOpen(false)}
            >
              <motion.div
                className="lang-picker__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lang-picker-title"
                initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="lang-picker__close"
                  onClick={() => setPickerOpen(false)}
                  aria-label={t('common.closeMenu')}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>

                <p className="lang-picker__eyebrow">{t('common.language')}</p>
                <h2 id="lang-picker-title" className="lang-picker__title">
                  {t('common.chooseLanguage')}
                </h2>

                <ul className="lang-picker__list">
                  {LOCALE_OPTIONS.map((option, index) => {
                    const selected = activeCode === option.code;
                    return (
                      <motion.li
                        key={option.code}
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.08 + index * 0.05, duration: 0.28, ease }}
                      >
                        <button
                          type="button"
                          className={`lang-picker__option${selected ? ' is-active' : ''}`}
                          onClick={() => setLanguage(option.code)}
                          aria-pressed={selected}
                        >
                          <span className="lang-picker__option-flag" aria-hidden="true">
                            <LocaleFlag code={option.code} />
                          </span>
                          <span className="lang-picker__option-text">
                            <span className="lang-picker__option-name">{t(option.labelKey)}</span>
                            <span className="lang-picker__option-hint">
                              {option.code === 'ar' ? t('common.arabicHint') : t('common.englishHint')}
                            </span>
                          </span>
                          <span className="lang-picker__option-check" aria-hidden="true">
                            {selected && (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M5 12.5l4.5 4.5L19 7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <ul className={`lang-switcher lang-switcher--${variant}`}>
      {LOCALE_OPTIONS.map(({ code, labelKey }) => (
        <li key={code}>
          <button
            type="button"
            className={activeCode === code ? 'is-active' : ''}
            onClick={() => setLanguage(code)}
          >
            {t(labelKey)}
          </button>
        </li>
      ))}
    </ul>
  );
}
