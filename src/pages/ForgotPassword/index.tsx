import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/authService';

const forgotSchema = zod.object({
  email: zod.string().email({ message: 'Please enter a valid email address.' })
});

type ForgotFormData = zod.infer<typeof forgotSchema>;

export const ForgotPassword: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormData) => {
    setErrorMsg(null);
    try {
      const resp = await authService.forgotPassword(data.email);
      if (resp.success) {
        setSuccess(true);
      } else {
        setErrorMsg('Failed to process request. Verify your input.');
      }
    } catch (err) {
      setErrorMsg('Network error requesting recovery token.');
    }
  };

  return (
    <div className="bg-stone-950 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-[#141210] border border-stone-850 p-8 rounded-2xl shadow-2xl space-y-6 text-left">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-display font-extrabold text-sm shadow">
              O
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">
              Oxyfied
            </span>
          </Link>
          <h2 className="text-xl font-display font-bold text-white mt-2">Reset Password</h2>
          <p className="text-xs text-stone-400">We will email you a secure link to reset your password.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 text-emerald-300 text-xs rounded-xl flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <span className="font-bold block text-white">Reset Email Sent!</span>
                <span>Please check your inbox (and spam folder) for instructions to restore access.</span>
              </div>
            </div>
            <Link
              to="/login"
              className="btn-primary w-full py-3 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Field: Email */}
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="e.g. john@Oxyfied.com"
                  {...register('email')}
                  className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                    errors.email ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                  }`}
                />
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
