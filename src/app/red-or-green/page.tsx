"use client";

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SwipeResult {
  cardId: number;
  scenario: string;
  choice: 'rizz' | 'risk';
}

interface AIJudgment {
  judgment: string;
  deluluRating: number;
}

const deluluScenarios = [
  "They liked your Instagram story from 2 months ago - they're definitely stalking you and planning your future together",
  "They didn't text back for 3 hours during work hours - clearly they're playing hard to get and testing your dedication",
  "They laughed at your joke in the group chat - this is obviously their way of flirting with you specifically",
  "They asked to borrow your notes - this is clearly an excuse to spend more time with you and get your number",
  "They said 'we should hang out sometime' - this is basically a marriage proposal in disguise",
  "They watched all your stories but didn't reply to your DM - they're obviously shy and waiting for you to make the first move",
  "They complimented your new haircut - they've been thinking about you all day and finally found an excuse to talk",
  "They didn't sit next to you in class today - they're trying to make you jealous and realize your feelings",
  "They liked your comment on their post - this is their subtle way of saying they're interested in you",
  "They remembered your coffee order - they're paying attention to every detail because they're falling for you",
  "They took 30 minutes to reply but usually reply in 5 - they're strategically timing their responses to seem mysterious",
  "They said your outfit looks nice - this is basically them saying they find you attractive and want to date you",
  "They didn't laugh at your joke - they're nervous around you because they have feelings and don't know how to act",
  "They follow you on social media but don't like your posts - they're trying to be cool and not seem too eager",
  "They asked if you're going to the party - they want to make sure you'll be there because they want to hang out with you"
];

export default function SwipePage() {
  const [user, setUser] = useState<User | null>(null);
  const [cardCount, setCardCount] = useState<number>(5);
  const [gameState, setGameState] = useState<'setup' | 'swiping' | 'results'>('setup');
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([]);
  const [aiJudgment, setAIJudgment] = useState<AIJudgment | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardAnimation, setCardAnimation] = useState<'left' | 'right' | null>(null);
  
  // GSAP refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLDivElement>(null);
  const swipingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

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
    if (user && typeof window !== 'undefined') {
      // GSAP animations - fallback to CSS if GSAP not available
      const animateElements = () => {
        // Floating elements animation
        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            ref.style.animation = `float-${index % 3} ${3 + index * 0.5}s infinite ease-in-out`;
            ref.style.animationDelay = `${index * 0.2}s`;
          }
        });

        // Page elements animation
        if (headerRef.current) {
          headerRef.current.style.animation = 'fadeInUp 0.8s ease-out';
        }
        if (setupRef.current) {
          setupRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.3s both';
        }
        if (swipingRef.current) {
          swipingRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.3s both';
        }
        if (resultsRef.current) {
          resultsRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.6s both';
        }
      };
      animateElements();
    }
  }, [user, gameState]);

  const startGame = () => {
    // Shuffle and select scenarios
    const shuffled = [...deluluScenarios].sort(() => Math.random() - 0.5);
    const selectedScenarios = shuffled.slice(0, cardCount);
    setScenarios(selectedScenarios);
    setGameState('swiping');
    setCurrentCardIndex(0);
    setSwipeResults([]);
  };

  const handleSwipe = (choice: 'rizz' | 'risk') => {
    const result: SwipeResult = {
      cardId: currentCardIndex,
      scenario: scenarios[currentCardIndex],
      choice
    };

    const newResults = [...swipeResults, result];
    setSwipeResults(newResults);
    
    // Animate card exit
    setCardAnimation(choice === 'rizz' ? 'right' : 'left');
    
    setTimeout(() => {
      if (currentCardIndex < scenarios.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setCardAnimation(null);
      } else {
        // All cards swiped, get AI judgment
        getAIJudgment(newResults);
      }
    }, 300);
  };

const getAIJudgment = async (results: SwipeResult[]) => {
  setGameState('results');
  setLoading(true);

  try {
    const response = await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        swipeResults: results, // Changed from gameData to swipeResults
        scenario: `Swipe Game Results: ${results.map(r => `${r.scenario} -> ${r.choice}`).join('\n')}` // Keep this for backward compatibility if needed
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get AI judgment: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the response has the expected structure
    if (data.error) {
      throw new Error(data.error);
    }

    const judgment: AIJudgment = {
      judgment: data.judgment || `bestie... you chose ${results.filter(r => r.choice === 'rizz').length} valid rizz moments and ${results.filter(r => r.choice === 'risk').length} delulu risks.`,
      deluluRating: data.deluluRating || Math.round((results.filter(r => r.choice === 'risk').length / results.length) * 10)
    };

    setAIJudgment(judgment);
    await saveToDatabase(judgment, results);

  } catch (error) {
    console.error('AI Judgment failed:', error);
    // Fallback judgment
    const rizzCount = results.filter(r => r.choice === 'rizz').length;
    const riskCount = results.filter(r => r.choice === 'risk').length;
    const deluluRating = Math.round((riskCount / results.length) * 10);

    const fallbackJudgment: AIJudgment = {
      judgment: `AI is being moody rn but here's the tea: you chose ${rizzCount} rizz and ${riskCount} delulu moments. ${deluluRating >= 7 ? 'bestie you need a reality check 💀' : 'you\'re not completely hopeless ✨'}`,
      deluluRating
    };

    setAIJudgment(fallbackJudgment);
  } finally {
    setLoading(false);
  }
};

  const saveToDatabase = async (judgment: AIJudgment, results: SwipeResult[]) => {
    if (!user) return;

    try {
      // First, get existing responses
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('responses')
        .eq('id', user.id)
        .single();

      let existingResponses = [];
      if (!fetchError && userData?.responses) {
        existingResponses = typeof userData.responses === 'string' 
          ? JSON.parse(userData.responses) 
          : userData.responses;
      }

      // Create new response object
      const newResponse = {
        scenario: `Swipe Game: ${results.length} cards (${results.filter(r => r.choice === 'rizz').length} Rizz, ${results.filter(r => r.choice === 'risk').length} Risk)`,
        classification: `🎮 Delulu Rating: ${judgment.deluluRating}/10`,
        message: judgment.judgment,
        emotions: [
          { label: "swipe-analysis", score: judgment.deluluRating / 10 }
        ],
        timestamp: new Date().toISOString(),
        gameData: {
          swipeResults: results,
          deluluRating: judgment.deluluRating
        }
      };

      // Add to existing responses
      const updatedResponses = [...existingResponses, newResponse];

      // Save back to database
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          responses: JSON.stringify(updatedResponses)
        });

      if (updateError) {
        console.error('Error saving to database:', updateError);
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentCardIndex(0);
    setSwipeResults([]);
    setAIJudgment(null);
    setCardAnimation(null);
  };

  const getDeluluLevel = (rating: number) => {
    if (rating <= 2) return { emoji: '😇', text: 'saint energy', color: 'text-green-400' };
    if (rating <= 4) return { emoji: '😊', text: 'realistic bestie', color: 'text-blue-400' };
    if (rating <= 6) return { emoji: '🤔', text: 'kinda sus', color: 'text-yellow-400' };
    if (rating <= 8) return { emoji: '🤡', text: 'delulu fr', color: 'text-orange-400' };
    return { emoji: '🚨', text: 'MAXIMUM DELULU', color: 'text-red-400' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-14 h-14 sm:w-16 sm:h-16 border-4 border-transparent border-b-pink-400 border-l-yellow-400 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
     <div className="absolute inset-0 overflow-hidden">
  <div
    ref={(el) => { floatingRefs.current[0] = el; }}
    className="absolute top-4 left-4 sm:top-10 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
  />
  <div
    ref={(el) => { floatingRefs.current[1] = el; }}
    className="absolute top-1/3 right-8 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
  />
  <div
    ref={(el) => { floatingRefs.current[2] = el; }}
    className="absolute bottom-10 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
  />
  {[...Array(15)].map((_, i) => (
    <div
      key={i}
      ref={(el) => { floatingRefs.current[i + 3] = el; }}
      className="absolute w-1 h-1 bg-white/20 rounded-full"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
      }}
    />
  ))}
</div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-3 sm:p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <Link href="/" className="nav-link flex items-center gap-1 sm:gap-2 hover:text-purple-400 text-sm sm:text-base">
          <span>←</span>
          <span className="hidden xs:inline">back home</span>
          <span className="xs:hidden">back</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50" />
          </div>
          <span className="text-base sm:text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            swipe zone
          </span>
        </div>
        <Link href="/dashboard" className="nav-link flex items-center gap-1 sm:gap-2 hover:text-cyan-400 text-sm sm:text-base">
          <span className="hidden xs:inline">dashboard</span>
          <span className="xs:hidden">stats</span>
          <span>→</span>
        </Link>
      </nav>

      <div className="relative z-10 container mx-auto max-w-4xl px-3 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent glitch-effect">
              swipe
            </span>
            <span className="text-white mx-2 sm:mx-3">your</span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent glitch-effect">
              delulu
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-400 font-medium px-4">
            time to expose how delusional you really are bestie 💀
          </p>
        </div>

        {/* Setup Phase */}
        {gameState === 'setup' && (
          <div ref={setupRef} className="feature-card group max-w-2xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-6 sm:p-12 text-center">
              <div className="text-4xl sm:text-8xl mb-4 sm:mb-8">💕</div>
              <h2 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-4">ready to get humbled?</h2>
              <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-12 leading-relaxed px-2">
                swipe through dating scenarios and we'll calculate your delulu level
                <br />
                <span className="text-green-400 font-bold">💚 = valid rizz</span> | <span className="text-red-400 font-bold">❤️ = delulu risk</span>
              </p>
              
              <div className="mb-6 sm:mb-12">
                <label className="block text-white font-black text-lg sm:text-xl mb-4 sm:mb-6">
                  how many cards you tryna swipe?
                </label>
                <select 
                  value={cardCount} 
                  onChange={(e) => setCardCount(Number(e.target.value))}
                  className="bg-gray-800/60 text-white border border-gray-700 rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-center text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full max-w-xs"
                >
                  <option value={3}>3 cards</option>
                  <option value={5}>5 cards</option>
                  <option value={7}>7 cards</option>
                  <option value={10}>10 cards</option>
                </select>
              </div>
              
              <button
                onClick={startGame}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 sm:px-12 sm:py-6 text-lg sm:text-xl font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  <span>let's get delusional</span>
                  <span className="text-2xl sm:text-3xl">🚀</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        )}

        {/* Swiping Phase */}
        {gameState === 'swiping' && (
          <div ref={swipingRef} className="space-y-4 sm:space-y-8">
            {/* Progress */}
            <div className="feature-card group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
                  <span className="text-white font-black text-base sm:text-lg">
                    card {currentCardIndex + 1} of {scenarios.length}
                  </span>
                  <span className="text-gray-400 font-bold text-sm sm:text-base">
                    {swipeResults.filter(r => r.choice === 'rizz').length} 💚 | {swipeResults.filter(r => r.choice === 'risk').length} ❤️
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((currentCardIndex) / scenarios.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="relative h-[400px] sm:h-[500px] flex items-center justify-center">
              <div 
                ref={cardRef}
                className={`
                  feature-card group w-full max-w-lg
                  transform transition-all duration-300
                  ${cardAnimation === 'left' ? '-translate-x-full rotate-12 opacity-0' : ''}
                  ${cardAnimation === 'right' ? 'translate-x-full -rotate-12 opacity-0' : ''}
                `}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sm:p-10 text-center">
                  <div className="text-4xl sm:text-6xl mb-4 sm:mb-8">🤔</div>
                  <p className="text-white text-lg sm:text-xl leading-relaxed mb-8 sm:mb-12 font-medium px-2">
                    {scenarios[currentCardIndex]}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                    <button
                      onClick={() => handleSwipe('risk')}
                      className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white font-black py-4 px-6 sm:py-6 sm:px-8 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-red-500/25 min-h-[60px] sm:min-h-[auto]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                        <span>❤️</span>
                        <span>delulu risk</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                    
                    <button
                      onClick={() => handleSwipe('rizz')}
                      className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-500 text-white font-black py-4 px-6 sm:py-6 sm:px-8 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-green-500/25 min-h-[60px] sm:min-h-[auto]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                        <span>💚</span>
                        <span>valid rizz</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center px-4">
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                <span className="text-green-400 font-bold">💚 valid rizz</span> = this could actually mean they're interested
                <br />
                <span className="text-red-400 font-bold">❤️ delulu risk</span> = bestie you're reading too much into this fr
              </p>
            </div>
          </div>
        )}

        {/* Results Phase */}
        {gameState === 'results' && (
          <div ref={resultsRef} className="space-y-4 sm:space-y-8">
            {loading ? (
              <div className="feature-card group max-w-2xl mx-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 sm:p-16 text-center">
                  <div className="relative mb-4 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-transparent border-t-purple-400 border-r-pink-400 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute top-1 left-1/2 sm:top-2 transform -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 border-4 border-transparent border-b-cyan-400 border-l-yellow-400 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <p className="text-white text-lg sm:text-xl font-bold">AI is calculating your delulu level... 🤖</p>
                  <p className="text-gray-400 mt-2 sm:mt-4 text-sm sm:text-base">this might hurt bestie</p>
                </div>
              </div>
            ) : aiJudgment && (
              <>
                {/* AI Judgment */}
                <div className="feature-card group max-w-3xl mx-auto">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sm:p-12 text-center">
                    <div className="text-4xl sm:text-8xl mb-3 sm:mb-6">🎭</div>
                    <h2 className="text-xl sm:text-3xl font-black text-white mb-4 sm:mb-6">your delulu diagnosis is in</h2>
                    
                    <div className="mb-6 sm:mb-8">
                      <div className={`text-3xl sm:text-5xl font-black ${getDeluluLevel(aiJudgment.deluluRating).color} mb-2 sm:mb-3`}>
                        {getDeluluLevel(aiJudgment.deluluRating).emoji} {aiJudgment.deluluRating}/10
                      </div>
                      <div className={`text-lg sm:text-2xl font-bold ${getDeluluLevel(aiJudgment.deluluRating).color}`}>
                        {getDeluluLevel(aiJudgment.deluluRating).text}
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/40 rounded-xl p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-700">
                      <p className="text-white text-base sm:text-lg leading-relaxed font-medium">{aiJudgment.judgment}</p>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="bg-gray-800/40 rounded-xl p-4 sm:p-6 border border-gray-700">
                        <div className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">{swipeResults.length}</div>
                        <div className="text-gray-400 font-bold text-xs sm:text-sm">cards swiped</div>
                      </div>
                      <div className="bg-green-500/10 rounded-xl p-4 sm:p-6 border border-green-500/30">
                        <div className="text-2xl sm:text-3xl font-black text-green-400 mb-1 sm:mb-2">
                          {swipeResults.filter(r => r.choice === 'rizz').length}
                        </div>
                        <div className="text-green-300 font-bold text-xs sm:text-sm">valid rizz 💚</div>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-4 sm:p-6 border border-red-500/30">
                        <div className="text-2xl sm:text-3xl font-black text-red-400 mb-1 sm:mb-2">
                          {swipeResults.filter(r => r.choice === 'risk').length}
                        </div>
                        <div className="text-red-300 font-bold text-xs sm:text-sm">delulu risk ❤️</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-2xl mx-auto px-4">
                  <button
                    onClick={resetGame}
                    className="flex-1 bg-gray-800/60 text-white font-black py-4 px-6 sm:px-8 rounded-xl hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 hover:border-gray-600 text-base sm:text-lg min-h-[60px] sm:min-h-[auto]"
                  >
                    roast me again 🔥
                  </button>
                  
                  <Link href="/dashboard" className="flex-1">
                    <div className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-4 px-6 sm:px-8 rounded-xl hover:scale-105 transition-all duration-200 text-center text-base sm:text-lg min-h-[60px] sm:min-h-[auto] flex items-center justify-center">
                      <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        <span>view delulu stats</span>
                        <span>📊</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                </div>

                {/* Saved Notice */}
                <div className="text-center px-4">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">
                    <span className="text-green-400">✅</span> your delulu data has been saved to the dashboard (unfortunately)
                  </p>
                </div>
              </>
            )}
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
        
        @media (max-width: 480px) {
          .xs\\:hidden {
            display: none !important;
          }
          
          .xs\\:inline {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}
