import React, { useState } from 'react';
import { useAudit } from '../context/AuditContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Database,
  UserCheck
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, users } = useAudit();

  const [email, setEmail] = useState('m.vance@aegisaudit.internal');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error authenticating user');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('password123');
    login(quickEmail, 'password123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-xl text-white shadow-md">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            AegisAudit Portal
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise Compliance, Audit Fieldwork & Remediation Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-600 inline" />
              <span>SQLite 3 Authenticated Single Sign-On</span>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aegisaudit.internal"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Demo: password123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-0"
                />
                <span>Keep me signed in</span>
              </label>
              <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-70"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick One-Click Demo Sign-In
            </span>

            <div className="grid grid-cols-2 gap-2 text-left">
              {users.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.email)}
                  type="button"
                  className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold font-mono flex items-center justify-center shrink-0">
                      {u.initials}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600">
                      {u.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                    {u.roleLabel.split('&')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>Protected by AegisAudit Enterprise Governance Protocol.</p>
          <p className="font-mono text-[11px]">ISO 27001 · SOC 2 Type II · HIPAA · SOX 404</p>
        </div>
      </div>
    </div>
  );
};
