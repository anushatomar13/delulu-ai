// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🌀 Rizz or Risk
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Find out if your crush scenarios are realistic or just pure delulu! 
            AI-powered analysis to keep your expectations in check 💅
          </p>
        </div>

        {/* Auth Section */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-12">
          {user ? (
            <div className="text-center space-y-4">
              <div className="text-white">
                <p className="text-lg">Welcome back! 👋</p>
                <p className="text-sm opacity-75">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-white text-lg mb-4">Ready to face the truth?</p>
              <button
                onClick={handleSignIn}
                className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>

        {/* Features Section */}
        {user && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/analyze">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer group">
                <div className="text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Analyze</h3>
                  <p className="text-white/80">
                    Drop your crush scenario and get the brutal truth. 
                    Is it rizz or just wishful thinking?
                  </p>
                  <div className="mt-6 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg group-hover:bg-gray-100 transition-colors">
                    Start Analysis →
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer group">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Dashboard</h3>
                  <p className="text-white/80">
                    View your delulu history and unlock shareable badges 
                    based on your analysis count.
                  </p>
                  <div className="mt-6 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg group-hover:bg-gray-100 transition-colors">
                    View Dashboard →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-white/60">
          <p>Built with AI to save you from embarrassing yourself 🤖✨</p>
        </div>
      </div>
    </div>
  );
}