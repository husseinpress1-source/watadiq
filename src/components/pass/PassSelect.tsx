import { useEffect, useId, useRef, useState } from 'react';
import { oInput, oLabel } from './pass-ui';

export type PassSelectOption = {
  value: string;
  label: string;
  sub?: string;
  chip?: string;
};

type Props = {
  label?: string;
  value: string;
  options: PassSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={`shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PassSelect({ label, value, options, onChange, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value) ?? null;
  const selectedIndex = options.findIndex((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    setHighlight(selectedIndex >= 0 ? selectedIndex : 0);
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open || highlight < 0 || !listRef.current) return;
    listRef.current.children[highlight]?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function commit(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(highlight);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative w-full" onKeyDown={onKeyDown}>
      {label && <span className={oLabel}>{label}</span>}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
        className={`${oInput} flex cursor-pointer items-center justify-between gap-3 text-start disabled:opacity-40`}
      >
        {selected ? (
          <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-hidden text-base">
            <span className="truncate font-semibold">{selected.label}</span>
            {selected.sub && <span dir="ltr" className="truncate font-mono text-sm text-muted">{selected.sub}</span>}
            {selected.chip && <span className="shrink-0 whitespace-nowrap rounded-xl border border-line px-2.5 py-1 text-sm">{selected.chip}</span>}
          </span>
        ) : (
          <span className="text-muted">{placeholder ?? ''}</span>
        )}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line bg-white p-2"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isHighlighted = i === highlight;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3.5 ${
                  isSelected ? 'bg-soft font-semibold' : isHighlighted ? 'bg-soft/60' : ''
                }`}
              >
                <span className="flex min-w-0 flex-1 flex-nowrap items-center gap-3 overflow-hidden text-base">
                  <span className="truncate">{opt.label}</span>
                  {opt.sub && <span dir="ltr" className="truncate font-mono text-sm text-muted">{opt.sub}</span>}
                </span>
                {opt.chip && <span className="shrink-0 whitespace-nowrap rounded-xl border border-line px-2.5 py-1 text-sm">{opt.chip}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
