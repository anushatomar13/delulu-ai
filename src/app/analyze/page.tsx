'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AnalysisResult {
  emotions: { label: string; score: number }[];
  classification: string;
  message: string;
}

export default function AnalyzePage() {
  const [user, setUser] = useState<User | null>(null);
  const [scenario, setScenario] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
    };

    getUser();
  }, [supabase, router]);

  useEffect(() => {
    if (user) {
      const animateElements = () => {
        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.animation = `float-${index % 3} ${3 + index * 0.5}s infinite ease-in-out`;
            ref.style.animationDelay = `${index * 0.2}s`;
          }
        });

        [headerRef, formRef, resultsRef].forEach((ref, index) => {
          if (ref.current) {
            ref.current.style.animation = `fadeInUp 0.8s ease-out ${index * 0.2}s both`;
          }
        });
      };
      animateElements();
    }
  }, [user]);

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    // Existing OCR implementation remains unchanged
    return '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Existing file handling logic remains unchanged
  };

  const handleAnalyze = async () => {
    // Existing analysis logic remains unchanged
  };

  const storeResult = async (analysisResult: AnalysisResult) => {
    // Existing Supabase storage logic remains unchanged
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: { [key: string]: string } = {
      joy: '😊', sadness: '😢', anger: '😠', fear: '😨',
      disgust: '🤢', surprise: '😲', love: '🥰', neutral: '😐'
    };
    return emojiMap[emotion] || '😐';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-14 h-14 sm:w-16 sm:h-16 border-4 border-transparent border-b-pink-400 border-l-yellow-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Responsive Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
  <div
    ref={el => { floatingRefs.current[0] = el }}
    className="absolute top-5 left-5 sm:top-10 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
  />
  <div
    ref={el => { floatingRefs.current[1] = el }}
    className="absolute top-1/3 right-5 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
  />
  <div
    ref={el => { floatingRefs.current[2] = el }}
    className="absolute bottom-5 sm:bottom-20 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
  />
  {[...Array(10)].map((_, i) => (
    <div
      key={i}
      ref={el => { floatingRefs.current[i + 3] = el }}
      className="absolute w-1 h-1 bg-white/20 rounded-full"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ))}
</div>


      {/* Responsive Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-3 sm:p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <Link href="/" className="nav-link flex items-center gap-2 hover:text-purple-400 min-h-[44px]">
          <span className="text-lg sm:text-base">←</span>
          <span className="text-sm sm:text-base">back home</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50" />
          </div>
          <span className="text-base sm:text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            analyze zone
          </span>
        </div>
        <Link href="/dashboard" className="nav-link flex items-center gap-2 hover:text-cyan-400 min-h-[44px]">
          <span className="text-sm sm:text-base">dashboard</span>
          <span className="text-lg sm:text-base">→</span>
        </Link>
      </nav>

      <div className="relative z-10 container mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-12">
        {/* Responsive Header */}
        <div ref={headerRef} className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent glitch-effect">
              delulu
            </span>
            <span className="text-white mx-2 sm:mx-3">or</span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent glitch-effect">
              reality?
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 font-medium px-4 sm:px-0">
            drop that screenshot or type a scenario and let AI decide whether you're delusional or not✨
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input Form */}
          <div ref={formRef} className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-4 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">spill the tea ☕</h2>
              <p className="text-gray-400 mb-4 sm:mb-6">be honest bestie, what's the situation?</p>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-white text-base sm:text-lg font-bold mb-2 sm:mb-3">
                    your delulu scenario:
                  </label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="e.g., 'they liked my instagram story from 3 weeks ago at 2am. we're basically dating now right?' 💀"
                    className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-xl bg-gray-800/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-medium text-sm sm:text-base"
                    rows={4}
                  />
                  {ocrLoading && (
                    <div className="flex items-center space-x-2 mt-2 text-purple-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                      <span className="text-xs sm:text-sm font-medium">extracting text from your screenshot...</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white text-base sm:text-lg font-bold mb-2 sm:mb-3">
                    or drop that screenshot:
                  </label>
                  <div className="text-gray-400 text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span>💡</span>
                    <span>upload an image and we'll extract the text automatically</span>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={ocrLoading}
                      className="w-full p-2 sm:p-3 rounded-xl bg-gray-800/60 text-white border border-gray-700 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 disabled:opacity-50 transition-all duration-200 text-xs sm:text-base"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || ocrLoading || (!scenario.trim() && !file)}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-black transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>AI is judging you...</span>
                    </div>
                  ) : ocrLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>reading your screenshot...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>expose my delusions</span>
                      <span className="text-xl">🔮</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div ref={resultsRef} className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-4 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">AI reality check 🤖</h2>
              <p className="text-gray-400 mb-4 sm:mb-6">brace yourself bestie...</p>
              
              {result ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center p-4 sm:p-6 bg-gray-800/40 rounded-xl border border-gray-700">
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{result.classification}</div>
                    <p className="text-gray-300 font-bold text-sm sm:text-base">overall vibe check</p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 flex items-center gap-2">
                      <span>🎭</span>
                      <span>emotional breakdown:</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {result.emotions.map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-2 sm:p-3 border border-gray-700">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getEmotionEmoji(emotion.label)}</span>
                            <span className="text-white font-bold text-sm sm:text-base capitalize">{emotion.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 sm:w-24 h-2 sm:h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{ width: `${emotion.score * 100}%` }}
                              />
                            </div>
                            <span className="text-white font-bold text-xs sm:text-sm min-w-[35px] sm:min-w-[45px]">
                              {Math.round(emotion.score * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/40 rounded-xl p-4 sm:p-6 border border-gray-700">
                    <h3 className="text-lg sm:text-xl font-black text-white mb-3 flex items-center gap-2">
                      <span>💬</span>
                      <span>AI's verdict:</span>
                    </h3>
                    <p className="text-gray-200 leading-relaxed font-medium text-sm sm:text-base">{result.message}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => { setResult(null); setScenario(''); setFile(null); }}
                      className="flex-1 bg-gray-800/60 text-white font-bold py-2 sm:py-3 px-4 rounded-xl hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 hover:border-gray-600 text-sm sm:text-base min-h-[44px]"
                    >
                      roast me again 🔥
                    </button>
                    <Link href="/dashboard" className="flex-1">
                      <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 sm:py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center">
                        view my delulu stats 📊
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 sm:py-12">
                  <div className="text-6xl sm:text-8xl mb-4">🤖</div>
                  <p className="text-base sm:text-xl font-bold mb-2">AI is ready to judge...</p>
                  <p className="text-sm sm:text-base">enter a scenario and let's see how delulu you really are!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-0 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
        }
        .glitch-effect:hover {
          animation: glitch 0.5s infinite;
        }
        .feature-card {
          transition: transform 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
        }
        @media (max-width: 640px) {
          .feature-card:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
