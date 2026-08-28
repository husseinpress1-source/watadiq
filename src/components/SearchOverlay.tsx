import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../context/LayoutContext';
import './SearchOverlay.scss';

type SearchTab = 'art' | 'website';

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useLayout();
  const { t } = useTranslation();
  const [tab, setTab] = useState<SearchTab>('art');
  const [query, setQuery] = useState('');

  if (!searchOpen) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      window.location.hash = `search=${encodeURIComponent(query.trim())}`;
    }
    closeSearch();
  }

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t('search.label')}>
      <div className="search-overlay__panel">
        <button type="button" className="search-overlay__close" onClick={closeSearch} aria-label={t('common.closeSearch')}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="search-overlay__tabs">
          <button
            type="button"
            className={tab === 'art' ? 'is-active' : ''}
            onClick={() => setTab('art')}
          >
            {t('search.art')}
          </button>
          <button
            type="button"
            className={tab === 'website' ? 'is-active' : ''}
            onClick={() => setTab('website')}
          >
            {t('search.website')}
          </button>
        </div>

        <form className="search-overlay__form" onSubmit={handleSubmit}>
          <input
            type="search"
            placeholder={t('search.placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label={t('search.placeholder')}
          />
          <button type="submit" aria-label={t('common.search')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L16 16" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
