import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { storage } from '../../services/storage';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Check lockout on mount
  useEffect(() => {
    const checkLockout = () => {
      if (isSupabaseConfigured) return;
      const status = storage.isLockedOut();
      if (status.locked) {
        setLockoutRemaining(status.remainingSeconds);
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSupabaseConfigured) {
      if (!email.trim() || !password) {
        setError('សូមបញ្ចូល Email និងពាក្យសម្ងាត់ Admin');
        return;
      }
      if (!supabase) {
        setError('ការកំណត់ Supabase មិនពេញលេញទេ។');
        return;
      }
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) {
        setError('Email ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ។');
        return;
      }
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_wedding_admin');
      if (adminCheckError || !isAdmin) {
        await supabase.auth.signOut();
        setError(adminCheckError
          ? 'មិនអាចផ្ទៀងផ្ទាត់សិទ្ធិ Admin បានទេ។'
          : 'គណនីនេះមិនទាន់ត្រូវបានអនុញ្ញាតជា Admin ទេ។');
        return;
      }
      setError('');
      onSuccess();
      return;
    }

    if (!password.trim()) {
      setError('សូមបញ្ចូលពាក្យសម្ងាត់ Admin');
      return;
    }

    const res = storage.loginAdmin(password);
    if (res.success) {
      setError('');
      onSuccess();
    } else {
      setError(res.error || 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ!');
      if (res.remainingSeconds) {
        setLockoutRemaining(res.remainingSeconds);
      }
    }
  };

  return (
    <div className="min-h-screen khmer-pattern-bg flex items-center justify-center p-4 bg-[#FAF7F0] font-kantumruy">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-300/80 p-6 sm:p-8 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4A0E17] to-[#7A1E2C] text-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-moul text-xl text-[#4A0E17]">
            ផ្ទាំងសុវត្ថិភាព Admin
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-kantumruy">
            សម្រាប់តែសាមីដើមការ គ្រប់គ្រងបញ្ជីភ្ញៀវ និងពាក្យជូនពរ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {isSupabaseConfigured && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-kantumruy">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-kantumruy">
              {isSupabaseConfigured
                ? 'ពាក្យសម្ងាត់ Admin (Admin Password)'
                : 'ពាក្យសម្ងាត់សុវត្ថិភាព (Master Admin Password)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={lockoutRemaining > 0}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="បញ្ចូលពាក្យសម្ងាត់..."
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17] font-mono tracking-wider text-sm disabled:bg-stone-100"
                autoFocus
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {lockoutRemaining > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-700 flex-shrink-0 animate-spin" />
              <span>ប្រព័ន្ធកំពុងចាក់សោសុវត្ថិភាព។ សូមរង់ចាំ {lockoutRemaining} វិនាទីទៀត...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={lockoutRemaining > 0}
              className="w-full py-3.5 rounded-xl bg-[#4A0E17] hover:bg-[#32060f] disabled:opacity-50 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer font-kantumruy"
            >
              ផ្ទៀងផ្ទាត់ និងចូលប្រព័ន្ធ (Sign In)
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-kantumruy"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ត្រឡប់ទៅទំព័រធៀបការ</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
