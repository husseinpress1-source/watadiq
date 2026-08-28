import type { ReactNode } from 'react';

/* Soft outline UI — rounded, large type, minimal lines */

export const oBtn =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink no-underline transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:py-3.5 sm:text-base';

export const oBtnSm = `${oBtn} px-3 py-2 text-xs rounded-xl sm:px-4 sm:py-2.5 sm:text-sm`;

export const oBtnLg = `${oBtn} px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg`;

export const oBtnBlock = `${oBtn} w-full`;

export const oInput =
  'w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-faint focus:border-brand focus:outline-none sm:px-5 sm:py-4';

export const oLabel = 'mb-2 block text-sm font-semibold text-muted';

export function PassSection({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pt-8 first:pt-0 sm:pt-12">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
          <h2 className="min-w-0 text-xl font-bold text-ink sm:truncate sm:text-2xl">{title}</h2>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {hint && <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function PassPageTitle({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="mb-6 sm:mb-12">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h1>
      {lead && <p className="mt-3 text-lg leading-relaxed text-muted sm:mt-4 sm:text-xl">{lead}</p>}
    </header>
  );
}

export function PassAlert({ children, role = 'status' }: { children: ReactNode; role?: 'alert' | 'status' }) {
  return (
    <p role={role} className="mb-5 rounded-2xl border border-line bg-soft px-4 py-3 text-base text-ink sm:mb-8 sm:px-6 sm:py-4 sm:text-lg">
      {children}
    </p>
  );
}

export function PassEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-soft px-4 py-8 text-center text-base text-muted sm:px-6 sm:py-12 sm:text-lg">
      {children}
    </div>
  );
}

export function PassRowList({ children }: { children: ReactNode }) {
  return <ul className="grid gap-3">{children}</ul>;
}

/** Fixed-column table — every row stays on one horizontal level. */
const TABLE_COLS_4 = 'grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)_9rem_auto]';
const TABLE_COLS_3 = 'grid-cols-[minmax(0,2fr)_minmax(0,1.25fr)_minmax(0,2fr)]';
const TABLE_COLS_2 = 'grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)]';

function tableCols(columnCount: number, hasAction: boolean) {
  if (hasAction || columnCount >= 4) return TABLE_COLS_4;
  if (columnCount === 2) return TABLE_COLS_2;
  return TABLE_COLS_3;
}

export function PassDataTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  const cols = tableCols(columns.length, columns.length >= 4);

  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <div
        className={`hidden ${cols} items-center gap-3 border-b border-line bg-soft px-4 py-2.5 text-sm font-semibold text-muted sm:grid sm:gap-4 sm:px-5 sm:py-3 lg:px-6 lg:text-base`}
      >
        {columns.map((col, i) => (
          <span key={col} className={i === columns.length - 1 && columns.length >= 4 ? 'text-end whitespace-nowrap' : ''}>
            {col}
          </span>
        ))}
      </div>
      <ul>{children}</ul>
    </div>
  );
}

export function PassDataRow({
  col1,
  col2,
  col3,
  action,
  col3Mono = true,
  columns = 3,
}: {
  col1: ReactNode;
  col2: ReactNode;
  col3?: ReactNode;
  action?: ReactNode;
  col3Mono?: boolean;
  /** Pass 2 for endpoint tables (label + URL). */
  columns?: 2 | 3 | 4;
}) {
  const colCount = action !== undefined ? 4 : columns;
  const cols = tableCols(colCount, action !== undefined);

  return (
    <li className={`flex flex-col gap-2 border-b border-line px-4 py-3 last:border-b-0 sm:grid sm:items-center sm:gap-4 sm:px-5 sm:py-4 lg:px-6 ${cols}`}>
      <div className="min-w-0 text-base font-semibold text-ink sm:truncate lg:text-lg">{col1}</div>
      <div className={`min-w-0 break-all text-sm text-muted sm:truncate sm:text-base ${columns === 2 ? 'font-mono' : ''}`} dir={columns === 2 ? 'ltr' : undefined}>
        {col2}
      </div>
      {columns >= 3 && col3 !== undefined && (
        <div
          dir={col3Mono ? 'ltr' : undefined}
          className={`min-w-0 break-all text-sm text-muted sm:truncate sm:text-base ${col3Mono ? 'font-mono' : ''}`}
        >
          {col3}
        </div>
      )}
      {action !== undefined ? (
        <div className="flex shrink-0 justify-start pt-1 sm:justify-end sm:pt-0">{action}</div>
      ) : null}
    </li>
  );
}

export function PassToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-3">{children}</div>
  );
}

export function cleanPassText(s: string): string {
  return s
    .replace(/\s*[·•]\s*/g, ' ')
    .replace(/\s*—\s*/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/(?<!\d)\.\s+/g, ' ')
    .replace(/(?<!\d)\.$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fmtPassDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function PassRow({
  main,
  meta,
  action,
}: {
  main: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-white px-4 py-4 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4">{main}</div>
      {meta && <div className="shrink-0 text-sm text-muted sm:whitespace-nowrap sm:text-base">{meta}</div>}
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">{action}</div>}
    </li>
  );
}

export function PassStatGrid({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:mb-12 sm:gap-4 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-line bg-white px-4 py-4 sm:min-h-[7rem] sm:px-6 sm:py-6 lg:min-h-[8rem] lg:py-8">
          <strong className="text-3xl font-bold tabular-nums text-ink sm:text-4xl lg:text-5xl">{s.value}</strong>
          <span className="mt-1 truncate text-sm font-medium text-muted sm:mt-2 sm:text-base lg:text-lg">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
