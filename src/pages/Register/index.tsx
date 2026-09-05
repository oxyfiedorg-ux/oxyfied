import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Key, User, Phone, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Schema
const registerSchema = zod.object({
  name: zod.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: zod.string().email({ message: 'Please enter a valid email address.' }),
  phone: zod.string().min(10, { message: 'Phone must be at least 10 digits.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: zod.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

type RegisterFormData = zod.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    try {
      const success = await registerUser(data.name, data.email, data.phone, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMsg('Registration failed. Try checking your parameters.');
      }
    } catch (err) {
      setErrorMsg('Network error registering account.');
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
          <h2 className="text-xl font-display font-bold text-white mt-2">Create Account</h2>
          <p className="text-xs text-stone-400">Sign up to begin building technologies today.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Field: Name */}
          <div className="space-y-1">
            <label htmlFor="reg-name" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="reg-name"
                placeholder="e.g. John Doe"
                {...register('name')}
                className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.name ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.name && <span className="text-[10px] text-red-500 font-medium">{errors.name.message}</span>}
          </div>

          {/* Field: Email */}
          <div className="space-y-1">
            <label htmlFor="reg-email" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="reg-email"
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

          {/* Field: Phone */}
          <div className="space-y-1">
            <label htmlFor="reg-phone" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="reg-phone"
                placeholder="e.g. 555-019-9284"
                {...register('phone')}
                className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.phone ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.phone && <span className="text-[10px] text-red-500 font-medium">{errors.phone.message}</span>}
          </div>

          {/* Field: Password */}
          <div className="space-y-1">
            <label htmlFor="reg-password" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="reg-password"
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

          {/* Field: Confirm Password */}
          <div className="space-y-1">
            <label htmlFor="reg-confirm" className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="reg-confirm"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`w-full pl-9 pr-3 py-2 bg-stone-900 border rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:bg-stone-950 transition-all ${
                  errors.confirmPassword ? 'border-red-500 focus:border-red-550' : 'border-stone-800 focus:border-amber-500'
                }`}
              />
              <Key className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            {errors.confirmPassword && <span className="text-[10px] text-red-500 font-medium">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
          >
            {isSubmitting ? 'Registering Account...' : 'Sign Up'}
            <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-stone-850 pt-4 text-center">
          <p className="text-xs text-stone-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-amber-500 hover:text-amber-450">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
