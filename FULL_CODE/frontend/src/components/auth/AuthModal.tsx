/**
 * Accessible Authentication Modal for Customer, Advisor, and Admin Sign In/Registration.
 * Never stores tokens in localStorage — uses HttpOnly cookies issued by FastAPI.
 */

import React, { useState } from 'react';
import { api, type User } from '../../api/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login({ email, password });
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.auth.register({ email, password, full_name: fullName });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      let msg = err.message || 'Invalid email or wrong password. Please check your credentials and try again.';
      if (
        mode === 'login' &&
        (err.status === 401 ||
          msg.toLowerCase().includes('api error') ||
          msg.toLowerCase().includes('401') ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('invalid credential') ||
          msg.toLowerCase().includes('busy') ||
          msg.toLowerCase().includes('demand'))
      ) {
        msg = 'Invalid email or wrong password. Please check your credentials and try again.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label={t.common.close}
        >
          ✕
        </button>

        {/* Header with Brand Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-50/80 border border-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3 p-2 shadow-xs">
            <img src="/logo.png" alt="CoverWise Shield" className="w-10 h-10 object-contain" />
          </div>
          <h2
            id="auth-modal-title"
            className="font-[var(--font-heading)] text-2xl font-bold text-slate-900"
          >
            {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Sign in to book consultations and manage your protection'
              : 'Create a customer account to reserve appointments'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed"
          >
            ⚠ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="full_name_input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.auth.nameLabel} *
              </label>
              <input
                id="full_name_input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email_input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.auth.emailLabel} *
            </label>
            <input
              id="email_input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <div>
            <label
              htmlFor="password_input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t.auth.passwordLabel} *
            </label>
            <input
              id="password_input"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[var(--color-teal-600)] hover:bg-[var(--color-teal-500)] text-white py-3 rounded-xl font-semibold text-sm shadow-md transition disabled:opacity-60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {isLoading
              ? t.common.loading
              : mode === 'login'
              ? t.auth.loginBtn
              : t.auth.registerBtn}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-5 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
            >
              {t.auth.noAccount}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
            >
              {t.auth.haveAccount}
            </button>
          )}
        </div>

        {/* Demo Accounts Quick-Fill for Local Evaluation only */}
        {typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.endsWith('.local')) && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Development Evaluation Personas
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('customer@coverwise.test')}
                  className="text-[11px] p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition text-center font-medium"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('advisor@coverwise.test')}
                  className="text-[11px] p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition text-center font-medium"
                >
                  Advisor
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@coverwise.test')}
                  className="text-[11px] p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition text-center font-medium"
                >
                  Admin
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
