import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { applySeo } from '../lib/seo';

export default function DocumentMeta() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    applySeo({ t, lang: i18n.language, pathname });
  }, [t, i18n.language, pathname]);

  return null;
}
