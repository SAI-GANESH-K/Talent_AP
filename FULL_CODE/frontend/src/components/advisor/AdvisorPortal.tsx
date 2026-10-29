/**
 * Advisor Consultation Portal for certified advisors to view assigned consultations,
 * update consultation statuses, enter summary consultation notes, and remove/cancel consultations if needed.
 */

import React, { useEffect, useState } from 'react';
import { api, formatINR, formatINRLakhCr, type Booking, type User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface AdvisorPortalProps {
  currentUser: User;
}

export const AdvisorPortal: React.FC<AdvisorPortalProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [consultations, setConsultations] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});
  const [cancelModalBookingId, setCancelModalBookingId] = useState<string | null>(null);

  const loadConsultations = () => {
    setIsLoading(true);
    setError(null);
    api.advisor.consultations()
      .then((data) => {
        setConsultations(data);
        const notesMap: Record<string, string> = {};
        data.forEach((b) => {
          notesMap[b.id] = b.advisor_notes || '';
        });
        setActiveNotes(notesMap);
      })
      .catch((err) => setError(err.message || 'Failed to load assigned consultations.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleUpdate = async (bookingId: string, newStatus?: string) => {
    setIsSaving((prev) => ({ ...prev, [bookingId]: true }));
    setSaveSuccess((prev) => ({ ...prev, [bookingId]: false }));
    try {
      await api.advisor.updateConsultation(bookingId, {
        status: newStatus,
        advisor_notes: activeNotes[bookingId],
      });
      setSaveSuccess((prev) => ({ ...prev, [bookingId]: true }));
      setTimeout(() => {
        setSaveSuccess((prev) => ({ ...prev, [bookingId]: false }));
      }, 3500);
      loadConsultations();
    } catch (err: any) {
      alert(`Update failed: ${err.message || 'Error updating consultation.'}`);
    } finally {
      setIsSaving((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    await handleUpdate(bookingId, 'cancelled');
    setCancelModalBookingId(null);
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Scheduled';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-navy-900)] to-[var(--color-navy-800)] text-white rounded-3xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold mb-2">
              {t.nav.roleAdvisor} Portal
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold">
              {currentUser.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Advisor ID: <span className="font-mono text-teal-400">{currentUser.advisor_id || 'ADV-DEFAULT'}</span> · Official Saffron Life Certified Advisor
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadConsultations}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition cursor-pointer"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <h2 className="font-[var(--font-heading)] text-xl font-bold text-slate-900 mb-4">
        {t.advisorPortal.assignedConsultations}
      </h2>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          {t.common.loading}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-[var(--font-heading)] text-lg font-bold text-slate-800 mb-1">
            {t.advisorPortal.noAssigned}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When customers book consultation slots with your profile, they will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultations.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isCompleted = booking.status === 'completed';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                {/* Top Row: Customer & Slot Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-[var(--font-heading)] font-bold text-base text-slate-900">
                        {booking.customer_name || 'Customer'}
                      </h3>
                      {booking.customer_email && (
                        <span className="text-xs text-slate-500">({booking.customer_email})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                      <span>{formatDateTime(booking.slot_start)}</span>
                      <span>·</span>
                      <span className="capitalize font-semibold text-teal-700">
                        Mode: {booking.consultation_mode}
                      </span>
                    </div>
                  </div>

                  {/* Status & Operational Actions */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCompleted
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isConfirmed
                        ? t.common.statusConfirmed
                        : isCompleted
                        ? t.common.statusCompleted
                        : t.common.statusCancelled}
                    </span>

                    {/* Mark Completed button */}
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleUpdate(booking.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        ✓ Mark Completed
                      </button>
                    )}

                    {/* Remove / Cancel Consultation option (If needed only) */}
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => setCancelModalBookingId(booking.id)}
                        className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel Consultation
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Financial Summary */}
                {booking.assessment_summary && Object.keys(booking.assessment_summary).length > 0 ? (
                  <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        Customer's Shared Financial Summary
                      </div>
                      {booking.assessment_summary.method && (
                        <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                          {booking.assessment_summary.method}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Estimated Protection Gap */}
                      {(booking.assessment_summary.coverage_gap !== undefined || booking.assessment_summary.recommended_cover_inr !== undefined) && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                          <span className="text-[11px] text-slate-500 font-medium block">Estimated Protection Gap</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                            {formatINR(booking.assessment_summary.coverage_gap ?? booking.assessment_summary.recommended_cover_inr)}
                          </span>
                        </div>
                      )}

                      {/* Selected Plan */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                        <span className="text-[11px] text-slate-500 font-medium block">Selected Plan</span>
                        <span className="text-sm font-bold text-teal-700 mt-0.5 block truncate" title={booking.assessment_summary.selected_plan_name || booking.assessment_summary.product || 'Not yet selected'}>
                          {booking.assessment_summary.selected_plan_name || booking.assessment_summary.product || 'Not yet selected'}
                        </span>
                      </div>

                      {/* Proposed Life Cover */}
                      {booking.assessment_summary.selected_sum_assured_inr !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                          <span className="text-[11px] text-slate-500 font-medium block">Proposed Life Cover</span>
                          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                            {formatINRLakhCr(booking.assessment_summary.selected_sum_assured_inr)}
                            {booking.assessment_summary.selected_tenure_years && (
                              <span className="text-xs font-normal text-slate-500 ml-1">({booking.assessment_summary.selected_tenure_years} yrs)</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Validated Premium */}
                      {booking.assessment_summary.selected_premium_amount_inr !== undefined && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                          <span className="text-[11px] text-slate-500 font-medium block">Validated Premium</span>
                          <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
                            {formatINR(booking.assessment_summary.selected_premium_amount_inr)}
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              /{booking.assessment_summary.selected_premium_mode || 'mo'}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Riders & Profile Context */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                      <div>
                        <strong className="text-slate-700">Riders: </strong>
                        {Array.isArray(booking.assessment_summary.selected_riders) && booking.assessment_summary.selected_riders.length > 0 ? (
                          <span className="text-slate-800 font-medium">
                            {booking.assessment_summary.selected_riders.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-500">None selected</span>
                        )}
                      </div>

                      {(booking.assessment_summary.user_age || booking.assessment_summary.annual_income_inr) && (
                        <div className="text-slate-500">
                          {booking.assessment_summary.user_age && <span>Age: {booking.assessment_summary.user_age} yrs</span>}
                          {booking.assessment_summary.user_age && booking.assessment_summary.annual_income_inr && <span> · </span>}
                          {booking.assessment_summary.annual_income_inr && (
                            <span>Income: {formatINR(booking.assessment_summary.annual_income_inr)}/yr</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-500 italic">
                    Financial details were not shared by this customer.
                  </div>
                )}

                {/* Consultation Notes Section */}
                {!isCancelled && (
                  <div>
                    <label
                      htmlFor={`notes_${booking.id}`}
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      {t.advisorPortal.notesLabel}
                    </label>
                    <textarea
                      id={`notes_${booking.id}`}
                      rows={3}
                      value={activeNotes[booking.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setActiveNotes((prev) => ({ ...prev, [booking.id]: val }));
                      }}
                      placeholder="Enter key recommendations, customer goals discussed, follow-up items..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      {/* Live Feedback Toast */}
                      <div>
                        {saveSuccess[booking.id] && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg animate-fadeIn">
                            <span>✓</span>
                            <span>Notes and updates saved successfully!</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isSaving[booking.id]}
                        onClick={() => handleUpdate(booking.id)}
                        className="bg-[var(--color-navy-900)] hover:bg-[var(--color-teal-600)] text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                      >
                        {isSaving[booking.id] ? (
                          <>
                            <span className="inline-block animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>{t.advisorPortal.saveNotesBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Consultation Confirmation Modal */}
      {cancelModalBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
              ⚠
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Cancel Consultation?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove and cancel this scheduled consultation? The consultation slot will be immediately released back to the directory for other customers.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBookingId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Keep Consultation
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(cancelModalBookingId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
