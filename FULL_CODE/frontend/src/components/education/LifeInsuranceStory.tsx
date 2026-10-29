import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LIFE_STORY_CONTENT } from '../../i18n/educationContent';
import { StoryScene } from './StoryScene';

interface LifeInsuranceStoryProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment: () => void;
}

export const LifeInsuranceStory: React.FC<LifeInsuranceStoryProps> = ({
  isOpen,
  onClose,
  onStartAssessment,
}) => {
  const { language } = useLanguage();
  const storyData = LIFE_STORY_CONTENT[language] || LIFE_STORY_CONTENT.en;

  const [currentScene, setCurrentScene] = useState<number>(0);

  // Reset to first scene when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentScene(0);
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    if (currentScene < storyData.scenes.length - 1) {
      setCurrentScene((prev) => prev + 1);
    }
  }, [currentScene, storyData.scenes.length]);

  const handleBack = useCallback(() => {
    if (currentScene > 0) {
      setCurrentScene((prev) => prev - 1);
    }
  }, [currentScene]);

  // Keyboard navigation: Esc to close, Arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handleBack, onClose]);

  if (!isOpen) return null;

  const scene = storyData.scenes[currentScene];
  const isFirstScene = currentScene === 0;
  const isLastScene = currentScene === storyData.scenes.length - 1;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="life-story-title"
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0F172A] border border-teal-500/30 rounded-3xl max-w-2xl w-full text-white shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-7 pt-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="CoverWise" className="w-6 h-6 object-contain" />
              <span className="text-xs sm:text-sm font-bold text-teal-300 font-[var(--font-heading)] uppercase tracking-wider">
                {storyData.storyModalTitle}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              aria-label={storyData.controls.close}
            >
              ✕
            </button>
          </div>

          {/* Progress Indicator (Scene X of 4) */}
          <div className="px-5 sm:px-7 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="font-semibold text-teal-400">
                {storyData.controls.stepOf} {currentScene + 1} / {storyData.scenes.length}
              </span>
              <span className="text-[11px] text-slate-400">{scene.badge}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {storyData.scenes.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentScene(idx)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all ${
                    idx === currentScene
                      ? 'bg-teal-400 shadow-sm shadow-teal-400/50'
                      : idx < currentScene
                      ? 'bg-teal-700'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Story Body */}
          <div className="p-5 sm:p-7 space-y-4">
            {/* Illustrated SVG Scene */}
            <StoryScene sceneIndex={currentScene} />

            {/* Scene Content */}
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h3
                id="life-story-title"
                className="text-lg sm:text-2xl font-extrabold text-white font-[var(--font-heading)] tracking-tight"
              >
                {scene.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {scene.narrative}
              </p>

              {/* Key Educational Takeaway */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/25 flex items-start gap-3 text-xs text-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed font-medium">
                  {scene.keyTakeaway}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Navigation & Action Bar */}
          <div className="px-5 sm:px-7 py-4 bg-[#0B1320] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {!isFirstScene && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {storyData.controls.back}
                </button>
              )}
              {isLastScene && (
                <button
                  type="button"
                  onClick={() => setCurrentScene(0)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  {storyData.controls.replay}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {!isLastScene ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 transition cursor-pointer"
                  >
                    {storyData.controls.skip}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition cursor-pointer"
                  >
                    {storyData.controls.next}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartAssessment();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {storyData.controls.finalCta}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

