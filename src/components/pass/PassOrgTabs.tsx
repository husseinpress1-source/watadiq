import cn from 'classnames';

type Tab = { key: string; label: string };

type PassOrgTabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
};

export default function PassOrgTabs({ tabs, active, onChange }: PassOrgTabsProps) {
  return (
    <div className="mb-10 flex flex-nowrap items-center gap-3 overflow-x-auto" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={cn(
            'inline-flex h-12 shrink-0 items-center whitespace-nowrap rounded-2xl px-6 text-base font-semibold transition-colors lg:h-14 lg:text-lg',
            active === tab.key
              ? 'bg-brand text-white'
              : 'border border-line bg-white text-ink hover:border-brand hover:text-brand',
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
