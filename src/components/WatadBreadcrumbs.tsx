import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Breadcrumbs.scss';

interface WatadBreadcrumbsProps {
  title: string;
}

export default function WatadBreadcrumbs({ title }: WatadBreadcrumbsProps) {
  const { t } = useTranslation();

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/" aria-label={t('common.home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
            </svg>
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <span aria-current="page">{title}</span>
        </li>
      </ol>
    </nav>
  );
}
