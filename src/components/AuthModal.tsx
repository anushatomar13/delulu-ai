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
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        
        if (data?.user && !data.session) {
          // Email confirmation required
          setSuccessMessage('Check your email for a confirmation link!');
          // Reset form
          setEmail('');
          setPassword('');
        } else if (data?.session) {
          // Auto sign-in happened
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

  // Reset state when modal opens/closes
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
      {/* Blurred Background */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleClose}></div>
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white/90 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={loading}
                minLength={6}
              />
              {mode === 'signup' && (
                <p className="text-gray-500 text-xs mt-1">Password must be at least 6 characters</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setSuccessMessage('');
              }}
              className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              disabled={loading}
            >
              {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full text-gray-500 hover:text-gray-700 font-medium transition-colors"
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