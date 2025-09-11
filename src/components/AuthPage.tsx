import React, { useState } from 'react';
import { setPersistence, browserLocalPersistence, browserSessionPersistence, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/config';
import { authService } from '../services/authService';

const AuthPage: React.FC = () => {
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

  // Password strength meter
  React.useEffect(() => {
    if (mode === 'signup') {
      if (password.length < 6) setPasswordStrength('weak');
      else if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) setPasswordStrength('strong');
      else setPasswordStrength('medium');
    } else {
      setPasswordStrength('');
    }
  }, [password, mode]);

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
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Bingo Game</h1>
          <div className="flex justify-center mb-4">
            <button
              className={`px-4 py-2 rounded-l-lg font-semibold ${mode === 'login' ? 'bg-white text-blue-700' : 'bg-blue-700 text-white'}`}
              onClick={() => setMode('login')}
              disabled={loading}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 rounded-r-lg font-semibold ${mode === 'signup' ? 'bg-white text-blue-700' : 'bg-blue-700 text-white'}`}
              onClick={() => setMode('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
            {successMessage}
          </div>
        )}
        {resetMessage && (
          <div className="mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm text-center">
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
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={loading}
              />
            )}
                <input
                  type="email"
              placeholder="Email"
                  value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={loading}
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                  disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                tabIndex={-1}
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
                  className="mr-2 accent-blue-600"
                  disabled={loading}
                />
                Remember Me
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="text-blue-300 hover:underline text-sm"
                  onClick={() => { setShowReset(true); setResetEmail(email); setResetMessage(null); setError(null); setSuccessMessage(null); }}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              )}
            </div>
              <button
                type="submit"
              className="w-full py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                disabled={loading}
            >
              {loading ? 'Sending reset email...' : 'Send Password Reset Email'}
            </button>
            <button
              type="button"
              className="w-full py-2 rounded-lg font-bold bg-slate-700 text-white hover:bg-slate-800 transition-colors mt-2"
              onClick={() => setShowReset(false)}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-white/30" />
          <span className="mx-4 text-white/60 text-sm">OR</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-lg font-bold bg-white text-blue-700 flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{loading ? 'Please wait...' : 'Continue with Google'}</span>
        </button>
      </div>
    </div>
  );
};

export default AuthPage;