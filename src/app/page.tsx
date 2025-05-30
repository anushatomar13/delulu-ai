'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error('Error signing in:', error);
        setSigningIn(false);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
      {/* Navigation */}
      {user && (
        <nav className="p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-4">
              <Link href="/analyze" className="text-white hover:text-gray-200 font-semibold">
                📝 Analyze Text
              </Link>
              <Link href="/swipe" className="text-white hover:text-gray-200 font-semibold">
                🎮 Swipe Game
              </Link>
              <Link href="/dashboard" className="text-white hover:text-gray-200 font-semibold">
                📊 Dashboard
              </Link>
            </div>
            <button
              onClick={signOut}
              className="text-white hover:text-gray-200 text-sm"
            >
              Sign Out
            </button>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-pulse">
              🌀 Rizz or Risk
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Are you reading the signs right, or are you just being delusional? 
              <br />
              Let AI judge your dating scenarios and swipe choices!
            </p>
          </div>

          {!user ? (
            /* Sign In Section */
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Ready to discover your delulu level?
              </h2>
              <button
                onClick={signInWithGoogle}
                disabled={signingIn}
                className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
              >
                {signingIn ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
              <p className="text-white/70 text-sm mt-4">
                Sign in to save your results and unlock shareable badges!
              </p>
            </div>
          ) : (
            /* User Dashboard */
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Welcome back! What's your delulu mood today?
                </h2>
                
                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Analyze Text Card */}
                  <Link href="/analyze">
                    <div className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all transform hover:scale-105 cursor-pointer">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-xl font-bold text-white mb-2">Analyze Text</h3>
                      <p className="text-white/80 text-sm">
                        Paste a scenario or upload a screenshot and get an AI judgment on how delusional you're being
                      </p>
                      <div className="mt-4 text-purple-200 font-semibold">
                        Start Analyzing →
                      </div>
                    </div>
                  </Link>
                  
                  {/* Swipe Game Card */}
                  <Link href="/red-or-green">
                    <div className="bg-white/10 hover:bg-white/20 rounded-xl p-6 transition-all transform hover:scale-105 cursor-pointer">
                      <div className="text-4xl mb-4">🎮</div>
                      <h3 className="text-xl font-bold text-white mb-2">Swipe Challenge</h3>
                      <p className="text-white/80 text-sm">
                        Swipe through dating scenarios and get your delulu rating based on your choices
                      </p>
                      <div className="mt-4 text-purple-200 font-semibold">
                        Start Swiping →
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Quick Dashboard Link */}
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 text-center">
                <p className="text-white/80 mb-4">
                  Ready to see your delulu journey?
                </p>
                <Link href="/dashboard">
                  <div className="inline-block bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                    📊 View Your Dashboard
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-white/70 text-sm">
                Advanced AI analyzes your scenarios and gives brutally honest feedback
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold text-white mb-2">Unlock Badges</h3>
              <p className="text-white/70 text-sm">
                Get shareable badges after every 3 analyses to flex your delulu level
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Progress</h3>
              <p className="text-white/70 text-sm">
                View your complete analysis history and see how delusional you really are
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-white/50 text-sm">
              Made with 💖 and a healthy dose of delusion
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}