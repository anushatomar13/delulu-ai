'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShareableBadge from '@/components/ShareableBadge';

interface StoredResponse {
  scenario: string;
  classification: string;
  message: string;
  emotions: { label: string; score: number }[];
  timestamp: string;
  gameData?: {
    swipeResults?: any[];
    deluluRating?: number;
  };
}

const milestones = [
  { threshold: 3, name: "delulu debut", description: "first steps into the chaos", emoji: "🎭" },
  { threshold: 5, name: "rizz rookie", description: "learning the game fr", emoji: "📱" },
  { threshold: 10, name: "certified delusionist", description: "oh, and you've earned some badges, do let your friends know about your delulu levels!", emoji: "🏆" },
  { threshold: 20, name: "risk master", description: "consistency is key", emoji: "⚡" },
  { threshold: 50, name: "reality challenger", description: "living in your own world", emoji: "🌟" },
  { threshold: 100, name: "grand delusion", description: "ultimate main character energy", emoji: "👑" }
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const achievedMilestones = milestones
    .filter(m => responses.length >= m.threshold)
    .sort((a, b) => b.threshold - a.threshold);

  const redFlags = responses.filter(r => r.classification.includes('Red Flag') || r.classification.includes('delulu risk')).length;
  const greenFlags = responses.filter(r => r.classification.includes('Green Flag') || r.classification.includes('valid rizz')).length;
  const swipeGames = responses.filter(r => r.gameData?.swipeResults).length;
  const avgDeluluRating = responses
    .filter(r => r.gameData?.deluluRating)
    .reduce((acc, r) => acc + (r.gameData?.deluluRating || 0), 0) / Math.max(1, swipeGames);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
      await fetchResponses(user.id);
    };

    getUser();
  }, [supabase, router]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const animateElements = () => {
        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.animation = `float-${index % 3} ${3 + index * 0.5}s infinite ease-in-out`;
            ref.style.animationDelay = `${index * 0.2}s`;
          }
        });

        if (headerRef.current) {
          headerRef.current.style.animation = 'fadeInUp 0.8s ease-out';
        }
        if (statsRef.current) {
          statsRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.2s both';
        }
        if (milestonesRef.current) {
          milestonesRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.4s both';
        }
        if (historyRef.current) {
          historyRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.6s both';
        }
      };
      animateElements();
    }
  }, [user, loading]);

  const fetchResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('responses')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'P2025' && error.code !== 'PGRST116') {
        console.error('Error fetching responses:', error);
        setLoading(false);
        return;
      }

      if (data?.responses) {
        const parsedResponses = typeof data.responses === 'string' 
          ? JSON.parse(data.responses) 
          : data.responses;
        setResponses(parsedResponses.reverse());
      }
    } catch (err) {
      console.error('Error parsing responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: { [key: string]: string } = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😨',
      disgust: '🤢',
      surprise: '😲',
      love: '🥰',
      neutral: '😐',
      'swipe-analysis': '🎮'
    };
    return emojiMap[emotion] || '😐';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeluluLevel = (rating: number) => {
    if (rating <= 2) return { emoji: '😇', text: 'saint energy', color: 'text-green-400' };
    if (rating <= 4) return { emoji: '😊', text: 'realistic bestie', color: 'text-blue-400' };
    if (rating <= 6) return { emoji: '🤔', text: 'kinda sus', color: 'text-yellow-400' };
    if (rating <= 8) return { emoji: '🤡', text: 'delulu fr', color: 'text-orange-400' };
    return { emoji: '🚨', text: 'MAXIMUM DELULU', color: 'text-red-400' };
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

  if (!user) {
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
      <div className="absolute inset-0 overflow-hidden">
        <div
ref={(el) => {
  floatingRefs.current[0] = el;
}}
          className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <div
ref={(el) => {
  floatingRefs.current[0] = el;
}}
          className="absolute top-1/3 right-20 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
        />
        <div
ref={(el) => {
  floatingRefs.current[0] = el;
}}
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
        />
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
ref={(el) => {
  floatingRefs.current[0] = el;
}}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <nav className="relative z-50 flex items-center justify-between p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <Link href="/" className="nav-link flex items-center gap-2 hover:text-purple-400">
          <span>←</span>
          <span>back home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-md opacity-50" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            delulu dashboard
          </span>
        </div>
        
      </nav>

      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-12">
        <div ref={headerRef} className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent glitch-effect">
              your
            </span>
            <span className="text-white mx-3">delulu</span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent glitch-effect">
              stats
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            have a look at past scenarios you analyzed along with the results
          </p>
        </div>

        <div ref={statsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-white mb-2">{responses.length}</div>
              <p className="text-gray-400 font-bold text-sm">total scenarios analyzed</p>
              <div className="text-2xl mt-2">🎭</div>
            </div>
          </div>
          
          <div className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-red-400 mb-2">{redFlags}</div>
              <p className="text-gray-400 font-bold text-sm">delulu moments</p>
              <div className="text-2xl mt-2">🚨</div>
            </div>
          </div>
          
          <div className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
              <div className="text-4xl font-black text-green-400 mb-2">{greenFlags}</div>
              <p className="text-gray-400 font-bold text-sm">valid rizz</p>
              <div className="text-2xl mt-2">✅</div>
            </div>
          </div>

          <div className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center">
              <div className={`text-4xl font-black mb-2 ${avgDeluluRating ? getDeluluLevel(avgDeluluRating).color : 'text-gray-400'}`}>
                {avgDeluluRating ? Math.round(avgDeluluRating) : 0}/10
              </div>
              <p className="text-gray-400 font-bold text-sm">avg delulu rating</p>
              <div className="text-2xl mt-2">{avgDeluluRating ? getDeluluLevel(avgDeluluRating).emoji : '🤷‍♀️'}</div>
            </div>
          </div>
        </div>

        {responses.length > 0 && (
          <div ref={milestonesRef} className="feature-card group mb-12">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-300" />
            <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-12">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-black text-white mb-2">milestone unlocked</h3>
                <p className="text-gray-400 font-medium">your delulu journey achievements</p>
              </div>

              {achievedMilestones.length > 0 && (
                <>
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8 text-center">
                    <div className="text-5xl mb-4">{achievedMilestones[0].emoji}</div>
                    <h4 className="text-2xl font-black text-white mb-2">{achievedMilestones[0].name}</h4>
                    <p className="text-gray-400 font-medium mb-4">{achievedMilestones[0].description}</p>
                    <div className="bg-purple-500/20 rounded-xl px-6 py-3 inline-block">
                      <span className="text-purple-300 font-bold">{responses.length} scenarios analyzed</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {achievedMilestones.map((milestone, index) => (
                      <div key={milestone.threshold} className="feature-card group">
                        <ShareableBadge
                          responseCount={responses.length}
                          redFlags={redFlags}
                          greenFlags={greenFlags}
                          badgeName={milestone.name}
                          badgeDescription={milestone.description}
                          showStats={true}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        <div ref={historyRef} className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                delulu history
              </span>
            </h2>
            <p className="text-gray-400 font-medium">all the scenarios you analyzed</p>
          </div>
          
          {responses.length === 0 ? (
            <div className="feature-card group max-w-2xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-16 text-center">
                <div className="text-8xl mb-6">🤷‍♀️</div>
                <h3 className="text-2xl font-black text-white mb-4">no delulu moments yet bestie</h3>
                <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                  start analyzing your crush scenarios or play the swipe game
                  <br />
                  to see your chaotic takes here
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/analyze">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all duration-200 text-center">
                      analyze scenarios 🎭
                    </div>
                  </Link>
                  <Link href="/red-or-green">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all duration-200 text-center">
                      play swipe game 🎮
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {responses.map((response, index) => (
                <div key={index} className="feature-card group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-300" />
                  <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`text-xl font-black ${
                            response.classification.includes('Red Flag') || response.classification.includes('delulu risk') 
                              ? 'text-red-400' 
                              : response.classification.includes('Green Flag') || response.classification.includes('valid rizz')
                              ? 'text-green-400'
                              : 'text-white'
                          }`}>
                            {response.classification}
                          </div>
                          {response.gameData?.deluluRating && (
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getDeluluLevel(response.gameData.deluluRating).color} bg-gray-800/50 border border-gray-700`}>
                              {response.gameData.deluluRating}/10 delulu
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                          {formatDate(response.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 mb-6">
                      <p className="text-gray-300 text-sm font-bold mb-2">scenario:</p>
                      <p className="text-white leading-relaxed">
                        {response.scenario.length > 200 
                          ? `${response.scenario.substring(0, 200)}...` 
                          : response.scenario}
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 mb-6">
                      <p className="text-gray-300 text-sm font-bold mb-2">ai roast:</p>
                      <p className="text-white leading-relaxed">{response.message}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {response.emotions.slice(0, 4).map((emotion, emotionIndex) => (
                        <div key={emotionIndex} className="flex items-center gap-2 bg-gray-800/40 border border-gray-700 rounded-full px-4 py-2">
                          <span className="text-lg">{getEmotionEmoji(emotion.label)}</span>
                          <span className="text-white text-sm font-bold capitalize">{emotion.label}</span>
                          <span className="text-gray-400 text-sm font-bold">
                            {Math.round(emotion.score * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {responses.length > 0 && responses.length < 10 && (
          <div className="text-center mt-16">
            <div className="feature-card group max-w-2xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-black text-white mb-4">
                  keep the delulu energy going!
                </h3>
                <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                  analyze {Math.min(10 - responses.length, 5)} more scenario{Math.min(10 - responses.length, 5) > 1 ? 's' : ''} to unlock more achievements
                  <br />
                  and see how delusional you really are fr 💀
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/analyze">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all duration-200 text-center">
                      analyze more scenarios 🎭
                    </div>
                  </Link>
                  <Link href="/red-or-green">
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all duration-200 text-center">
                      play swipe game 🎮
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

        .feature-card {
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .nav-link {
          color: white;
          font-weight: 600;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          text-transform: lowercase;
          font-size: 0.9rem;
        }

        .nav-link:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
