import { useEffect, useRef, useState } from 'react';
import { oInput, oLabel } from './pass-ui';

type Props = {
  label?: string;
  hint?: string;
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  selectAllLabel?: string;
  clearLabel?: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`shrink-0 text-faint ${open ? 'rotate-180' : ''}`}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PassMultiSelect({
  label,
  hint,
  values,
  options,
  onChange,
  disabled,
  selectAllLabel = 'Select all',
  clearLabel = 'Clear',
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  function toggle(ev: string) {
    onChange(values.includes(ev) ? values.filter((v) => v !== ev) : [...values, ev]);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {label && <span className={oLabel}>{label}</span>}

      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${oInput} flex cursor-pointer items-center justify-between gap-3 text-start disabled:opacity-40`}
      >
        {values.length === 0 ? (
          <span className="text-lg text-muted">{hint ?? ''}</span>
        ) : (
          <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
            {values.map((v) => (
              <span key={v} dir="ltr" className="shrink-0 whitespace-nowrap rounded-xl border border-line px-3 py-1 font-mono text-sm">
                {v}
              </span>
            ))}
          </span>
        )}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-line bg-white p-2">
          <ul className="max-h-64 overflow-auto">
            {options.map((ev) => {
              const checked = values.includes(ev);
              return (
                <li key={ev}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(ev)}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-start hover:bg-soft ${checked ? 'bg-soft' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${checked ? 'border-brand bg-brand' : 'border-line bg-white'}`}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6.2l2.6 2.5L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>
                    <span dir="ltr" className={`font-mono text-base ${checked ? 'font-semibold' : ''}`}>{ev}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 flex items-center justify-between px-4 py-2 text-sm text-muted">
            <span>{values.length} / {options.length}</span>
            <span className="flex gap-4">
              <button type="button" onClick={() => onChange([...options])} className="cursor-pointer font-semibold text-brand">{selectAllLabel}</button>
              <button type="button" onClick={() => onChange([])} className="cursor-pointer font-semibold text-muted">{clearLabel}</button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
