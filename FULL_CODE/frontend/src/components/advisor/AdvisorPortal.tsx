/**
 * Advisor Consultation Portal for certified advisors to view assigned consultations,
 * update consultation statuses, and enter summary consultation notes.
 */

import React, { useEffect, useState } from 'react';
import { api, type Booking, type User } from '../../api/client';
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
    try {
      await api.advisor.updateConsultation(bookingId, {
        status: newStatus,
        advisor_notes: activeNotes[bookingId],
      });
      loadConsultations();
    } catch (err: any) {
      alert(`Update failed: ${err.message || 'Error updating consultation.'}`);
    } finally {
      setIsSaving((prev) => ({ ...prev, [bookingId]: false }));
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold mb-2">
              <span>🩺</span> {t.nav.roleAdvisor} Portal
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
              🔄 Refresh List
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
          ⚠ {error}
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📋
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

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                {/* Top Row: Customer & Slot Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      <h3 className="font-[var(--font-heading)] font-bold text-base text-slate-900">
                        {booking.customer_name || 'Customer'}
                      </h3>
                      {booking.customer_email && (
                        <span className="text-xs text-slate-500">({booking.customer_email})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                      <span>⏰ {formatDateTime(booking.slot_start)}</span>
                      <span>·</span>
                      <span className="capitalize font-semibold text-teal-700">
                        Mode: {booking.consultation_mode}
                      </span>
                    </div>
                  </div>

                  {/* Status & Complete Action */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
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

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleUpdate(booking.id, 'completed')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                  </div>
                </div>

                {/* Assessment Summary shared by customer */}
                {booking.assessment_summary && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-700 mb-1">
                      Customer Financial Context:
                    </div>
                    <div className="font-mono text-slate-600 text-[11px] whitespace-pre-wrap">
                      {JSON.stringify(booking.assessment_summary, null, 2)}
                    </div>
                  </div>
                )}

                {/* Consultation Notes Section */}
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
                    onChange={(e) =>
                      setActiveNotes({ ...activeNotes, [booking.id]: e.target.value })
                    }
                    placeholder="Enter key recommendations, customer goals discussed, follow-up items..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={isSaving[booking.id]}
                      onClick={() => handleUpdate(booking.id)}
                      className="bg-[var(--color-navy-900)] hover:bg-[var(--color-teal-600)] text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                    >
                      {isSaving[booking.id] ? t.common.loading : t.advisorPortal.saveNotesBtn}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
