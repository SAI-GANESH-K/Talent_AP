import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';

interface AppPreloaderProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({
  onComplete,
  minDurationMs = 850,
}) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, minDurationMs);

    // Fallback safety timeout so overlay can never remain stuck
    const safetyTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="coverwise-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1320] overflow-hidden select-none pointer-events-auto"
          aria-live="polite"
          aria-busy="true"
        >
          {/* Subtle teal radial ambient glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.35 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute w-[420px] h-[420px] rounded-full bg-teal-500/20 blur-[100px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {/* Wordmark */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center"
            >
              <h1 className="font-[var(--font-heading)] font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
                Cover<span className="text-teal-400">Wise</span>
              </h1>
            </motion.div>

            {/* Thin teal progress indicator line */}
            <div className="w-24 h-[2px] bg-slate-800 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 0.9,
                  ease: 'easeInOut',
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-teal-400 to-transparent"
              />
            </div>

            {/* Tagline reveal with short stagger */}
            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 0.8 }}
              transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
              className="mt-3 text-xs sm:text-sm text-slate-300 font-medium tracking-wide"
            >
              {t.footer?.tagline || 'Protecting tomorrow, intelligently.'}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
