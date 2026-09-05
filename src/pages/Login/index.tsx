import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Validation Schema
const loginSchema = zod.object({
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
  rememberMe: zod.boolean().optional()
});

type LoginFormData = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        const userJson = localStorage.getItem('Oxyfied_user');
        const loggedInUser = userJson ? JSON.parse(userJson) : null;
        const targetRedirect = searchParams.get('redirect');

        if (targetRedirect && targetRedirect !== '/login' && targetRedirect !== '/register' && targetRedirect !== '/dashboard' && targetRedirect !== '/dashboard/') {
          if (targetRedirect.startsWith('/admin')) {
            if (loggedInUser?.role === 'admin') navigate(targetRedirect);
            else if (loggedInUser?.role === 'mentor') navigate('/mentor/dashboard');
            else navigate('/dashboard');
          } else if (targetRedirect.startsWith('/mentor')) {
            if (loggedInUser?.role === 'mentor') navigate(targetRedirect);
            else if (loggedInUser?.role === 'admin') navigate('/admin/dashboard');
            else navigate('/dashboard');
          } else {
            // Student or general page (e.g., /checkout/...)
            if (loggedInUser?.role === 'mentor' && !targetRedirect.startsWith('/mentor')) {
              navigate('/mentor/dashboard');
            } else if (loggedInUser?.role === 'admin' && !targetRedirect.startsWith('/admin')) {
              navigate('/admin/dashboard');
            } else {
              navigate(targetRedirect);
            }
          }
        } else {
          // Default role-specific landing
          if (loggedInUser?.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (loggedInUser?.role === 'mentor') {
            navigate('/mentor/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      } else {
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.code === 'ACCOUNT_ALREADY_LOGGED_IN') {
          setErrorMsg('This account is already active on another device. Please log out from your other device before signing in here.');
        } else {
          setErrorMsg(err.response.data.error || 'Login failed. Please verify your credentials.');
        }
      } else {
        setErrorMsg('Login failed. Please verify your connection.');
      }
    }
  };

  return (
    <div className="bg-stone-950 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-[#141210] border border-stone-850 p-8 rounded-2xl shadow-2xl space-y-6 text-left">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-display font-extrabold text-sm shadow">
              O
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">
              Oxyfied
            </span>
          </Link>
          <h2 className="text-xl font-display font-bold text-white mt-2">Welcome Back</h2>
          <p className="text-xs text-stone-400">Sign in to resume building tech capabilities.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Field: Email */}
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="login-email"
                placeholder="e.g. name@Oxyfied.com"
                {...register('email')}
                className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.email && <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>}
          </div>

          {/* Field: Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Password
              </label>
              <Link to="/forgot-password" className="text-[10px] font-semibold text-amber-500 hover:text-amber-450">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.password ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              <Key className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.password && <span className="text-[10px] text-red-500 font-medium">{errors.password.message}</span>}
          </div>

          {/* Field: Remember me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-me"
              {...register('rememberMe')}
              className="w-4 h-4 border-stone-800 rounded bg-stone-900 text-amber-550 focus:ring-amber-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-stone-400 select-none">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
            <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-stone-850 pt-4 text-center">
          <p className="text-xs text-stone-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-amber-500 hover:text-amber-450">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
