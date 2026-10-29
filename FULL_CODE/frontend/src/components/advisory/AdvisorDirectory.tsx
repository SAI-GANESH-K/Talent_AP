/**
 * Advisor Directory component for discovering certified financial specialists.
 * Backed by the official 15-advisor dataset in PostgreSQL.
 * Supports filtering by language, specialization, and consultation mode.
 */

import React, { useEffect, useState } from 'react';
import { api, type AdvisorSummary, type User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';
import { BookingModal } from './BookingModal';

interface AdvisorDirectoryProps {
  currentUser: User | null;
  assessmentSummary?: any;
  onRequestAuth: (advisor?: AdvisorSummary) => void;
  onBookingSuccess: () => void;
  initialAdvisor?: AdvisorSummary | null;
  onClearInitialAdvisor?: () => void;
}

export const AdvisorDirectory: React.FC<AdvisorDirectoryProps> = ({
  currentUser,
  assessmentSummary,
  onRequestAuth,
  onBookingSuccess,
  initialAdvisor,
  onClearInitialAdvisor,
}) => {
  const { t, language } = useLanguage();
  const [advisors, setAdvisors] = useState<AdvisorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-open booking modal if resuming from post-login handoff
  useEffect(() => {
    if (initialAdvisor && currentUser) {
      setSelectedAdvisor(initialAdvisor);
      setIsBookingOpen(true);
      if (onClearInitialAdvisor) onClearInitialAdvisor();
    }
  }, [initialAdvisor, currentUser]);

  // Filters
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  // Booking Modal State
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorSummary | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    // If user's selected app language is one of the regional languages, pre-filter by it
    if (language === 'te') setSelectedLang('Telugu');
    else if (language === 'hi') setSelectedLang('Hindi');
    else if (language === 'ta') setSelectedLang('Tamil');
    else if (language === 'kn') setSelectedLang('Kannada');
    else setSelectedLang('all');
  }, [language]);

  const loadAdvisors = () => {
    setIsLoading(true);
    setError(null);

    const params: { language?: string; mode?: string; specialisation?: string } = {};
    if (selectedLang !== 'all') params.language = selectedLang;
    if (selectedMode !== 'all') params.mode = selectedMode;
    if (selectedSpecialty !== 'all') params.specialisation = selectedSpecialty;

    api.advisors.list(params)
      .then(setAdvisors)
      .catch((err) => setError(err.message || 'Failed to load advisor directory.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAdvisors();
  }, [selectedLang, selectedMode, selectedSpecialty]);

  const handleOpenBooking = (adv: AdvisorSummary) => {
    if (!currentUser) {
      onRequestAuth(adv);
      return;
    }
    setSelectedAdvisor(adv);
    setIsBookingOpen(true);
  };

  const formatSpecialtyLabel = (s: string) => {
    return s.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header — Formatted to match Stage 1, 2, 3 layout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-8">
        <div>
          {/* Big, Bold, Beautiful Stage 4 Badge */}
          <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-teal-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-teal-500/40 rounded-2xl mb-3 shadow-xs">
            <span className="bg-teal-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg shadow-2xs">
              Stage 4
            </span>
            <span className="text-teal-950 font-extrabold text-sm sm:text-base tracking-tight">
              {(t.advisory as any).stagePill?.replace(/Stage 4\s*[·•-]?\s*/i, '') || 'Certified Advisor Discovery'}
            </span>
          </div>
          <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-[var(--color-navy-900)] tracking-tight">
            {t.advisory.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {t.advisory.subtitle}
          </p>
        </div>
        {assessmentSummary?.selected_plan_name && (
          <div className="bg-teal-50 border border-teal-200/80 px-3.5 py-2 rounded-2xl text-xs text-teal-900 flex items-center gap-2 shadow-xs">
            <span className="text-teal-600 font-bold">✓</span>
            <span>
              Selected: <strong className="font-semibold text-teal-950">{assessmentSummary.selected_plan_name}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Language Filter */}
          <div>
            <label
              htmlFor="filter_lang"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.advisory.filterLanguage}
            </label>
            <select
              id="filter_lang"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">{t.advisory.allLanguages}</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Marathi">Marathi</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label
              htmlFor="filter_mode"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.advisory.filterMode}
            </label>
            <select
              id="filter_mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">{t.advisory.allModes}</option>
              <option value="video">{t.common.modeVideo}</option>
              <option value="phone">{t.common.modePhone}</option>
              <option value="chat">{t.common.modeChat}</option>
            </select>
          </div>

          {/* Specialization Filter */}
          <div>
            <label
              htmlFor="filter_spec"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.advisory.filterSpecialty}
            </label>
            <select
              id="filter_spec"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">All Specialisations</option>
              <option value="term_protection">Term Protection</option>
              <option value="retirement_planning">Retirement Planning</option>
              <option value="first_time_buyers">First Time Buyers</option>
              <option value="women_and_homemakers">Women & Homemakers</option>
              <option value="gig_and_self_employed">Gig & Self Employed</option>
              <option value="senior_citizens">Senior Citizens</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          {t.common.loading}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 text-center">
          {error}
        </div>
      ) : advisors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <h3 className="font-[var(--font-heading)] text-lg font-bold text-slate-800">
            No advisors found matching your filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try selecting "All Languages" or "All Modes" to see more certified advisors.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedLang('all');
              setSelectedMode('all');
              setSelectedSpecialty('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advisors.map((adv) => (
            <div
              key={adv.advisor_id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md shadow-slate-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Advisor Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-navy-800)] to-[var(--color-navy-900)] text-teal-400 font-bold text-base flex items-center justify-center shadow-sm">
                      {adv.advisor_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-[var(--font-heading)] font-bold text-base text-slate-900">
                        {adv.advisor_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="text-amber-500 font-semibold">★ {adv.rating}</span>
                        <span>({adv.review_count})</span>
                        <span>·</span>
                        <span>{adv.years_experience} {t.common.yearsExp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Slot availability pill */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      adv.available_slot_count > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {adv.available_slot_count > 0
                      ? `${adv.available_slot_count} slots`
                      : 'No slots'}
                  </span>
                </div>

                {/* Languages */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Languages
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(adv.languages)
                      ? adv.languages
                      : typeof adv.languages === 'string'
                      ? (adv.languages as string).split(';').map((s) => s.trim()).filter(Boolean)
                      : []
                    ).map((l) => (
                      <span
                        key={l}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-lg font-medium"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Specialisations
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(adv.specialisations)
                      ? adv.specialisations
                      : typeof adv.specialisations === 'string'
                      ? (adv.specialisations as string).split(';').map((s) => s.trim()).filter(Boolean)
                      : []
                    ).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] rounded-md border border-teal-200/50 font-medium"
                      >
                        {formatSpecialtyLabel(s)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Consultation Modes */}
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Modes:</span>
                  <div className="flex items-center gap-2">
                    {(Array.isArray(adv.consultation_modes)
                      ? adv.consultation_modes
                      : typeof adv.consultation_modes === 'string'
                      ? (adv.consultation_modes as string).split(';').map((s) => s.trim()).filter(Boolean)
                      : []
                    ).map((m) => (
                      <span key={m} className="capitalize text-[11px] font-medium text-slate-700">
                        {m === 'video' ? 'Video' : m === 'phone' ? 'Phone' : 'Chat'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                type="button"
                onClick={() => handleOpenBooking(adv)}
                className="w-full mt-2 bg-[var(--color-navy-900)] hover:bg-[var(--color-teal-600)] text-white py-2.5 rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {t.common.bookNow}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        advisor={selectedAdvisor}
        currentUser={currentUser}
        assessmentSummary={assessmentSummary}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={() => {
          loadAdvisors();
          onBookingSuccess();
        }}
        onRequestAuth={onRequestAuth}
      />
    </div>
  );
};
