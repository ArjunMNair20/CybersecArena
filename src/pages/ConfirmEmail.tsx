import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
          const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
          if (session) {
            setStatus('success');
            setMessage('Your email has been confirmed! Redirecting...');
            setTimeout(() => navigate('/'), 2000);
            return;
          }
          throw new Error('No confirmation token found');
        }

        if (!supabase) {
          throw new Error('Supabase is not configured');
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Email confirmed successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
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
              <h2 className="text-2xl font-bold text-cyan-300 mb-2">Confirming Email</h2>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-300 mb-2">Email Confirmed!</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium"
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-300 mb-2">Confirmation Failed</h2>
              <p className="text-slate-400 mb-6">{message}</p>
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
                  Sign Up Again
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





