import { Fragment, useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  filterComparisonCategories,
  planNameToKey,
  PRICING_PLAN_KEYS,
  type PricingCompareCell,
  type PricingCompareContent,
  type PricingPlanKey,
} from '@/lib/pricing-comparison';

import './PricingComparison.scss';

type PricingComparisonProps = {
  planNames: string[];
};

function CompareCell({ value }: { value: PricingCompareCell }) {
  if (value === true) {
    return (
      <span className="pricing-compare__cell pricing-compare__cell--yes" aria-label="Included">
        <Check aria-hidden="true" />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="pricing-compare__cell pricing-compare__cell--no" aria-label="Not included">
        <X aria-hidden="true" />
      </span>
    );
  }

  return <span className="pricing-compare__cell pricing-compare__cell--text">{value}</span>;
}

function getDefaultPlanKey(columns: PricingPlanKey[]): PricingPlanKey {
  if (columns.includes('scale')) return 'scale';
  return columns[0] ?? 'launch';
}

function getPlanLabel(planNames: string[], key: PricingPlanKey): string {
  return (
    planNames.find((name) => planNameToKey(name) === key) ?? key.charAt(0).toUpperCase() + key.slice(1)
  );
}

export default function PricingComparison({ planNames }: PricingComparisonProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const content = t('pricingCompare', { returnObjects: true }) as PricingCompareContent;

  const visiblePlanKeys = useMemo(() => {
    return planNames
      .map((name) => planNameToKey(name))
      .filter((key): key is PricingPlanKey => key !== null);
  }, [planNames]);

  const columns = visiblePlanKeys.length > 0 ? visiblePlanKeys : [...PRICING_PLAN_KEYS];
  const [activePlanKey, setActivePlanKey] = useState<PricingPlanKey>(() => getDefaultPlanKey(columns));

  const filteredCategories = useMemo(
    () => filterComparisonCategories(content.categories ?? [], query),
    [content.categories, query],
  );

  return (
    <section className="pricing-compare" aria-labelledby="pricing-compare-title">
      <div className="pricing-compare__head">
        <h3 id="pricing-compare-title">{content.title}</h3>
        <label className="pricing-compare__search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={content.searchPlaceholder}
            aria-label={content.searchPlaceholder}
          />
        </label>
      </div>

      <div className="pricing-compare__mobile" aria-live="polite">
        <p className="pricing-compare__mobile-label">{content.selectPlanLabel}</p>
        <div className="pricing-compare__tabs" role="tablist" aria-label={content.selectPlanLabel}>
          {columns.map((key) => {
            const isActive = activePlanKey === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                id={`pricing-tab-${key}`}
                aria-selected={isActive}
                aria-controls={`pricing-panel-${key}`}
                className={isActive ? 'is-active' : undefined}
                onClick={() => setActivePlanKey(key)}
              >
                {getPlanLabel(planNames, key)}
              </button>
            );
          })}
        </div>

        {filteredCategories.length === 0 ? (
          <p className="pricing-compare__mobile-empty">{content.emptyResults}</p>
        ) : (
          <div
            className="pricing-compare__mobile-panel"
            role="tabpanel"
            id={`pricing-panel-${activePlanKey}`}
            aria-labelledby={`pricing-tab-${activePlanKey}`}
          >
            {filteredCategories.map((category) => (
              <section key={category.id} className="pricing-compare__mobile-category">
                <h4>{category.title}</h4>
                <ul>
                  {category.features.map((feature) => (
                    <li key={feature.id}>
                      <span className="pricing-compare__mobile-feature">{feature.label}</span>
                      <CompareCell value={feature[activePlanKey]} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="pricing-compare__desktop">
        <div className="pricing-compare__table-wrap">
          <table className="pricing-compare__table">
            <thead>
              <tr>
                <th scope="col" className="pricing-compare__feature-col">
                  {content.featureColumn}
                </th>
                {columns.map((key) => (
                  <th key={key} scope="col" className="pricing-compare__plan-col">
                    {getPlanLabel(planNames, key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="pricing-compare__empty">
                    {content.emptyResults}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <Fragment key={category.id}>
                    <tr className="pricing-compare__category">
                      <th scope="colgroup" colSpan={columns.length + 1}>
                        {category.title}
                      </th>
                    </tr>
                    {category.features.map((feature) => (
                      <tr key={feature.id} className="pricing-compare__row">
                        <th scope="row" className="pricing-compare__feature-label">
                          {feature.label}
                        </th>
                        {columns.map((key) => (
                          <td key={`${feature.id}-${key}`} className="pricing-compare__value">
                            <CompareCell value={feature[key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
