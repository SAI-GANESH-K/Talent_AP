import React, { useEffect, useRef, useState } from 'react';

interface BeamsBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  colorVariant?: 'teal' | 'gold-accent' | 'mixed';
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  speed: number;
  opacity: number;
  color: string;
}

export const BeamsBackground: React.FC<BeamsBackgroundProps> = ({
  children,
  className = '',
  intensity = 'subtle',
  colorVariant = 'mixed',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detect reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // Visibility change handler to save battery / GPU cycles
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Color definitions aligned with CoverWise brand palette
    const tealColor = 'rgba(13, 148, 136, ';    // #0D9488
    const softTealColor = 'rgba(45, 212, 191, '; // #2DD4BF
    const goldColor = 'rgba(212, 168, 67, ';    // #D4A843

    const opacityMultiplier = intensity === 'strong' ? 1.6 : intensity === 'medium' ? 1.1 : 0.7;

    const getColors = () => {
      if (colorVariant === 'teal') {
        return [tealColor, softTealColor];
      }
      if (colorVariant === 'gold-accent') {
        return [goldColor, softTealColor];
      }
      // Mixed: predominantly teal with strategic warm gold highlights
      return [tealColor, softTealColor, tealColor, goldColor, softTealColor];
    };

    const palette = getColors();

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Diagonal angle: -35 degrees
    const angleRad = (-35 * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);

    // Initialize 6 smooth diagonal beams
    const beamCount = 6;
    const beams: Beam[] = [];

    for (let i = 0; i < beamCount; i++) {
      beams.push({
        x: Math.random() * (width + 400) - 200,
        y: Math.random() * (height + 400) - 100,
        width: 80 + Math.random() * 140,
        length: 350 + Math.random() * 450,
        speed: 0.15 + Math.random() * 0.25,
        opacity: (0.03 + Math.random() * 0.05) * opacityMultiplier,
        color: palette[i % palette.length],
      });
    }

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < beams.length; i++) {
          const b = beams[i];

          // Drifting along the diagonal trajectory
          b.x += cosAngle * b.speed * delta;
          b.y += sinAngle * b.speed * delta;

          // Wrap-around boundary check
          if (b.y < -b.length) {
            b.y = height + 100;
            b.x = Math.random() * (width + 300) - 150;
          }
          if (b.x < -300) {
            b.x = width + 200;
          }

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(angleRad);

          // Render soft gradient beam
          const grad = ctx.createLinearGradient(0, -b.length / 2, 0, b.length / 2);
          grad.addColorStop(0, `${b.color}0)`);
          grad.addColorStop(0.3, `${b.color}${b.opacity})`);
          grad.addColorStop(0.7, `${b.color}${b.opacity * 0.85})`);
          grad.addColorStop(1, `${b.color}0)`);

          ctx.fillStyle = grad;
          // Feathered pill-like beam shape
          ctx.fillRect(-b.width / 2, -b.length / 2, b.width, b.length);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
    };
  }, [intensity, colorVariant, prefersReducedMotion]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Dynamic Animated Canvas Beams */}
      {!prefersReducedMotion ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 select-none"
        />
      ) : (
        /* Static reduced-motion fallback gradient */
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 select-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent"
        />
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

