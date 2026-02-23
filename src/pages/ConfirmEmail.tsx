import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get token and type from URL
        const token = searchParams.get('token_hash');
        const type = searchParams.get('type') || 'signup';

        if (!token) {
          // Check if user is already confirmed
          const s = await getSupabase();
          if (s) {
            const { data: { session } } = await s.auth.getSession();
            if (session) {
              setStatus('success');
              setMessage('Your email has been confirmed! Redirecting to dashboard...');
              setTimeout(() => navigate('/dashboard'), 2000);
              return;
            }
          }
          throw new Error('No confirmation token found');
        }

        const s = await getSupabase();
        if (!s) {
          throw new Error('Supabase is not configured');
        }

        // Verify the email
        const { error } = await s.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          throw error;
        }

        // Check if user is now signed in after verification
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setStatus('success');
          setMessage('Email confirmed successfully! Please log in.');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email. The link may have expired.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{ background: 'radial-gradient(circle at 20% 10%, #08f7fe 0%, transparent 25%), radial-gradient(circle at 80% 30%, #f608f7 0%, transparent 25%)' }} />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="text-cyan-400 drop-shadow-[0_0_8px_#08f7fe]" size={48} />
            <div className="font-extrabold tracking-wide text-3xl">
              <span className="text-cyan-400">CyberSec</span> <span className="text-fuchsia-400">Arena</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-800 rounded-lg p-8 bg-gradient-to-br from-white/[0.03] to-white/[0.01] shadow-[0_0_30px_rgba(8,247,254,0.1)] text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-cyan-300 mb-2">Verifying Your Email</h2>
              <p className="text-slate-400">{message}</p>
              <div className="mt-6 text-sm text-slate-500">
                Please wait while we confirm your email address...
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              </div>
              <h2 className="text-3xl font-bold text-green-300 mb-2">✓ Email Confirmed</h2>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <p className="text-slate-300 mb-2 font-medium">Great news! Your email has been successfully verified.</p>
                <p className="text-green-300 text-lg font-semibold mb-4">Welcome to Cybersec Arena! 🎯</p>
                <p className="text-slate-400 text-sm">You can now log in and start your cybersecurity training journey.</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 border border-cyan-400/50 text-white hover:from-cyan-600 hover:to-cyan-700 transition-all font-bold shadow-lg hover:shadow-cyan-500/30"
                >
                  Continue to Login
                </button>
                <p className="text-xs text-slate-500 mt-3">You will be redirected automatically in a few seconds...</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <h2 className="text-2xl font-bold text-red-300 mb-2">Confirmation Failed</h2>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-slate-300 mb-2">{message}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full px-6 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                >
                  Try Signing Up Again
                </button>
              </div>
            </>
          )}
        </div>

        {status === 'error' && (
          <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <Mail className="text-slate-400 mt-0.5" size={20} />
              <div className="text-left">
                <p className="text-sm text-slate-300 font-medium mb-1">Need help?</p>
                <p className="text-xs text-slate-500">
                  If your confirmation link has expired, you can request a new one from the login page or sign up again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





