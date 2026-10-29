import React from 'react';
import { motion } from 'motion/react';

interface StorySceneProps {
  sceneIndex: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({ sceneIndex }) => {
  return (
    <div className="w-full h-48 sm:h-56 md:h-64 flex items-center justify-center relative overflow-hidden rounded-2xl bg-gradient-to-b from-teal-950/20 via-[#0B1524] to-[#0A1220] border border-teal-500/20 shadow-inner">
      {/* Scene 1: Everyday Life — Farmer Ramu, farm & family */}
      {sceneIndex === 0 && (
        <motion.svg
          key="scene-1"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewBox="0 0 400 240"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sun & Sky */}
          <circle cx="340" cy="50" r="28" fill="#FBBF24" fillOpacity="0.25" />
          <circle cx="340" cy="50" r="18" fill="#F59E0B" />
          <path d="M40 70 Q90 60 140 70" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.3" />
          <path d="M220 80 Q260 70 300 80" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.3" />

          {/* Farm Hills / Green Fields */}
          <path d="M-20 220 Q80 140 220 180 T420 160 L420 250 L-20 250 Z" fill="#064E3B" fillOpacity="0.6" />
          <path d="M-20 230 Q120 170 280 200 T420 190 L420 250 L-20 250 Z" fill="#047857" fillOpacity="0.7" />
          <path d="M0 215 Q180 185 400 215" stroke="#10B981" strokeWidth="2" strokeOpacity="0.4" />

          {/* Small Farm House */}
          <rect x="70" y="145" width="60" height="45" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="2" />
          <path d="M60 145 L100 115 L140 145 Z" fill="#B45309" stroke="#D97706" strokeWidth="2" />
          <rect x="92" y="160" width="16" height="30" fill="#0F172A" />
          <rect x="76" y="152" width="10" height="10" rx="1" fill="#FEF08A" fillOpacity="0.8" />

          {/* Ramu (Farmer with straw hat & plow/sheaf) */}
          <g transform="translate(230, 115)">
            {/* Body */}
            <path d="M25 50 Q25 80 25 105" stroke="#14B8A6" strokeWidth="12" strokeLinecap="round" />
            {/* Turban/Hat */}
            <ellipse cx="25" cy="22" rx="14" ry="7" fill="#F59E0B" />
            <circle cx="25" cy="28" r="9" fill="#FDE68A" />
            {/* Arms holding wheat/tools */}
            <path d="M15 50 L5 70" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" />
            <path d="M35 50 L50 68" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" />
            {/* Wheat stalk */}
            <path d="M50 72 L60 38" stroke="#FBBF24" strokeWidth="2" />
            <ellipse cx="60" cy="38" rx="4" ry="7" fill="#FBBF24" />
          </g>

          {/* Ramu's Family (Spouse & Child) */}
          <g transform="translate(170, 130)">
            {/* Spouse */}
            <circle cx="20" cy="24" r="8" fill="#FDE68A" />
            <path d="M12 36 Q20 32 28 36 L24 85 L16 85 Z" fill="#EC4899" />
            {/* Child */}
            <circle cx="44" cy="45" r="6" fill="#FDE68A" />
            <rect x="39" y="52" width="10" height="30" rx="2" fill="#3B82F6" />
            {/* School Bag */}
            <rect x="47" y="55" width="6" height="8" rx="1" fill="#EAB308" />
          </g>

          {/* Gentle Floating Income / Harvest Badge */}
          <g transform="translate(260, 25)">
            <rect x="0" y="0" width="125" height="28" rx="14" fill="#0F172A" stroke="#14B8A6" strokeWidth="1.5" />
            <circle cx="16" cy="14" r="8" fill="#14B8A6" fillOpacity="0.2" />
            <text x="13" y="18" fill="#2DD4BF" fontSize="12" fontWeight="bold">₹</text>
            <text x="32" y="18" fill="#E2E8F0" fontSize="11" fontWeight="600">Daily Farm Income</text>
          </g>
        </motion.svg>
      )}

      {/* Scene 2: The Unexpected Challenge — Income stops, bills & loans remain */}
      {sceneIndex === 1 && (
        <motion.svg
          key="scene-2"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewBox="0 0 400 240"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Somber Dusk Sky */}
          <rect x="0" y="0" width="400" height="240" fill="#0A0F1D" />
          <path d="M-20 220 Q100 190 240 210 T420 200 L420 240 L-20 240 Z" fill="#1E293B" />

          {/* House in background with lights off */}
          <rect x="50" y="130" width="75" height="60" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <path d="M40 130 L87 95 L135 130 Z" fill="#78350F" />
          <rect x="78" y="150" width="18" height="40" fill="#0F172A" />

          {/* Empty work stool / boots */}
          <g transform="translate(155, 160)">
            <ellipse cx="20" cy="15" rx="14" ry="4" fill="#475569" />
            <path d="M10 15 L8 35 M30 15 L32 35" stroke="#64748B" strokeWidth="2.5" />
          </g>

          {/* Financial Responsibilities Stacking Up (School fees, Farm loan, Living bills) */}
          <g transform="translate(230, 50)">
            {/* Card 1: Outstanding Crop Loan */}
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="150" height="34" rx="8" fill="#1E293B" stroke="#EF4444" strokeWidth="1.5" />
              <circle cx="16" cy="17" r="7" fill="#EF4444" fillOpacity="0.2" />
              <text x="13" y="21" fill="#F87171" fontSize="11" fontWeight="bold">!</text>
              <text x="30" y="15" fill="#F87171" fontSize="10" fontWeight="bold">Bank Crop Loan</text>
              <text x="30" y="27" fill="#94A3B8" fontSize="9">₹3,50,000 Unpaid</text>
            </g>

            {/* Card 2: Children School Fees */}
            <g transform="translate(10, 44)">
              <rect x="0" y="0" width="145" height="34" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="16" cy="17" r="7" fill="#F59E0B" fillOpacity="0.2" />
              <text x="13" y="21" fill="#FBBF24" fontSize="11" fontWeight="bold">!</text>
              <text x="30" y="15" fill="#FBBF24" fontSize="10" fontWeight="bold">School Education</text>
              <text x="30" y="27" fill="#94A3B8" fontSize="9">Term Fee Due</text>
            </g>

            {/* Card 3: Monthly Household Ration */}
            <g transform="translate(20, 88)">
              <rect x="0" y="0" width="140" height="34" rx="8" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
              <text x="25" y="15" fill="#E2E8F0" fontSize="10" fontWeight="bold">Family Living Costs</text>
              <text x="25" y="27" fill="#94A3B8" fontSize="9">₹20,000 Monthly</text>
            </g>
          </g>

          {/* Income Flow Interrupted Indicator */}
          <g transform="translate(50, 40)">
            <rect x="0" y="0" width="145" height="28" rx="14" fill="#450A0A" stroke="#DC2626" strokeWidth="1.2" />
            <text x="18" y="18" fill="#FCA5A5" fontSize="11" fontWeight="bold">Earnings Stopped</text>
          </g>
        </motion.svg>
      )}

      {/* Scene 3: How Life Insurance Steps In — Shield, debt payoff & children protected */}
      {sceneIndex === 2 && (
        <motion.svg
          key="scene-3"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewBox="0 0 400 240"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Radial Ambient Glow */}
          <circle cx="200" cy="120" r="120" fill="#0D9488" fillOpacity="0.15" />

          {/* Central Protective Shield */}
          <g transform="translate(145, 30)">
            {/* Glowing Shield Shape */}
            <path
              d="M55 10 L100 25 C100 95 65 145 55 155 C45 145 10 95 10 25 Z"
              fill="url(#shieldGrad)"
              stroke="#2DD4BF"
              strokeWidth="2.5"
            />
            {/* White/Teal Arrow of Financial Support */}
            <path
              d="M32 90 L50 65 L68 78 L80 50"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M72 50 L80 50 L80 58" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
            <text x="22" y="125" fill="#E2E8F0" fontSize="10" fontWeight="bold" letterSpacing="0.5">TERM COVER</text>
          </g>

          <defs>
            <linearGradient id="shieldGrad" x1="10" y1="10" x2="100" y2="155" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F766E" />
              <stop offset="1" stopColor="#115E59" />
            </linearGradient>
          </defs>

          {/* Left Side: Outstanding Loan Cleared */}
          <g transform="translate(20, 65)">
            <rect x="0" y="0" width="115" height="50" rx="10" fill="#042F2E" stroke="#14B8A6" strokeWidth="1.5" />
            <circle cx="18" cy="25" r="9" fill="#10B981" />
            <path d="M14 25 L17 28 L23 22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <text x="35" y="22" fill="#E2E8F0" fontSize="10" fontWeight="bold">Loans Cleared</text>
            <text x="35" y="36" fill="#5EEAD4" fontSize="9">Debt Free Home</text>
          </g>

          {/* Right Side: Education Secured */}
          <g transform="translate(265, 65)">
            <rect x="0" y="0" width="115" height="50" rx="10" fill="#042F2E" stroke="#14B8A6" strokeWidth="1.5" />
            <circle cx="18" cy="25" r="9" fill="#10B981" />
            <path d="M14 25 L17 28 L23 22" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <text x="35" y="22" fill="#E2E8F0" fontSize="10" fontWeight="bold">Education Safe</text>
            <text x="35" y="36" fill="#5EEAD4" fontSize="9">College Fund Intact</text>
          </g>

          {/* Family Protected Underneath */}
          <g transform="translate(150, 185)">
            <rect x="0" y="0" width="100" height="28" rx="14" fill="#0F172A" stroke="#2DD4BF" strokeWidth="1" />
            <text x="14" y="18" fill="#F0FDFA" fontSize="11" fontWeight="600">Family Dignity</text>
          </g>
        </motion.svg>
      )}

      {/* Scene 4: Planning Your Cover — CoverWise tailored calculations */}
      {sceneIndex === 3 && (
        <motion.svg
          key="scene-4"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewBox="0 0 400 240"
          className="w-full h-full p-2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Ambient Background */}
          <circle cx="200" cy="120" r="100" fill="#14B8A6" fillOpacity="0.1" />

          {/* CoverWise Personalized Plan Card */}
          <g transform="translate(60, 25)">
            <rect x="0" y="0" width="280" height="185" rx="16" fill="#0F172A" stroke="#14B8A6" strokeWidth="1.5" />
            
            {/* Card Header */}
            <rect x="15" y="15" width="250" height="32" rx="8" fill="#134E4A" fillOpacity="0.4" />
            <circle cx="32" cy="31" r="7" fill="#14B8A6" />
            <path d="M29 31 L31 33 L35 29" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="46" y="35" fill="#E2E8F0" fontSize="11" fontWeight="bold">Your Tailored Protection Plan</text>
            
            {/* Actuarial Checklist Items */}
            {/* Item 1 */}
            <g transform="translate(20, 58)">
              <circle cx="8" cy="8" r="6" fill="#10B981" fillOpacity="0.3" />
              <path d="M6 8 L8 10 L11 7" stroke="#34D399" strokeWidth="1.5" />
              <text x="22" y="11" fill="#CBD5E1" fontSize="10">Living Support (Household Needs)</text>
              <text x="200" y="11" fill="#2DD4BF" fontSize="10" fontWeight="bold">✓ Included</text>
            </g>

            {/* Item 2 */}
            <g transform="translate(20, 84)">
              <circle cx="8" cy="8" r="6" fill="#10B981" fillOpacity="0.3" />
              <path d="M6 8 L8 10 L11 7" stroke="#34D399" strokeWidth="1.5" />
              <text x="22" y="11" fill="#CBD5E1" fontSize="10">Outstanding Debts & Loans</text>
              <text x="200" y="11" fill="#2DD4BF" fontSize="10" fontWeight="bold">✓ Included</text>
            </g>

            {/* Item 3 */}
            <g transform="translate(20, 110)">
              <circle cx="8" cy="8" r="6" fill="#10B981" fillOpacity="0.3" />
              <path d="M6 8 L8 10 L11 7" stroke="#34D399" strokeWidth="1.5" />
              <text x="22" y="11" fill="#CBD5E1" fontSize="10">Children Higher Education</text>
              <text x="200" y="11" fill="#2DD4BF" fontSize="10" fontWeight="bold">✓ Included</text>
            </g>

            {/* Item 4 */}
            <g transform="translate(20, 136)">
              <circle cx="8" cy="8" r="6" fill="#10B981" fillOpacity="0.3" />
              <path d="M6 8 L8 10 L11 7" stroke="#34D399" strokeWidth="1.5" />
              <text x="22" y="11" fill="#CBD5E1" fontSize="10">Bank Savings Deducted Fairly</text>
              <text x="200" y="11" fill="#2DD4BF" fontSize="10" fontWeight="bold">✓ Zero Waste</text>
            </g>

            {/* Trust Footer */}
            <path d="M15 158 L265 158" stroke="#334155" strokeWidth="1" />
            <text x="140" y="174" fill="#94A3B8" fontSize="9" textAnchor="middle">
              100% Free · Dual-Engine Actuarial Math · Zero Agent Pressure
            </text>
          </g>
        </motion.svg>
      )}
    </div>
  );
};

