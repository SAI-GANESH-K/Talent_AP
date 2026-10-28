/**
 * Customer Consultations Screen ("My Consultations").
 * Shows active and historical consultations with status badges and safe cancellation.
 */

import React, { useEffect, useState } from 'react';
import { api, type Booking } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface MyAppointmentsProps {
  onExploreAdvisors: () => void;
}

export const MyAppointments: React.FC<MyAppointmentsProps> = ({ onExploreAdvisors }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = () => {
    setIsLoading(true);
    setError(null);
    api.bookings.my()
      .then(setBookings)
      .catch((err) => setError(err.message || 'Failed to load your consultations.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm(t.advisory.cancelConfirmMsg)) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.bookings.cancel(bookingId);
      loadBookings();
    } catch (err: any) {
      alert(`Cancellation failed: ${err.message || 'Could not cancel booking.'}`);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Scheduled';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-slate-900">
            {t.advisory.myBookingsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your reserved consultations with certified insurance advisors
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreAdvisors}
          className="bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>🔍</span> Find Another Advisor
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          {t.common.loading}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          ⚠ {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📅
          </div>
          <h3 className="font-[var(--font-heading)] text-lg font-bold text-slate-800 mb-2">
            No consultations booked yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Schedule a personalized 30-minute session with a verified advisor to review your financial needs.
          </p>
          <button
            type="button"
            onClick={onExploreAdvisors}
            className="bg-[var(--color-navy-900)] hover:bg-[var(--color-teal-600)] text-white px-6 py-3 rounded-xl font-semibold text-xs transition cursor-pointer"
          >
            Explore Verified Advisors →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isCompleted = booking.status === 'completed';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {booking.consultation_mode === 'video'
                      ? '🎥'
                      : booking.consultation_mode === 'phone'
                      ? '📞'
                      : '💬'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-[var(--font-heading)] font-bold text-base text-slate-900">
                        {booking.advisor_name || 'Advisor Consultation'}
                      </h3>
                      {/* Status Tag */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isCompleted
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isConfirmed
                          ? t.common.statusConfirmed
                          : isCompleted
                          ? t.common.statusCompleted
                          : t.common.statusCancelled}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span>
                        ⏰ {formatDateTime(booking.slot_start)} (IST)
                      </span>
                      <span>·</span>
                      <span className="capitalize font-medium text-slate-700">
                        Mode: {booking.consultation_mode}
                      </span>
                    </div>

                    {booking.advisor_notes && (
                      <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-slate-700">
                        <span className="font-semibold text-slate-800">Advisor Notes:</span>{' '}
                        {booking.advisor_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                {isConfirmed && (
                  <button
                    type="button"
                    disabled={cancellingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition self-end sm:self-center disabled:opacity-50 cursor-pointer"
                  >
                    {cancellingId === booking.id ? t.common.loading : t.advisory.cancelBookingBtn}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
