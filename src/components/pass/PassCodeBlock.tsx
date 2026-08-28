import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { oBtnSm } from './pass-ui';

type PassCodeBlockProps = {
  title?: string;
  code: string;
  language?: string;
};

export default function PassCodeBlock({ title, code, language = 'text' }: PassCodeBlockProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }

  return (
    <div className="pass-code-block">
      {(title || language) && (
        <div className="pass-code-block__head">
          {title && <span className="pass-code-block__title">{title}</span>}
          <button type="button" className={oBtnSm} onClick={copy}>
            {copied ? t('pass.copy.done') : t('pass.copy.copy')}
          </button>
        </div>
      )}
      <pre className="pass-code-block__pre" dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}
