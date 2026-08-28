import { useId, useState } from 'react';
import './PaymentOptions.scss';

export type PaymentIcon = 'bank' | 'wallet' | 'split' | 'milestone';

export interface PaymentOption {
  icon: PaymentIcon;
  title: string;
  summary: string;
  description: string;
}

interface PaymentOptionsProps {
  options: PaymentOption[];
}

const PAYMENT_ICON_SRC: Record<PaymentIcon, string> = {
  bank: '/assets/payments/payment-bank.png',
  wallet: '/assets/payments/payment-wallet.png',
  split: '/assets/payments/payment-split.png',
  milestone: '/assets/payments/payment-milestone.png',
};

export default function PaymentOptions({ options }: PaymentOptionsProps) {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  return (
    <div className="payment-options">
      <div className="payment-options__list" role="tablist" aria-label="Payment methods">
        {options.map((option, index) => {
          const isActive = activeIndex === index;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;

          return (
            <div
              key={option.title}
              className={`payment-options__item${isActive ? ' is-active is-open' : ''}`}
            >
              <button
                type="button"
                id={tabId}
                className="payment-options__trigger"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                aria-expanded={isActive}
                onClick={() => toggle(index)}
              >
                <span className="payment-options__trigger-main">
                  <img
                    src={PAYMENT_ICON_SRC[option.icon]}
                    alt=""
                    className="payment-options__trigger-icon"
                    loading="lazy"
                    draggable={false}
                  />
                  <span className="payment-options__trigger-copy">
                    <span className="payment-options__trigger-title">{option.title}</span>
                    <span className="payment-options__trigger-summary">{option.summary}</span>
                  </span>
                </span>
                <span className="payment-options__arrow" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7.5 10 12.5 15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={panelId}
                className="payment-options__panel"
                role="tabpanel"
                aria-labelledby={tabId}
              >
                <div className="payment-options__panel-inner">
                  <p>{option.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
