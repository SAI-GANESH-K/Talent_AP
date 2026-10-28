/**
 * Booking Modal for reserving official 30-minute advisor consultation slots.
 * Enforces transaction-safety, mode compatibility, and authentication.
 */

import React, { useEffect, useState } from 'react';
import { api, type AdvisorSlot, type AdvisorSummary, type Booking, type User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  advisor: AdvisorSummary | null;
  currentUser: User | null;
  assessmentSummary?: any;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onRequestAuth: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  advisor,
  currentUser,
  assessmentSummary,
  onClose,
  onBookingSuccess,
  onRequestAuth,
}) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<AdvisorSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AdvisorSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isOpen || !advisor) {
      setSlots([]);
      setSelectedSlot(null);
      setSelectedDate('');
      setSelectedMode('');
      setConfirmedBooking(null);
      setBookingError(null);
      return;
    }

    // Default to first supported mode
    const modes = Array.isArray(advisor.consultation_modes)
      ? advisor.consultation_modes
      : typeof advisor.consultation_modes === 'string'
      ? (advisor.consultation_modes as string).split(';').map((s) => s.trim()).filter(Boolean)
      : [];
    if (modes.length > 0) {
      setSelectedMode(modes[0]);
    }

    // Fetch available slots from backend
    setIsLoadingSlots(true);
    setBookingError(null);
    api.advisors.slots(advisor.advisor_id, { status: 'available' })
      .then((data) => {
        setSlots(data);
        if (data.length > 0) {
          // Select first available date
          const firstDate = new Date(data[0].slot_start).toISOString().split('T')[0];
          setSelectedDate(firstDate);
        }
      })
      .catch((err) => {
        setBookingError(err.message || 'Failed to load consultation slots.');
      })
      .finally(() => setIsLoadingSlots(false));
  }, [isOpen, advisor]);

  if (!isOpen || !advisor) return null;

  // Group slots by date
  const slotsByDate: Record<string, AdvisorSlot[]> = {};
  slots.forEach((s) => {
    const d = new Date(s.slot_start).toISOString().split('T')[0];
    if (!slotsByDate[d]) slotsByDate[d] = [];
    slotsByDate[d].push(s);
  });

  const availableDates = Object.keys(slotsByDate).sort();
  const currentDaySlots = selectedDate ? (slotsByDate[selectedDate] || []) : [];

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      onRequestAuth();
      return;
    }

    if (!selectedSlot) {
      setBookingError('Please select an available consultation time slot.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const result = await api.bookings.create({
        slot_id: selectedSlot.slot_id,
        consultation_mode: selectedMode,
        assessment_summary: assessmentSummary || null,
      });
      setConfirmedBooking(result);
      onBookingSuccess(result);
    } catch (err: any) {
      setBookingError(err.message || 'Slot booking failed. The slot may have been taken by another user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSlotTime = (isoString: string) => {
    try {
      const dt = new Date(isoString);
      return dt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label={t.common.close}
        >
          ✕
        </button>

        {/* CONTENT */}
        <div className="overflow-y-auto pr-1">
          {/* SUCCESS SCREEN */}
          {confirmedBooking ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                ✓
              </div>
              <h2 className="font-[var(--font-heading)] text-2xl font-bold text-slate-900 mb-2">
                {t.advisory.bookingConfirmedTitle}
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                {t.advisory.bookingSuccessMsg}
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t.advisory.consultationWith}:</span>
                  <span className="font-semibold text-slate-800">{advisor.advisor_name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t.advisory.meetingMode}:</span>
                  <span className="font-semibold text-teal-700 capitalize">
                    {confirmedBooking.consultation_mode === 'video'
                      ? `🎥 ${t.common.modeVideo}`
                      : confirmedBooking.consultation_mode === 'phone'
                      ? `📞 ${t.common.modePhone}`
                      : `💬 ${t.common.modeChat}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t.advisory.slotTime}:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedBooking.slot_start ? formatSlotTime(confirmedBooking.slot_start) : ''} (IST)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Booking Ref:</span>
                  <span className="font-mono text-slate-600 text-[11px]">
                    {confirmedBooking.id.slice(0, 13)}...
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-md transition cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          ) : (
            /* BOOKING FLOW */
            <div>
              {/* Advisor Header Card */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-navy-800)] to-[var(--color-navy-900)] text-teal-400 font-bold text-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  {advisor.advisor_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h2
                    id="booking-modal-title"
                    className="font-[var(--font-heading)] text-lg font-bold text-slate-900"
                  >
                    {advisor.advisor_name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="text-amber-500 font-semibold">★ {advisor.rating}</span>
                    <span>({advisor.review_count} {t.common.reviews})</span>
                    <span>·</span>
                    <span>{advisor.years_experience} {t.common.yearsExp}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(Array.isArray(advisor.languages)
                      ? advisor.languages
                      : typeof advisor.languages === 'string'
                      ? (advisor.languages as string).split(';').map((s) => s.trim()).filter(Boolean)
                      : []
                    ).map((l) => (
                      <span
                        key={l}
                        className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-semibold rounded-md border border-teal-200/50"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {bookingError && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
                >
                  ⚠ {bookingError}
                </div>
              )}

              {/* Step 1: Select Consultation Mode */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. {t.advisory.filterMode}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Array.isArray(advisor.consultation_modes)
                    ? advisor.consultation_modes
                    : typeof advisor.consultation_modes === 'string'
                    ? (advisor.consultation_modes as string).split(';').map((s) => s.trim()).filter(Boolean)
                    : []
                  ).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        selectedMode === mode
                          ? 'border-teal-600 bg-teal-50/70 text-teal-800 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-base">
                        {mode === 'video' ? '🎥' : mode === 'phone' ? '📞' : '💬'}
                      </span>
                      <span className="capitalize">
                        {mode === 'video'
                          ? t.common.modeVideo
                          : mode === 'phone'
                          ? t.common.modePhone
                          : t.common.modeChat}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Date Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Select Consultation Date
                </label>
                {isLoadingSlots ? (
                  <div className="text-xs text-slate-400 py-3">{t.common.loading}</div>
                ) : availableDates.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    ℹ {t.common.noSlotsAvailable}
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {availableDates.map((dateStr) => (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSlot(null);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border flex-shrink-0 transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          selectedDate === dateStr
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {formatDateLabel(dateStr)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Slot Time Chips */}
              {selectedDate && currentDaySlots.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    3. Available 30-Minute Slots (Asia/Kolkata IST)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {currentDaySlots.map((slot) => {
                      const isSelected = selectedSlot?.slot_id === slot.slot_id;
                      return (
                        <button
                          key={slot.slot_id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition text-center focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                          }`}
                        >
                          {formatSlotTime(slot.slot_start)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Auth Prompt if Anonymous */}
              {!currentUser && selectedSlot && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl mb-4 text-xs text-teal-900 flex items-center justify-between gap-3">
                  <span>
                    🔒 Please sign in or register to secure this reservation.
                  </span>
                  <button
                    type="button"
                    onClick={onRequestAuth}
                    className="bg-teal-700 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-teal-800 transition"
                  >
                    Sign In →
                  </button>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  {t.common.cancel}
                </button>

                <button
                  type="button"
                  disabled={!selectedSlot || isSubmitting}
                  onClick={handleConfirmBooking}
                  className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? t.common.loading
                    : currentUser
                    ? t.common.bookNow
                    : 'Sign In to Book'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
