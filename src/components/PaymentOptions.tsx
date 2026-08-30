import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  bank: '/assets/payments/payment-bank-512.webp',
  wallet: '/assets/payments/payment-wallet-512.webp',
  split: '/assets/payments/payment-split-512.webp',
  milestone: '/assets/payments/payment-milestone-512.webp',
};

const easeOut = [0.22, 1, 0.36, 1] as const;

function getPaymentIconAssets(icon: PaymentIcon, displaySize = 72) {
  const stem = PAYMENT_ICON_SRC[icon].replace(/-512\.webp$/, '');
  return {
    src: `${stem}-256.webp`,
    srcSet: `${stem}-256.webp 1x, ${stem}-512.webp 2x`,
    width: displaySize,
    height: displaySize,
  };
}

export default function PaymentOptions({ options }: PaymentOptionsProps) {
  const baseId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  const listMotion = reduceMotion
    ? {}
    : {
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, margin: '-50px' },
        variants: {
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
        },
      };

  const itemMotion = reduceMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 28 },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.55, ease: easeOut },
          },
        },
      };

  return (
    <div className="payment-options">
      <motion.div className="payment-options__list" role="tablist" aria-label="Payment methods" {...listMotion}>
        {options.map((option, index) => {
          const isActive = activeIndex === index;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          const iconAssets = getPaymentIconAssets(option.icon);

          return (
            <motion.article
              key={option.title}
              className={`payment-options__item${isActive ? ' is-open' : ''}`}
              {...itemMotion}
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
                <span className="payment-options__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <motion.span
                  className="payment-options__icon"
                  aria-hidden="true"
                  whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -2 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                >
                  <img
                    src={iconAssets.src}
                    srcSet={iconAssets.srcSet}
                    alt=""
                    width={iconAssets.width}
                    height={iconAssets.height}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </motion.span>

                <span className="payment-options__copy">
                  <span className="payment-options__title">{option.title}</span>
                  <span className="payment-options__summary">{option.summary}</span>
                </span>

                <motion.span
                  className="payment-options__arrow"
                  aria-hidden="true"
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                >
                  <svg viewBox="0 0 20 20" fill="none">
                    <path
                      d="M5 7.5 10 12.5 15 7.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    id={panelId}
                    className="payment-options__panel"
                    role="tabpanel"
                    aria-labelledby={tabId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={reduceMotion ? undefined : { height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.38, ease: easeOut }}
                  >
                    <div className="payment-options__panel-inner">
                      <p>{option.description}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
