import { Fragment } from 'react';

const TOKEN =
  /(\+\S+@\S+\.\S+|\S+@\S+\.\S+|https?:\/\/[^\s]+|www\.[^\s]+|«[^»]+»|"[^"]+"|'[^']+'|WATAD Software|watadiq\.com|\bIQD\b|\bGDPR\b|Terms of Service|Privacy Policy|Republic of Iraq|جمهورية العراق|WATAD Software \([^)]+\))/g;

function renderPart(part: string, key: string) {
  if (!part) return null;

  if (part.startsWith('«') || part.startsWith('"') || part.startsWith("'")) {
    return (
      <span key={key} className="legal-page__term">
        {part}
      </span>
    );
  }

  if (part.includes('@') && !part.startsWith('http')) {
    const email = part.replace(/^\+/, '');
    return (
      <a key={key} className="legal-page__inline-link" href={`mailto:${email}`}>
        {part}
      </a>
    );
  }

  if (part.startsWith('http') || part.startsWith('www.')) {
    const href = part.startsWith('www.') ? `https://${part}` : part;
    return (
      <a key={key} className="legal-page__inline-link" href={href} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  }

  if (
    part === 'WATAD Software' ||
    part.startsWith('WATAD Software (') ||
    part === 'watadiq.com' ||
    part === 'IQD' ||
    part === 'GDPR' ||
    part === 'Terms of Service' ||
    part === 'Privacy Policy' ||
    part === 'Republic of Iraq' ||
    part === 'جمهورية العراق'
  ) {
    return (
      <span key={key} className="legal-page__emphasis">
        {part}
      </span>
    );
  }

  return part;
}

export function LegalRichText({ text }: { text: string }) {
  const parts = text.split(TOKEN);

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part.slice(0, 12)}`}>{renderPart(part, String(index))}</Fragment>
      ))}
    </>
  );
}
