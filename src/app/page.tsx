'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';
import FeedbackFormModal from '@/components/FeedbackFormModal';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


  
  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  

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

  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      // GSAP animations - fallback to CSS if GSAP not available
      const animateElements = () => {
        // Floating elements animation
        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.animation = `float-${index % 3} ${3 + index * 0.5}s infinite ease-in-out`;
            ref.style.animationDelay = `${index * 0.2}s`;
          }
        });

        // Hero elements animation
        if (titleRef.current) {
          titleRef.current.style.animation = 'fadeInUp 1.2s ease-out';
        }
        if (subtitleRef.current) {
          subtitleRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.6s both';
        }
        if (buttonsRef.current) {
          buttonsRef.current.style.animation = 'fadeInUp 0.8s ease-out 1s both';
        }
        if (featuresRef.current) {
          featuresRef.current.style.animation = 'fadeInUp 0.8s ease-out 1.5s both';
        }
        if (statsRef.current) {
          statsRef.current.style.animation = 'fadeInScale 1s ease-out 2s both';
        }
      };

      animateElements();
    }
  }, [loading]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-b-pink-400 border-l-yellow-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
  <div
    ref={(el) => {
      floatingRefs.current[0] = el;
    }}
    className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
  />
  <div
    ref={(el) => {
      floatingRefs.current[1] = el;
    }}
    className="absolute top-1/3 right-20 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
  />
  <div
    ref={(el) => {
      floatingRefs.current[2] = el;
    }}
    className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
  />
  {[...Array(20)].map((_, i) => (
    <div
      key={i}
      ref={(el) => {
        floatingRefs.current[i + 3] = el;
      }}
      className="absolute w-1 h-1 bg-white/30 rounded-full"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ))}
</div>


      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
             Rizz or Risk
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAuthModal(true)}
            className="group relative overflow-hidden rounded-xl font-bold transition-all duration-300 hover:scale-105 mt-1 -ml-2"
          >
            <span className="relative z-10">{user ? '' : '🔑 Sign In'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          {user && (
            <div className="flex space-x-4">
              <Link href="/analyze" className="nav-link mt-3">
                📝 analyze
              </Link>
              <Link href="/red-or-green" className="nav-link mt-3">
                🎮 swipe
              </Link>
              <Link href="/dashboard" className="nav-link mt-3">
                📊 dashboard
              </Link>
              <button
                onClick={signOut}
                className="nav-link hover:text-red-400 mt-1 "
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div ref={heroRef} className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Hero Section */}
        <div ref={titleRef} className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent glitch-effect">
              Rizz
            </span>
            <span className="text-white mx-4">or</span>
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent glitch-effect">
              Risk?
            </span>
          </h1>
          <div className="text-4xl md:text-6xl animate-bounce">💕</div>
        </div>

        <div ref={subtitleRef} className="text-center mb-12 max-w-3xl">
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
            AI-powered vibe check for your situationship! 🤔
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
              Are you smooth with the rizz or just deep in delulu?
            </span>
          </p>
          <p className="text-lg text-gray-400 mt-4">
            Swipe on red & green flags and let AI drop the truth! 🚩✅
          </p>
        </div>

        {!user ? (
          /* Sign In Section */
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 mb-16">
            <button
              onClick={() => setShowAuthModal(true)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Vibe Check ✨
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <p className="text-gray-400 text-center mt-4">
              sign in to collect badges and flex your delulu stats 📊
            </p>
          </div>
        ) : (
          /* User Dashboard */
          <div ref={buttonsRef} className="space-y-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-4">
                what's the <span className="text-purple-400">vibe check</span> today?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Link href="/analyze">
                <div className="feature-card group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📱</div>
                  <h3 className="text-2xl font-black text-white mb-4">analyze texts</h3>
                  <p className="text-gray-400 mb-6">
                    drop that screenshot and let AI destroy your delusions fr 💀
                  </p>
                  <div className="text-cyan-400 font-bold group-hover:text-white transition-colors">
                    expose me →
                  </div>
                </div>
              </Link>
              <Link href="/red-or-green">
                <div className="feature-card group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
                  <h3 className="text-2xl font-black text-white mb-4">swipe challenge</h3>
                  <p className="text-gray-400 mb-6">
                    test your dating choices and get rated by AI no cap 🧢
                  </p>
                  <div className="text-purple-400 font-bold group-hover:text-white transition-colors">
                    rate my choices →
                  </div>
                </div>
              </Link>
            </div>
            <div className="text-center">
              <p className="text-gray-400 mb-6 text-lg">
                ready to see your <span className="text-pink-400 font-bold">delulu journey</span>?
              </p>
              <Link href="/dashboard">
                <div className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full font-black text-lg hover:scale-105 transition-transform duration-200 glow-effect">
                  📊 my delulu stats
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              10K+
            </div>
            <div className="text-gray-400 text-sm md:text-base">Vibes Checked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              95%
            </div>
            <div className="text-gray-400 text-sm md:text-base">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-gray-400 text-sm md:text-base">AI Support</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div ref={featuresRef} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-20">
        <FeatureCard
          icon="⭐"
          title="Delulu Detector"
          description="AI analyzes your situation and tells you if you're being realistic or just delulu fr 💀"
          gradient="from-purple-500 to-pink-500"
        />
        <FeatureCard
          icon="⚡"
          title="Flag Scanner"
          description="Swipe left or right to know if you're into red flags or green flags🚩✅"
          gradient="from-cyan-500 to-blue-500"
        />
        <FeatureCard
          icon="💖"
          title="Delulu Badges"
          description="Let your friends know about your delulu level through our shareable badges based on your analyzed scenarios📈"
          gradient="from-pink-500 to-red-500"
        />
        <FeatureCard
          icon="✅"
          title="Track your previous delulu scenarios"
          description="Learn from your past and maybe don’t do that again 💀"
          gradient="from-indigo-500 to-purple-500"
        />
        <FeatureCard
          icon="🛡️"
          title="Privacy First"
          description="Your business stays your business - encrypted & secure 🔒"
          gradient="from-yellow-500 to-orange-500"
        />
      <FeatureCard
        icon="🌐"
        title="Let us know what you think of Rizz OR Risk"
        description={
          <>
            Feedback, compliments, constructive roasts — all welcome. Drop them{' '}
            <span
              onClick={() => setIsModalOpen(true)}
              className="underline cursor-pointer text-fuchsia-600"
            >
              here!
            </span>
          </>
        }
        gradient="from-lime-400 to-fuchsia-500"
      />

      <FeedbackFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-12 border-t border-gray-800/50">
        <p className="text-gray-500 font-mono text-sm">no cap, this AI knows your vibe fr 💯</p>
        <p className="text-gray-600 text-xs mt-2">© 2025 rizzORrisk.ai - by Anusha Tomar</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.5) rotate(-180deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
          66% { transform: translateY(-10px) translateX(-5px) rotate(-2deg); }
        }

        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-15px) translateX(-10px) rotate(-5deg); }
          66% { transform: translateY(-25px) translateX(5px) rotate(3deg); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-30px) translateX(15px) rotate(8deg); }
          66% { transform: translateY(-5px) translateX(-10px) rotate(-4deg); }
        }

        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff; }
          25% { text-shadow: -2px 0 5px #ff00ff, 2px 0 10px #ff00ff, 0 0 15px #ff00ff; }
          50% { text-shadow: 2px 0 5px #ffff00, -2px 0 10px #ffff00, 0 0 15px #ffff00; }
          75% { text-shadow: 0 -2px 5px #00ff00, 0 2px 10px #00ff00, 0 0 15px #00ff00; }
        }

        .glitch-effect:hover {
          animation: glitch 0.5s infinite;
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .glow-effect:hover {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .nav-link {
          color: white;
          font-weight: 600;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          text-transform: lowercase;
        }

        .nav-link:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #a855f7;
        }

        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => {
  return (
    <div className="group relative cursor-pointer">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300`} />
      <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-6 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4 text-3xl`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};