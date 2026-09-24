import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { oBtnSm, oLabel } from './pass-ui';



type CopyFieldProps = {

  label: string;

  value: string;

  mono?: boolean;

};



export default function CopyField({ label, value, mono = true }: CopyFieldProps) {

  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);



  async function copy() {

    if (!value) return;

    try {

      await navigator.clipboard.writeText(value);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);

    } catch {

      /* clipboard denied */

    }

  }



  return (

    <div className="mb-4 last:mb-0">

      <span className={oLabel}>{label}</span>

      <div className="flex flex-nowrap items-stretch gap-3">

        <code

          dir="ltr"

          className={`min-w-0 flex-1 break-all rounded-2xl border border-line bg-soft px-5 py-3.5 text-sm text-ink ${mono ? 'font-mono' : ''}`}

        >

          {value || ''}

        </code>

        <button type="button" className={oBtnSm} onClick={copy} disabled={!value}>

          {copied ? t('pass.copy.done') : t('pass.copy.copy')}

        </button>

      </div>

    </div>

  );

}

