import { useTranslation } from 'react-i18next';
import './FooterBanner.scss';

function MarqueeRow({
  text,
  variant,
  reverse = false,
}: {
  text: string;
  variant: 'title' | 'text';
  reverse?: boolean;
}) {
  const items = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div
      className={`footer-banner__row footer-banner__row--${variant}${reverse ? ' is-reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="footer-banner__track">
        {items.map((index) => (
          <div key={index} className="footer-banner__content">
            <span className="footer-banner__item">{text}</span>
            <span className="footer-banner__sep" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FooterBanner() {
  const { t } = useTranslation();
  const title = t('footer.bannerTitle');
  const text = t('footer.bannerText');

  return (
    <section className="footer-banner" aria-label={t('footer.bannerLabel')}>
      <p className="footer-banner__sr-only">
        {title}. {text}
      </p>

      <div className="footer-banner__marquee" aria-hidden="true">
        <MarqueeRow text={title} variant="title" />
        <MarqueeRow text={text} variant="text" reverse />
      </div>

      <div className="footer-banner__static">
        <p className="footer-banner__title">{title}</p>
        <p className="footer-banner__text">{text}</p>
      </div>
    </section>
  );
}
