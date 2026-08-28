import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PricingPlan } from '../data/watad-pages';
import { WATAD_INSTAGRAM_DM_URL } from '../data/contact-channels';
import { buildMailtoUrl, buildPlanInquiryMessage } from '../utils/plan-inquiry';
import './PlanInquiryModal.scss';

interface PlanInquiryModalProps {
  plan: PricingPlan | null;
  onClose: () => void;
}

const MOBILE_SHEET_MQ = '(max-width: 768px)';
const DISMISS_DRAG = 100;
const DISMISS_VELOCITY = 0.7;

function getOpenOffset() {
  return 0;
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="plan-inquiry-instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="35%" stopColor="#dd2a7b" />
          <stop offset="68%" stopColor="#8134af" />
          <stop offset="100%" stopColor="#515bd4" />
        </linearGradient>
      </defs>
      <rect
        x="2.25"
        y="2.25"
        width="19.5"
        height="19.5"
        rx="5.5"
        fill="none"
        stroke="url(#plan-inquiry-instagram-gradient)"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.35"
        fill="none"
        stroke="url(#plan-inquiry-instagram-gradient)"
        strokeWidth="1.8"
      />
      <circle cx="17.35" cy="6.65" r="1.15" fill="url(#plan-inquiry-instagram-gradient)" />
    </svg>
  );
}

function EmailLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m3.5 8 8.2 5.4a1 1 0 0 0 1.1 0L21 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getClosedOffset() {
  return window.innerHeight;
}

export default function PlanInquiryModal({ plan, onClose }: PlanInquiryModalProps) {
  const { t } = useTranslation();
  const [activePlan, setActivePlan] = useState<PricingPlan | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const [sheetOffset, setSheetOffset] = useState(getClosedOffset);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'copied'>('idle');

  const dragRef = useRef({
    pointerId: -1,
    startY: 0,
    startOffset: 0,
    startTime: 0,
  });

  const message = useMemo(
    () => (activePlan ? buildPlanInquiryMessage(activePlan, t, notes) : ''),
    [activePlan, t, notes],
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_SHEET_MQ);
    const sync = () => setIsMobileSheet(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (plan) {
      setActivePlan(plan);
      setNotes('');
      setStatus('idle');

      if (window.matchMedia(MOBILE_SHEET_MQ).matches) {
        setSheetOffset(getClosedOffset());
        const frame = requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsOpen(true);
            setSheetOffset(getOpenOffset());
          });
        });
        return () => cancelAnimationFrame(frame);
      }

      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsOpen(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsOpen(false);
    if (window.matchMedia(MOBILE_SHEET_MQ).matches) {
      setSheetOffset(getClosedOffset());
    }
    const timer = window.setTimeout(() => setActivePlan(null), 320);
    return () => window.clearTimeout(timer);
  }, [plan]);

  useEffect(() => {
    if (!activePlan) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activePlan, onClose]);

  const backdropOpacity = useMemo(() => {
    if (!isMobileSheet) return isOpen ? 0.52 : 0;
    const closed = getClosedOffset();
    const progress = 1 - Math.min(Math.max(sheetOffset / closed, 0), 1);
    return 0.52 * progress;
  }, [isMobileSheet, isOpen, sheetOffset]);

  function handleDragStart(event: React.PointerEvent<HTMLDivElement>) {
    if (!isMobileSheet) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startOffset: sheetOffset,
      startTime: Date.now(),
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
    const delta = event.clientY - dragRef.current.startY;
    const next = Math.max(0, dragRef.current.startOffset + delta);
    setSheetOffset(next);
  }

  function finishDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);

    const delta = event.clientY - dragRef.current.startY;
    const elapsed = Math.max(Date.now() - dragRef.current.startTime, 1);
    const velocity = delta / elapsed;
    const finalOffset = Math.max(0, dragRef.current.startOffset + delta);

    if (finalOffset > DISMISS_DRAG || velocity > DISMISS_VELOCITY) {
      onClose();
      return;
    }

    setSheetOffset(getOpenOffset());
  }

  if (!activePlan) return null;

  const planForSend = activePlan;

  function handleSendEmail() {
    window.location.href = buildMailtoUrl(planForSend, t, message);
  }

  async function handleSendInstagram() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus('copied');
    } catch {
      setStatus('idle');
    }

    window.open(WATAD_INSTAGRAM_DM_URL, '_blank', 'noopener,noreferrer');
  }

  const panelStyle = isMobileSheet
    ? {
        transform: `translateY(${sheetOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
      }
    : undefined;

  const backdropStyle = isMobileSheet
    ? {
        background: `rgba(0, 0, 0, ${backdropOpacity})`,
        backdropFilter: backdropOpacity > 0.04 ? 'blur(4px)' : 'none',
        transition: isDragging ? 'none' : 'background 0.28s ease, backdrop-filter 0.28s ease',
      }
    : undefined;

  return (
    <div
      className={`plan-inquiry-modal${isOpen ? ' is-open' : ''}${isMobileSheet ? ' plan-inquiry-modal--sheet is-full' : ''}${isDragging ? ' is-dragging' : ''}`}
      role="presentation"
    >
      <button
        type="button"
        className="plan-inquiry-modal__backdrop"
        style={backdropStyle}
        onClick={onClose}
        aria-label={t('pricingInquiry.close')}
      />

      <div
        className="plan-inquiry-modal__panel"
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-inquiry-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="plan-inquiry-modal__drag-zone"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className="plan-inquiry-modal__handle" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="plan-inquiry-modal__close"
          onClick={onClose}
          aria-label={t('pricingInquiry.close')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="plan-inquiry-modal__scroll">
          <div className="plan-inquiry-modal__header">
            <p className="plan-inquiry-modal__eyebrow">{t('pricingInquiry.eyebrow')}</p>
            <h2 id="plan-inquiry-title" className="plan-inquiry-modal__title">
              {activePlan.name}
            </h2>
            <p className="plan-inquiry-modal__price">
              <span>{activePlan.price}</span>
              <span>
                {activePlan.currency}
                {activePlan.period ? ` ${activePlan.period}` : ''}
              </span>
            </p>
            <p className="plan-inquiry-modal__desc">{activePlan.description}</p>
          </div>

          <div className="plan-inquiry-modal__preview">
            <p className="plan-inquiry-modal__label">{t('pricingInquiry.messagePreview')}</p>
            <pre className="plan-inquiry-modal__message">{message}</pre>
          </div>

          <label className="plan-inquiry-modal__field" htmlFor="plan-inquiry-notes">
            <span>{t('pricingInquiry.notesLabel')}</span>
            <textarea
              id="plan-inquiry-notes"
              rows={4}
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setStatus('idle');
              }}
              placeholder={t('pricingInquiry.notesPlaceholder')}
            />
          </label>

          {status === 'copied' && (
            <p className="plan-inquiry-modal__status" role="status">
              {t('pricingInquiry.instagramCopied')}
            </p>
          )}
        </div>

        <div className="plan-inquiry-modal__footer">
          <div className="plan-inquiry-modal__actions">
            <button type="button" className="plan-inquiry-modal__btn plan-inquiry-modal__btn--email" onClick={handleSendEmail}>
              <span className="plan-inquiry-modal__btn-icon plan-inquiry-modal__btn-icon--email" aria-hidden="true">
                <EmailLogo />
              </span>
              <span className="plan-inquiry-modal__btn-text">{t('pricingInquiry.sendEmail')}</span>
            </button>
            <button
              type="button"
              className="plan-inquiry-modal__btn plan-inquiry-modal__btn--instagram"
              onClick={() => void handleSendInstagram()}
            >
              <span className="plan-inquiry-modal__btn-icon plan-inquiry-modal__btn-icon--instagram" aria-hidden="true">
                <InstagramLogo />
              </span>
              <span className="plan-inquiry-modal__btn-text">{t('pricingInquiry.sendInstagram')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
