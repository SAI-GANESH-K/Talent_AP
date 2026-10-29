import React, { useEffect, useRef, useState, useId } from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface SlideTabsProps {
  items: TabItem[];
  activeId: string;
  className?: string;
  tabClassName?: string;
  activePillClassName?: string;
  hoverPillClassName?: string;
  size?: 'sm' | 'md';
}

interface Position {
  left: number;
  width: number;
  opacity: number;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({
  items,
  activeId,
  className = '',
  tabClassName = '',
  activePillClassName = 'bg-teal-500/25 border border-teal-400/40 text-teal-300 shadow-sm shadow-teal-500/10',
  hoverPillClassName = 'bg-white/5 border border-white/10',
  size = 'md',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [activePos, setActivePos] = useState<Position>({ left: 0, width: 0, opacity: 0 });
  const [hoverPos, setHoverPos] = useState<Position>({ left: 0, width: 0, opacity: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const instanceId = useId();

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Update active pill position based on activeId and DOM measurements
  const updateActivePosition = () => {
    if (!containerRef.current) return;
    const activeEl = tabRefs.current.get(activeId);
    if (activeEl) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      setActivePos({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    } else {
      setActivePos((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  // Re-measure when activeId changes, items change, language changes, or window resizes
  useEffect(() => {
    // Initial measure
    const frame = requestAnimationFrame(() => {
      updateActivePosition();
    });

    // ResizeObserver on the container to automatically adapt to Indic label length variations
    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateActivePosition();
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateActivePosition);

    return () => {
      cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateActivePosition);
    };
  }, [activeId, items]);

  const handleMouseEnter = (id: string) => {
    if (!containerRef.current) return;
    const el = tabRefs.current.get(id);
    if (el) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setHoverPos({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverPos((prev) => ({ ...prev, opacity: 0 }));
  };

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: 'spring' as const,
        stiffness: 380,
        damping: 32,
        mass: 0.8,
      };

  const padY = size === 'sm' ? 'py-1 px-3 text-xs' : 'py-1.5 px-3.5 text-xs sm:text-sm';

  return (
    <nav
      aria-label="Primary Navigation Tabs"
      className="inline-block"
    >
      <div
        ref={containerRef}
        role="tablist"
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full p-1 shadow-inner overflow-x-auto scrollbar-none max-w-full ${className}`}
      >
        {/* Animated Hover Background Indicator */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            left: hoverPos.left,
            width: hoverPos.width,
            opacity: hoverPos.opacity,
          }}
          transition={springTransition}
          className={`absolute top-1 bottom-1 rounded-full pointer-events-none ${hoverPillClassName}`}
        />

        {/* Animated Active Route Background Indicator */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            left: activePos.left,
            width: activePos.width,
            opacity: activePos.opacity,
          }}
          transition={springTransition}
          className={`absolute top-1 bottom-1 rounded-full pointer-events-none ${activePillClassName}`}
        />

        {/* Tab Buttons */}
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) {
                  tabRefs.current.set(tab.id, el);
                } else {
                  tabRefs.current.delete(tab.id);
                }
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              id={`tab-${instanceId}-${tab.id}`}
              onClick={tab.onClick}
              onMouseEnter={() => handleMouseEnter(tab.id)}
              className={`relative z-10 rounded-full font-medium transition-colors duration-150 cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 whitespace-nowrap select-none ${padY} ${
                isActive
                  ? 'text-teal-200 font-semibold'
                  : 'text-slate-300 hover:text-white'
              } ${tabClassName}`}
            >
              {tab.icon && <span aria-hidden="true" className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
