import React from 'react';
import { ScrollMorphPreloader } from '../ui/scroll-morph-preloader';

interface AppPreloaderProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({
  onComplete,
  minDurationMs = 1200,
}) => {
  return <ScrollMorphPreloader onComplete={onComplete} minDurationMs={minDurationMs} />;
};
