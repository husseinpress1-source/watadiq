import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './LegalMobileToc.scss';

type LegalMobileTocProps = {
  idPrefix: 'privacy' | 'terms';
  keys: readonly string[];
  getTitle: (key: string) => string;
  activeKey: string;
};

export default function LegalMobileToc({ idPrefix, keys, getTitle, activeKey }: LegalMobileTocProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || window.matchMedia('(min-width: 1024px)').matches) return;
    const active = root.querySelector('a.is-active');
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeKey]);

  return (
    <div className="legal-mobile-toc" aria-label={t('legalCommon.onThisPage')}>
      <div className="legal-mobile-toc__inner">
        <p className="legal-mobile-toc__label">{t('legalCommon.onThisPage')}</p>
        <div className="legal-mobile-toc__scroll" ref={scrollRef}>
          <nav className="legal-mobile-toc__nav">
            <ul>
              {keys.map((key) => {
                const isActive = activeKey === key;
                return (
                  <li key={key}>
                    <a
                      href={`#${idPrefix}-${key}`}
                      className={isActive ? 'is-active' : undefined}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {getTitle(key)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
