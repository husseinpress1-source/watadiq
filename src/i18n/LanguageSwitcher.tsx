import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LOCALE_OPTIONS } from './helpers';
import LocaleFlag from './LocaleFlag';
import './LanguageSwitcher.scss';

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer' | 'mobile';
}

const ease = [0.22, 1, 0.36, 1] as const;

function LanguageHeaderDropdown({
  open,
  activeCode,
  onSelect,
  reduceMotion,
}: {
  open: boolean;
  activeCode: string;
  onSelect: (code: string) => void;
  reduceMotion: boolean;
}) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lang-dropdown"
          role="menu"
          aria-label={t('common.language')}
          initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease }}
        >
          <ul className="lang-dropdown__list">
            {LOCALE_OPTIONS.map((option) => {
              const selected = activeCode === option.code;
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`lang-dropdown__item${selected ? ' is-active' : ''}`}
                    onClick={() => onSelect(option.code)}
                  >
                    <span className="lang-dropdown__flag" aria-hidden="true">
                      <LocaleFlag code={option.code} />
                    </span>
                    <span className="lang-dropdown__label">{t(option.labelKey)}</span>
                    {selected && (
                      <svg className="lang-dropdown__check" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LanguagePickerDialog({
  open,
  onClose,
  activeCode,
  onSelect,
  reduceMotion,
}: {
  open: boolean;
  onClose: () => void;
  activeCode: string;
  onSelect: (code: string) => void;
  reduceMotion: boolean;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lang-picker"
          className="lang-picker"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          onClick={onClose}
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
              onClick={onClose}
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
                      onClick={() => onSelect(option.code)}
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
  );
}

export default function LanguageSwitcher({ variant = 'footer' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const headerRef = useRef<HTMLDivElement>(null);

  const activeCode = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const activeOption = LOCALE_OPTIONS.find((option) => option.code === activeCode) ?? LOCALE_OPTIONS[0];

  function setLanguage(code: string) {
    void i18n.changeLanguage(code);
    setPickerOpen(false);
  }

  useEffect(() => {
    if (variant !== 'header' || !pickerOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPickerOpen(false);
    }

    function onPointerDown(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [pickerOpen, variant]);

  if (variant === 'header') {
    return (
      <div className="lang-switcher lang-switcher--header-wrap" ref={headerRef}>
        <button
          type="button"
          className={`lang-switcher lang-switcher--header${pickerOpen ? ' is-open' : ''}`}
          onClick={() => setPickerOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
        >
          <span className="lang-switcher__header-flag" aria-hidden="true">
            <LocaleFlag code={activeCode} />
          </span>
          <span className="lang-switcher__header-label">{t(activeOption.labelKey)}</span>
          <svg className="lang-switcher__header-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>

        <LanguageHeaderDropdown
          open={pickerOpen}
          activeCode={activeCode}
          onSelect={setLanguage}
          reduceMotion={reduceMotion}
        />
      </div>
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

        <LanguagePickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          activeCode={activeCode}
          onSelect={setLanguage}
          reduceMotion={reduceMotion}
        />
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
