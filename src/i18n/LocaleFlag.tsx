interface LocaleFlagProps {
  code: 'en' | 'ar';
  className?: string;
}

export default function LocaleFlag({ code, className }: LocaleFlagProps) {
  if (code === 'ar') {
    return (
      <svg className={className} viewBox="0 0 28 20" fill="none" aria-hidden="true">
        <rect width="28" height="20" rx="3" fill="#fff" />
        <rect width="28" height="6.67" fill="#CE1126" />
        <rect y="6.67" width="28" height="6.67" fill="#fff" />
        <rect y="13.33" width="28" height="6.67" fill="#000" />
        <text
          x="14"
          y="10.8"
          textAnchor="middle"
          fill="#007A3D"
          fontSize="3.2"
          fontFamily="Tahoma, 'Segoe UI', sans-serif"
          fontWeight="700"
        >
          الله أكبر
        </text>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 28 20" fill="none" aria-hidden="true">
      <rect width="28" height="20" rx="3" fill="#B22234" />
      <rect y="1.54" width="28" height="1.54" fill="#fff" />
      <rect y="4.62" width="28" height="1.54" fill="#fff" />
      <rect y="7.69" width="28" height="1.54" fill="#fff" />
      <rect y="10.77" width="28" height="1.54" fill="#fff" />
      <rect y="13.85" width="28" height="1.54" fill="#fff" />
      <rect y="16.92" width="28" height="1.54" fill="#fff" />
      <rect width="11.2" height="10.8" fill="#3C3B6E" />
      <g fill="#fff">
        <circle cx="1.8" cy="1.6" r="0.55" />
        <circle cx="3.6" cy="1.6" r="0.55" />
        <circle cx="5.4" cy="1.6" r="0.55" />
        <circle cx="7.2" cy="1.6" r="0.55" />
        <circle cx="9" cy="1.6" r="0.55" />
        <circle cx="2.7" cy="2.8" r="0.55" />
        <circle cx="4.5" cy="2.8" r="0.55" />
        <circle cx="6.3" cy="2.8" r="0.55" />
        <circle cx="8.1" cy="2.8" r="0.55" />
        <circle cx="1.8" cy="4" r="0.55" />
        <circle cx="3.6" cy="4" r="0.55" />
        <circle cx="5.4" cy="4" r="0.55" />
        <circle cx="7.2" cy="4" r="0.55" />
        <circle cx="9" cy="4" r="0.55" />
        <circle cx="2.7" cy="5.2" r="0.55" />
        <circle cx="4.5" cy="5.2" r="0.55" />
        <circle cx="6.3" cy="5.2" r="0.55" />
        <circle cx="8.1" cy="5.2" r="0.55" />
        <circle cx="1.8" cy="6.4" r="0.55" />
        <circle cx="3.6" cy="6.4" r="0.55" />
        <circle cx="5.4" cy="6.4" r="0.55" />
        <circle cx="7.2" cy="6.4" r="0.55" />
        <circle cx="9" cy="6.4" r="0.55" />
        <circle cx="2.7" cy="7.6" r="0.55" />
        <circle cx="4.5" cy="7.6" r="0.55" />
        <circle cx="6.3" cy="7.6" r="0.55" />
        <circle cx="8.1" cy="7.6" r="0.55" />
        <circle cx="1.8" cy="8.8" r="0.55" />
        <circle cx="3.6" cy="8.8" r="0.55" />
        <circle cx="5.4" cy="8.8" r="0.55" />
        <circle cx="7.2" cy="8.8" r="0.55" />
        <circle cx="9" cy="8.8" r="0.55" />
      </g>
    </svg>
  );
}
