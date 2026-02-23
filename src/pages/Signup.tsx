import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailExistsError, setEmailExistsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
    setEmailExistsError(false);
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newValidations = { ...validations };
    
    switch (name) {
      case 'username':
        newValidations.username = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
        break;
      case 'email':
        newValidations.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        newValidations.password = value.length >= 6;
        break;
      case 'confirmPassword':
        newValidations.confirmPassword = value === formData.password && value.length > 0;
        break;
      default:
        break;
    }
    
    setValidations(newValidations);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.username) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailExistsError(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name || undefined,
      });
      
      if (result.needsConfirmation) {
        // Show success message about email confirmation
        setError(null);
        // You could show a success message here instead of navigating
        navigate('/login', { 
          state: { 
            message: 'Account created! Please check your email to confirm your account before signing in.' 
          } 
        });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      
      // Check if it's an email already registered error
      if (errorMessage.includes('already registered') || errorMessage.includes('Please sign in instead')) {
        setEmailExistsError(true);
        setError(errorMessage);
      } else if (
        errorMessage.includes('rate limit') || 
        errorMessage.includes('too many') ||
        errorMessage.includes('temporarily busy') ||
        errorMessage.includes('email service')
      ) {
        // Email rate limit error - suggest checking if account was created
        setError('Email service is temporarily busy. Check if your account was created by trying to login. If it worked, you can verify your email later.');
        console.warn('Email rate limited. User should check if account exists by trying to login.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, text: '' };
    if (password.length < 6) return { strength: 1, text: 'Weak' };
    if (password.length < 10) return { strength: 2, text: 'Medium' };
    return { strength: 3, text: 'Strong' };
  };

  const strength = passwordStrength();

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

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 lg:px-12 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6 group">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
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
            <h1 className="text-4xl lg:text-3xl font-bold bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent mb-2">Create Your Account</h1>
            <p className="text-slate-400 text-sm">Join the community of cybersecurity experts</p>
            <div className="mt-3 flex items-center justify-center lg:justify-start gap-2 text-xs text-purple-400">
              <Sparkles size={14} />
              <span>Professional Training Platform</span>
            </div>
          </div>

          {/* Signup Form - Premium Container */}
          <div className="border border-purple-600/40 rounded-3xl p-10 bg-gradient-to-br from-slate-900/60 via-purple-900/30 to-slate-950/60 shadow-[0_0_60px_rgba(139,92,246,0.12)] backdrop-blur-2xl hover:shadow-[0_0_80px_rgba(139,92,246,0.15)] transition-all duration-500 relative overflow-hidden group">
            {/* Premium form glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/8 via-transparent to-violet-500/8 pointer-events-none group-hover:from-purple-500/12 group-hover:to-violet-500/12 transition-all duration-500" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-700" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -z-10 group-hover:bg-violet-500/20 transition-all duration-700" />
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 backdrop-blur-sm animate-pulse ${
                emailExistsError 
                  ? 'bg-blue-500/15 border-blue-400/40' 
                  : 'bg-red-500/15 border-red-400/40'
              }`}>
                <AlertCircle size={20} className={emailExistsError ? 'text-blue-300 flex-shrink-0 mt-0.5' : 'text-red-300 flex-shrink-0 mt-0.5'} />
                <div className={`text-sm flex-1 ${emailExistsError ? 'text-blue-200' : 'text-red-200'}`}>
                  <p className="font-medium">{error}</p>
                  {emailExistsError && (
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-colors text-xs font-medium"
                    >
                      <LogIn size={14} />
                      Go to Sign In
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Name Field (Optional) */}
            <div className="group">
              <label htmlFor="name" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-slate-500 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-200" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/40 border border-purple-600/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 hover:border-purple-600/60 hover:bg-slate-900/50"
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="group">
              <label htmlFor="username" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Username</span>
                {validations.username && <CheckCircle size={16} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <UserPlus className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.username ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="cybersec_pro"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/40 border transition-all duration-300 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 hover:border-purple-600/60 hover:bg-slate-900/50 ${
                    validations.username 
                      ? 'border-emerald-500/50 focus:border-emerald-400/70 focus:ring-emerald-400/30' 
                      : 'border-purple-600/40 focus:border-purple-400/70 focus:ring-purple-400/30'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2.5 pl-1">3+ characters, letters, numbers, and underscores only</p>
              {formData.username && !validations.username && focusedField !== 'username' && (
                <p className="text-xs text-red-400 mt-1 pl-1">✗ Invalid username format</p>
              )}
            </div>

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Email Address</span>
                {validations.email && <CheckCircle size={16} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.email ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
              {formData.email && !validations.email && focusedField !== 'email' && (
                <p className="text-xs text-red-400 mt-1 pl-1">✗ Invalid email address</p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Password</span>
                {validations.password && <CheckCircle size={16} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.password ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl bg-slate-900/40 border transition-all duration-300 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 hover:border-purple-600/60 hover:bg-slate-900/50 ${
                    validations.password 
                      ? 'border-emerald-500/50 focus:border-emerald-400/70 focus:ring-emerald-400/30' 
                      : 'border-purple-600/40 focus:border-purple-400/70 focus:ring-purple-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-2">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= strength.strength
                            ? strength.strength === 1
                              ? 'bg-red-500/80'
                              : strength.strength === 2
                              ? 'bg-yellow-500/80'
                              : 'bg-emerald-500/80'
                            : 'bg-slate-700/50'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium pl-1 ${
                    strength.strength === 3 ? 'text-emerald-400' : strength.strength === 2 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    Strength: {strength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-200 mb-3.5 group-focus-within:text-purple-300 transition-colors flex items-center justify-between">
                <span>Confirm Password</span>
                {validations.confirmPassword && <CheckCircle size={16} className="text-emerald-400" />}
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  validations.confirmPassword ? 'text-emerald-400' : 'text-slate-500 group-focus-within:text-purple-400'
                }`} size={18} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Re-enter your password"
                  className={`w-full pl-12 pr-12 py-4 rounded-xl bg-slate-900/40 border transition-all duration-300 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 hover:border-purple-600/60 hover:bg-slate-900/50 ${
                    validations.confirmPassword 
                      ? 'border-emerald-500/50 focus:border-emerald-400/70 focus:ring-emerald-400/30' 
                      : 'border-purple-600/40 focus:border-purple-400/70 focus:ring-purple-400/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-medium">
                  <CheckCircle size={16} className="flex-shrink-0" />
                  <span>Passwords match perfectly</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {/* Submit Button - Premium */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-fuchsia-500/40 via-purple-500/35 to-violet-500/30 border border-fuchsia-400/50 text-fuchsia-100 hover:from-fuchsia-500/50 hover:via-purple-500/45 hover:to-violet-500/40 hover:border-fuchsia-300/70 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-400 font-bold flex items-center justify-center gap-2 mt-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400/0 via-white/8 to-cyan-400/0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-fuchsia-300 border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  <span>Create Account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-all duration-200 hover:drop-shadow-[0_0_8px_#8b5cf6]">
                Sign in here
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

