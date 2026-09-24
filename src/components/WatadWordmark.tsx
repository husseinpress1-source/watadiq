import { useTranslation } from 'react-i18next';
import './WatadWordmark.scss';

type Props = {
  className?: string;
  compact?: boolean;
};

/** English AI wordmark (PNG) — same lockup in AR/EN UI for brand consistency. */
const WORDMARK_SRC = '/images/watad-wordmark.png';

export default function WatadWordmark({ className = '', compact = false }: Props) {
  const { t } = useTranslation();

  return (
    <img
      src={WORDMARK_SRC}
      alt={t('common.brandName')}
      className={`watad-wordmark-img${compact ? ' watad-wordmark-img--compact' : ''}${className ? ` ${className}` : ''}`}
      width={200}
      height={50}
      decoding="async"
      draggable={false}
    />
  );
}
