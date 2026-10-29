import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ScrollMorphPreloaderProps {
  onComplete: () => void;
  minDurationMs?: number;
}

type FormationPhase = 'circle' | 'line' | 'exit';

interface MetaphorCard {
  id: string;
  icon: string;
  label: string;
  color: string;
  borderColor: string;
}

export const ScrollMorphPreloader: React.FC<ScrollMorphPreloaderProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<FormationPhase>('circle');
  const [isVisible, setIsVisible] = useState(true);

  // Exactly 5 Core Financial Protection Metaphor Cards with their previous emojis
  const cards: MetaphorCard[] = useMemo(
    () => [
      { id: 'c1', icon: '🛡️', label: 'Family Shield', color: 'from-teal-500/25 to-teal-600/15', borderColor: 'border-teal-500/35' },
      { id: 'c2', icon: '💼', label: 'Income Cover', color: 'from-cyan-500/25 to-cyan-600/15', borderColor: 'border-cyan-500/35' },
      { id: 'c3', icon: '🎓', label: 'Child Future', color: 'from-amber-500/25 to-amber-600/15', borderColor: 'border-amber-500/35' },
      { id: 'c4', icon: '💳', label: 'Debt Payoff', color: 'from-emerald-500/25 to-emerald-600/15', borderColor: 'border-emerald-500/35' },
      { id: 'c5', icon: '🏠', label: 'Term Coverage', color: 'from-teal-500/25 to-teal-600/15', borderColor: 'border-teal-500/35' },
    ],
    []
  );

  useEffect(() => {
    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Step 1: 5 cards start in circle orbit (0ms)
    // Step 2: Smoothly arrange into a neat horizontal line below the title at 450ms
    const tLine = setTimeout(() => setPhase('line'), 450);

    // Step 3: Complete and exit smoothly at 1200ms
    const tExit = setTimeout(() => {
      setPhase('exit');
      setIsVisible(false);
    }, minDurationMs);

    // Guaranteed safety timeout fallback
    const safetyTimeout = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, minDurationMs + 350);

    return () => {
      clearTimeout(tLine);
      clearTimeout(tExit);
      clearTimeout(safetyTimeout);
    };
  }, [minDurationMs, onComplete]);

  // Compute card coordinates: CoverWise is positioned UP, cards are positioned DOWN with zero overlap
  const getCardTransform = (index: number, total: number) => {
    const angleStep = (2 * Math.PI) / total;
    const angle = angleStep * index - Math.PI / 2;

    switch (phase) {
      case 'circle': {
        // Pentagonal ring orbit centered comfortably below the title
        const radiusX = 120;
        const radiusY = 70;
        const centerY = 90;
        const x = Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;
        const rotDeg = (angle * 180) / Math.PI + 90;
        return {
          x,
          y,
          scale: 1,
          rotate: rotDeg * 0.25,
          opacity: 1,
        };
      }

      case 'line': {
        // Clean horizontal line of 5 cards arranged DOWN below the CoverWise title
        const spacing = 62;
        const totalWidth = (total - 1) * spacing;
        const x = index * spacing - totalWidth / 2;
        return {
          x,
          y: 90,
          scale: 1,
          rotate: 0,
          opacity: 1,
        };
      }

      case 'exit': {
        // Soft downward dissolution
        const spacing = 62;
        const totalWidth = (total - 1) * spacing;
        const x = index * spacing - totalWidth / 2;
        return {
          x,
          y: 110,
          scale: 0.85,
          rotate: 0,
          opacity: 0,
        };
      }
    }
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="coverwise-scroll-morph-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1320] overflow-hidden select-none pointer-events-auto"
          aria-live="polite"
          aria-busy="true"
        >
          {/* Subtle teal radial ambient glow */}
          <motion.div
            animate={{
              scale: phase === 'circle' ? 1.2 : 1,
              opacity: phase === 'exit' ? 0 : 0.45,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute w-[520px] h-[520px] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none"
          />

          {/* Central Branded Anchor — Moved Higher UP with Prominent Typography and Logo */}
          <div className="relative z-10 flex flex-col items-center text-center px-4 -translate-y-28 sm:-translate-y-32">
            {/* Logo and Wordmark */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-3.5 sm:gap-4"
            >
              <img
                src="/logo.png"
                alt="CoverWise Shield"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 object-contain drop-shadow-[0_8px_24px_rgba(13,148,136,0.35)] shrink-0"
              />
              <h1 className="font-[var(--font-heading)] font-black text-5xl sm:text-6xl md:text-7xl text-white tracking-tight drop-shadow-lg">
                Cover<span className="text-teal-400">Wise</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-sm sm:text-base text-teal-300 font-medium tracking-wide mt-3"
            >
              {t.footer?.tagline || 'Protecting tomorrow, intelligently.'}
            </motion.p>

            {/* Subtle Progress Bar */}
            <div className="w-36 h-[3px] bg-slate-800 rounded-full mt-4 overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  ease: 'easeInOut',
                }}
                className="w-full h-full bg-gradient-to-r from-teal-500 via-teal-300 to-teal-500"
              />
            </div>
          </div>

          {/* Morphing Metaphor Cards Container — 5 Items Positioned Safely DOWN */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          >
            {cards.map((card, idx) => {
              const currentTransform = getCardTransform(idx, cards.length);
              return (
                <motion.div
                  key={card.id}
                  animate={{
                    x: currentTransform.x,
                    y: currentTransform.y,
                    scale: currentTransform.scale,
                    rotate: currentTransform.rotate,
                    opacity: currentTransform.opacity,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 160,
                    damping: 20,
                    mass: 0.8,
                  }}
                  className={`absolute w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-md shadow-xl shadow-teal-950/40 flex flex-col items-center justify-center p-2`}
                >
                  <span className="text-base sm:text-lg mb-1 leading-none">
                    {card.icon}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-200 text-center leading-tight tracking-tight line-clamp-1">
                    {card.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
