"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  /* Dynamic Variables using standard shadcn/tailwind v4 tokens */
  --pill-bg-1: color-mix(in oklch, var(--foreground, #ffffff) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground, #ffffff) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background, #0B1320) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground, #ffffff) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background, #0B1320) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground, #ffffff) 8%, transparent);
  
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground, #ffffff) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground, #ffffff) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground, #ffffff) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background, #0B1320) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground, #ffffff) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive, #ef4444) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive, #ef4444) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, color-mix(in oklch, var(--foreground, #ffffff) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground, #ffffff) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive Aurora Glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%, 
    color-mix(in oklch, var(--primary, #0D9488) 18%, transparent) 0%, 
    color-mix(in oklch, var(--secondary, #2DD4BF) 15%, transparent) 40%, 
    transparent 70%
  );
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground, #ffffff);
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: clamp(3rem, 12.5vw, 10.5rem);
  line-height: 0.85;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: transparent;
  -webkit-text-stroke: 2px rgba(45, 212, 191, 0.65);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(45, 212, 191, 0.45) 50%, rgba(20, 184, 166, 0.15) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 35px rgba(20, 184, 166, 0.4);
  user-select: none;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground, #ffffff) 0%, color-mix(in oklch, var(--foreground, #ffffff) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground, #ffffff) 15%, transparent));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

export const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT (CinematicFooter)
// -------------------------------------------------------------------------
export interface CinematicFooterProps {
  brandName?: string;
  heading?: string;
  marqueeItems?: string[];
  onStartAssessment?: () => void;
  onConsultAdvisor?: () => void;
  onNavigateHome?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenDisclaimer?: () => void;
}

const defaultMarqueeItems = [
  "Pure Life Protection",
  "Transparent HLV Guidance",
  "Zero Sales Biases",
  "Human Life Value Accuracy",
  "Absolute Client Privacy",
];

export function CinematicFooter({
  brandName = "COVERWISE",
  heading = "Ready to secure tomorrow?",
  marqueeItems = defaultMarqueeItems,
  onStartAssessment,
  onConsultAdvisor,
  onNavigateHome,
  onOpenPrivacy,
  onOpenTerms,
  onOpenDisclaimer,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* 
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box. 
      */}
      <div
        ref={wrapperRef}
        className="relative h-[90vh] sm:h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual footer stays fixed to the viewport underneath everything */}
        <footer className="fixed bottom-0 left-0 flex h-[90vh] sm:h-screen w-full flex-col justify-between overflow-hidden bg-[#070D18] text-white cinematic-footer-wrapper border-t border-slate-800">
          
          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

          {/* Giant background text — Framed prominently and clearly visible */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute bottom-2 sm:bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase text-center w-full px-2"
          >
            {brandName}
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-10 sm:top-14 left-0 w-full overflow-hidden border-y border-teal-500/20 bg-[#0B1320]/80 backdrop-blur-md py-3.5 z-10 -rotate-1 sm:-rotate-2 scale-105 sm:scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.25em] text-teal-300/80 uppercase">
              <div className="flex items-center space-x-10 px-6">
                {marqueeItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span>{item}</span>
                    <span className="text-teal-400/60">✦</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center space-x-10 px-6">
                {marqueeItems.map((item, idx) => (
                  <React.Fragment key={`rep-${idx}`}>
                    <span>{item}</span>
                    <span className="text-teal-400/60">✦</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-16 sm:mt-20 w-full max-w-5xl mx-auto">
            {/* Branded Shield Logo */}
            <div className="mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center p-2.5 shadow-xl shadow-teal-950/50 backdrop-blur-md">
                <img src="/logo.png" alt="CoverWise Shield" className="w-full h-full object-contain drop-shadow" />
              </div>
            </div>

            <h2
              ref={headingRef}
              className="text-4xl sm:text-6xl md:text-7xl font-black footer-text-glow tracking-tight mb-8 sm:mb-10 text-center"
            >
              {heading}
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-5 w-full">
              {/* Primary Call to Action Pills */}
              <div className="flex flex-wrap justify-center gap-3.5 sm:gap-4 w-full">
                <MagneticButton
                  as="button"
                  type="button"
                  onClick={onStartAssessment || scrollToTop}
                  className="footer-glass-pill px-7 sm:px-9 py-4 rounded-full text-white font-bold text-xs sm:text-sm md:text-base flex items-center gap-2.5 group cursor-pointer"
                >
                  <img src="/logo.png" alt="CoverWise Shield" className="w-5 h-5 object-contain" />
                  <span>Calculate Cover Free</span>
                </MagneticButton>
                
                <MagneticButton
                  as="button"
                  type="button"
                  onClick={onConsultAdvisor}
                  className="footer-glass-pill px-7 sm:px-9 py-4 rounded-full text-teal-200 font-bold text-xs sm:text-sm md:text-base flex items-center gap-2.5 group cursor-pointer"
                >
                  <span>Consult Certified Advisor</span>
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits — All on the Same Line: "Crafted with Love" on left-most, 4 buttons in center, back-to-top on right */}
          <div className="relative z-20 w-full pb-6 px-4 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Left-Most: "Crafted with Love for India BFSI" + Copyright */}
            <div className="flex items-center gap-3 order-1 shrink-0">
              <div className="footer-glass-pill px-4 py-2 rounded-full flex items-center gap-2 cursor-default border-slate-700/50">
                <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Crafted with</span>
                <span className="animate-footer-heartbeat text-sm md:text-base text-red-500">❤</span>
                <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">for</span>
                <span className="text-white font-extrabold text-xs md:text-sm tracking-normal ml-0.5">India BFSI</span>
              </div>
              <span className="text-slate-500 text-[10px] md:text-xs font-semibold tracking-wider uppercase hidden sm:inline">
                © 2026 CoverWise
              </span>
            </div>

            {/* Same Line: 4 Secondary Navigation Buttons (Home, Privacy Policy, How It Works, Disclaimer) */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 order-2">
              <MagneticButton
                as="button"
                type="button"
                onClick={onNavigateHome}
                className="footer-glass-pill px-4 py-2 rounded-full text-slate-300 font-medium text-xs sm:text-sm hover:text-white cursor-pointer"
              >
                Home
              </MagneticButton>
              <MagneticButton
                as="button"
                type="button"
                onClick={onOpenPrivacy}
                className="footer-glass-pill px-4 py-2 rounded-full text-slate-300 font-medium text-xs sm:text-sm hover:text-white cursor-pointer"
              >
                Privacy Policy
              </MagneticButton>
              <MagneticButton
                as="button"
                type="button"
                onClick={onOpenTerms}
                className="footer-glass-pill px-4 py-2 rounded-full text-slate-300 font-medium text-xs sm:text-sm hover:text-white cursor-pointer"
              >
                How It Works
              </MagneticButton>
              <MagneticButton
                as="button"
                type="button"
                onClick={onOpenDisclaimer}
                className="footer-glass-pill px-4 py-2 rounded-full text-slate-300 font-medium text-xs sm:text-sm hover:text-white cursor-pointer"
              >
                Disclaimer
              </MagneticButton>
            </div>

            {/* Right-Most: Back to top */}
            <div className="flex items-center gap-3 order-3 shrink-0">
              <MagneticButton
                as="button"
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll back to top"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full footer-glass-pill flex items-center justify-center text-slate-300 hover:text-white group cursor-pointer"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </MagneticButton>
            </div>

          </div>
        </footer>
      </div>
    </>
  );
}

