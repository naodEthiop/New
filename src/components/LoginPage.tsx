// LoginPage will be rebuilt with Radix UI-based authentication. Legacy code removed.
import React, { useState } from 'react';
import { setPersistence, browserLocalPersistence, browserSessionPersistence, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/config';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (mode === 'signup') {
      if (password.length < 6) setPasswordStrength('weak');
      else if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) setPasswordStrength('strong');
      else setPasswordStrength('medium');
    } else {
      setPasswordStrength('');
    }
  }, [password, mode]);

  React.useEffect(() => {
    if (successMessage && mode === 'login') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [successMessage, mode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (mode === 'login') {
        await authService.signInWithEmail(email, password);
        setSuccessMessage('🎉 Welcome back! You have logged in successfully.');
      } else {
        await authService.signUpWithEmail(email, password, displayName);
        if (auth.currentUser && !auth.currentUser.emailVerified) {
          await sendEmailVerification(auth.currentUser);
          setSuccessMessage('🎉 Sign up successful! Please check your email to verify your account.');
        } else {
          setSuccessMessage('🎉 Sign up successful!');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Authentication failed.');
      } else {
        setError('Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authService.sendPasswordResetEmail(resetEmail);
      setResetMessage('✅ Password reset email sent! Please check your inbox.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to send password reset email.');
      } else {
        setError('Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await authService.signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden game-cyberpunk flex items-center justify-center px-4 py-10">
      <div className="aurora-layer"></div>
      <div className="glow-orb left-[-60px] top-[120px]"></div>
      <div className="glow-orb right-[-80px] bottom-[160px]"></div>
      <div className="starfield"></div>
      <div className="holo-grid"></div>
      <div className="vignette"></div>
      <div className="noise"></div>

      <div className="w-full max-w-md panel-cyber rounded-2xl p-6 sm:p-8 shadow-lg relative z-10">
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🎮</div>
          <h1 className="text-3xl font-extrabold mb-2 brand-gradient">Bingo Platform</h1>
          <p className="text-slate-300 text-sm">Sign in to continue</p>
          <div className="flex justify-center mt-4 mb-2 bg-white/10 rounded-lg p-1 w-full">
            <button
              className={`px-4 py-2 rounded-md font-semibold transition-all ${mode === 'login' ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white shadow-[0_0_18px_rgba(0,255,240,0.35)]' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Login
            </button>
            <button
              className={`ml-2 px-4 py-2 rounded-md font-semibold transition-all ${mode === 'signup' ? 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white shadow-[0_0_18px_rgba(0,255,240,0.35)]' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              onClick={() => setMode('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 text-emerald-300 text-sm text-center">
            {successMessage}
          </div>
        )}
        {resetMessage && (
          <div className="mb-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-3 text-emerald-300 text-sm text-center">
            {resetMessage}
          </div>
        )}
        {!showReset ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="input-modern"
                required
                disabled={loading}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-modern"
              required
              disabled={loading}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-modern pr-12"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {mode === 'signup' && password && (
              <div className="mb-2">
                <div className={`h-2 rounded-full ${passwordStrength === 'weak' ? 'bg-red-400 w-1/3' : passwordStrength === 'medium' ? 'bg-yellow-400 w-2/3' : passwordStrength === 'strong' ? 'bg-green-500 w-full' : ''}`}></div>
                <div className="text-xs mt-1 text-white/70">
                  {passwordStrength === 'weak' && 'Password is too weak'}
                  {passwordStrength === 'medium' && 'Password is okay, but could be stronger'}
                  {passwordStrength === 'strong' && 'Great password!'}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-white/80 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="mr-2 accent-cyan-500"
                  disabled={loading}
                />
                Remember Me
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-cyan-300 hover:underline text-sm"
                  onClick={() => { setShowReset(true); setResetEmail(email); setResetMessage(null); setError(null); setSuccessMessage(null); }}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <button
              type="submit"
              className="w-full btn-modern"
              disabled={loading}
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Signing up...') : (mode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email to reset password"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="input-modern"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full btn-modern"
              disabled={loading}
            >
              {loading ? 'Sending reset email...' : 'Send Password Reset Email'}
            </button>
            <button
              type="button"
              className="w-full btn-secondary mt-2"
              onClick={() => setShowReset(false)}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-white/20" />
          <span className="mx-4 text-white/60 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-blue-700 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-100 transition-colors"
          disabled={loading}
        >
          <span className="text-lg">🔗</span> Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
