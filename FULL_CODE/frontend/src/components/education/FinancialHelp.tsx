import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EDUCATION_TERMS, type EducationTermId } from '../../i18n/educationContent';

interface FinancialHelpProps {
  termId: EducationTermId;
  variant?: 'icon' | 'badge' | 'link';
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const FinancialHelp: React.FC<FinancialHelpProps> = ({
  termId,
  variant = 'icon',
  className = '',
  placement = 'bottom',
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const termData =
    (EDUCATION_TERMS[language] && EDUCATION_TERMS[language][termId]) ||
    EDUCATION_TERMS.en[termId];

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Dismiss on Click Outside or Escape Key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!termData) return null;

  return (
    <span className={`relative inline-flex items-center align-middle ${className}`}>
      {/* Trigger Button */}
      {variant === 'icon' && (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Explain ${termData.title}`}
          title="Explain this term"
          className="w-4 h-4 rounded-full bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all text-[10px] font-bold flex items-center justify-center shrink-0 ml-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
        >
          i
        </button>
      )}

      {variant === 'badge' && (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Explain ${termData.title}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50/80 hover:bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-md transition-colors ml-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center">
            i
          </span>
          <span>What does this mean?</span>
        </button>
      )}

      {variant === 'link' && (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Explain ${termData.title}`}
          className="text-xs font-semibold text-teal-600 hover:text-teal-800 underline decoration-dotted transition-colors ml-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
        >
          What does this mean?
        </button>
      )}

      {/* Popover / Explanatory Dialog */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`help-title-${termId}`}
          className={`absolute z-50 w-72 sm:w-80 p-4 bg-white text-slate-800 rounded-2xl shadow-xl border border-teal-200/90 text-left animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
              : placement === 'left'
              ? 'right-full mr-2 top-0'
              : placement === 'right'
              ? 'left-full ml-2 top-0'
              : 'top-full mt-2 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                i
              </span>
              <h4
                id={`help-title-${termId}`}
                className="text-xs font-extrabold text-[var(--color-navy-900)] font-[var(--font-heading)] leading-tight"
              >
                {termData.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-xs w-5 h-5 rounded flex items-center justify-center hover:bg-slate-100 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
              aria-label="Close explanation"
            >
              ✕
            </button>
          </div>

          {/* Definition */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {termData.definition}
          </p>

          {/* Practical Relatable Example */}
          {termData.example && (
            <div className="mt-2.5 p-2 rounded-xl bg-teal-50/70 border border-teal-100/80 text-[11px] text-teal-900 leading-normal">
              {termData.example}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>CoverWise Plain-English Guide</span>
            <button
              type="button"
              onClick={handleClose}
              className="text-teal-700 font-bold hover:underline"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

