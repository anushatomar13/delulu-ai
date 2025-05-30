'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data?.user && !data.session) {
          setSuccessMessage('Check your email for a confirmation link!');
          setEmail('');
          setPassword('');
        } else if (data?.session) {
          setSuccessMessage('Account created successfully!');
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={handleClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/60 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_20px_rgba(128,0,255,0.3)] transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-extrabold text-purple-300 mb-6 text-center tracking-wide drop-shadow-md">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="bg-red-600/20 border border-red-400 text-red-300 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-600/20 border border-green-400 text-green-300 px-4 py-3 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
                minLength={6}
              />
              {mode === 'signup' && (
                <p className="text-gray-400 text-xs mt-1">Minimum 6 characters</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-700/40"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccessMessage('');
              }}
              className="text-purple-400 hover:text-purple-200 font-medium transition duration-300"
              disabled={loading}
            >
              {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={handleClose}
              className="w-full text-gray-400 hover:text-white font-medium transition duration-300"
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
