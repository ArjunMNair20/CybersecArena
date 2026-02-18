import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, CheckCircle, ArrowRight, Trophy, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendConfirmationEmail } = useAuth();
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [validations, setValidations] = useState({ email: false, password: false });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    // Check for message from navigation state
    if (location.state?.message) {
      setConfirmationMessage(location.state.message);
    }
  }, [location]);

  const validateField = useCallback((name: string, value: string) => {
    const newValidations = { ...validations };
    switch(name) {
      case 'email':
        newValidations.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        newValidations.password = value.length >= 6;
        break;
    }
    setValidations(newValidations);
  }, [validations]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Failed to login. Please try again.';
      setError(errorMessage);
      
      // Show helpful message for email confirmation
      if (errorMessage.includes('Email not confirmed') || errorMessage.includes('confirm your email')) {
        setResendEmail(email);
      }
      // Only set loading to false on error - on success, component will unmount during navigation
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError(null);
    try {
      await resendConfirmationEmail(resendEmail);
      setConfirmationMessage('Confirmation email sent! Please check your inbox.');
      setResendEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 overflow-hidden">
      {/* Premium animated background with purple/violet */}
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(circle at 20% 10%, #8b5cf6 0%, transparent 40%), radial-gradient(circle at 80% 30%, #a855f7 0%, transparent 40%), radial-gradient(circle at 50% 90%, #7c3aed 0%, transparent 50%)', opacity: 0.03 }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 opacity-15" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 opacity-15" />
      
      {/* Left Side - Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-12 py-20 relative">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12 group">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-violet-500/30 border border-purple-400/40 group-hover:border-purple-400/70 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Shield className="text-purple-400 drop-shadow-[0_0_12px_#8b5cf6]" size={56} />
            </div>
            <div className="font-extrabold tracking-widest">
              <span className="text-4xl bg-gradient-to-r from-purple-400 via-purple-300 to-violet-400 bg-clip-text text-transparent block">CyberSec</span>
              <span className="text-4xl text-violet-400 block">Arena</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6 group">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300">
                <Shield className="text-purple-400 drop-shadow-[0_0_12px_#8b5cf6]" size={40} />
              </div>
              <div className="font-extrabold tracking-widest text-2xl">
                <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">CyberSec</span>
                <span className="block text-violet-400">Arena</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-4xl lg:text-3xl font-bold bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue your cybersecurity journey</p>
          </div>

          {/* Login Form - Premium Container */}
          <div className="border border-purple-600/40 rounded-3xl p-10 bg-gradient-to-br from-slate-900/60 via-purple-900/30 to-slate-950/60 shadow-[0_0_60px_rgba(139,92,246,0.12)] backdrop-blur-2xl hover:shadow-[0_0_80px_rgba(139,92,246,0.15)] transition-all duration-500 relative overflow-hidden group">
            {/* Premium form glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/8 via-transparent to-violet-500/8 pointer-events-none group-hover:from-purple-500/12 group-hover:to-violet-500/12 transition-all duration-500" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-700" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-400/40 flex items-center gap-3 text-red-200 backdrop-blur-sm animate-pulse">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Email Address</span>
                {validations.email && <CheckCircle size={18} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.email ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField('email', e.target.value);
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/40 border transition-all duration-300 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 hover:border-purple-600/60 hover:bg-slate-900/50 ${
                    validations.email 
                      ? 'border-emerald-500/50 focus:border-emerald-400/70 focus:ring-emerald-400/30' 
                      : 'border-purple-600/40 focus:border-purple-400/70 focus:ring-purple-400/30'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Password</span>
                {validations.password && <CheckCircle size={18} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.password ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField('password', e.target.value);
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-slate-900/50 border transition-all duration-200 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 ${
                    validations.password 
                      ? 'border-emerald-500/50 focus:border-emerald-400/60 focus:ring-emerald-400/20' 
                      : 'border-slate-700/50 focus:border-cyan-400/60 focus:ring-cyan-400/20'
                  } hover:border-slate-600/80`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    validations.password ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-cyan-400'
                  }`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button - Premium */}
            <button
              type="submit"
              disabled={isLoading || !validations.email || !validations.password}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500/40 via-purple-500/35 to-violet-500/30 border border-purple-400/50 text-purple-100 hover:from-purple-500/50 hover:via-purple-500/45 hover:to-violet-500/40 hover:border-purple-300/70 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-400 font-bold flex items-center justify-center gap-2 mt-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/8 to-fuchsia-400/0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-200 hover:drop-shadow-[0_0_8px_#8b5cf6]">
                Sign up now
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

