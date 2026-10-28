/**
 * Platform Operational Analytics & Administration Dashboard.
 * Admin-only view presenting aggregate platform metrics and operational consultation logs.
 */

import React, { useEffect, useState } from 'react';
import { api, type AdminStats, type Booking, type User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = () => {
    setIsLoading(true);
    setError(null);

    Promise.all([api.admin.stats(), api.admin.bookings()])
      .then(([statsData, bookingsData]) => {
        setStats(statsData);
        setBookings(bookingsData);
      })
      .catch((err) => setError(err.message || 'Failed to load administrator analytics.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const dt = new Date(isoString);
      return dt.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold mb-2">
            <span>🛡️</span> {t.nav.roleAdmin}
          </div>
          <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-slate-900">
            {t.adminPortal.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.adminPortal.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          {t.common.loading}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          ⚠ {error}
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                {t.adminPortal.totalBookings}
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.total_bookings}
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">{stats.confirmed_bookings} Confirmed</span>
                <span>·</span>
                <span className="text-blue-600 font-semibold">{stats.completed_bookings} Done</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                {t.adminPortal.totalAdvisors}
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.total_advisors}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Covering 5 Languages
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                Available Slots
              </div>
              <div className="text-3xl font-extrabold text-teal-600">
                {stats.available_slots}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                out of {stats.total_slots} dataset slots
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                {t.adminPortal.slotUtilization}
              </div>
              <div className="text-3xl font-extrabold text-purple-600">
                {stats.slot_utilization_pct}%
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                {stats.booked_slots} slots reserved
              </div>
            </div>
          </div>

          {/* Mode Breakdown & System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm md:col-span-1">
              <h3 className="font-[var(--font-heading)] font-bold text-sm text-slate-800 mb-4">
                {t.adminPortal.bookingModes}
              </h3>
              <div className="space-y-3">
                {['video', 'phone', 'chat'].map((m) => {
                  const count = stats.bookings_by_mode[m] || 0;
                  const pct = stats.total_bookings > 0 ? Math.round((count / stats.total_bookings) * 100) : 0;
                  return (
                    <div key={m} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="capitalize font-medium">
                          {m === 'video' ? '🎥 Video Call' : m === 'phone' ? '📞 Phone' : '💬 Chat'}
                        </span>
                        <span className="font-semibold text-slate-900">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operational Bookings Table */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm md:col-span-2 overflow-hidden">
              <h3 className="font-[var(--font-heading)] font-bold text-sm text-slate-800 mb-4">
                Recent Platform Consultations
              </h3>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No bookings recorded yet on the platform.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Advisor</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.slice(0, 10).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {b.customer_name || 'Customer'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {b.advisor_name || b.advisor_id}
                          </td>
                          <td className="py-2.5 px-3 capitalize">
                            {b.consultation_mode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {formatDateTime(b.slot_start)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : b.status === 'completed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
