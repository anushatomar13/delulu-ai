'use client';

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

async function getAIJudgment(scenario: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error(error.message || 'Failed to get AI judgment. Please try again.');
  }
}

// Usage in component
const handleSubmit = async () => {
  try {
    const result = await getAIJudgment(inputScenario);
    // Handle successful result
  } catch (error) {
    setError(error.message);
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
    if (rating <= 2) return { emoji: '😇', text: 'Saint', color: 'text-green-400' };
    if (rating <= 4) return { emoji: '😊', text: 'Realistic', color: 'text-blue-400' };
    if (rating <= 6) return { emoji: '🤔', text: 'Questionable', color: 'text-yellow-400' };
    if (rating <= 8) return { emoji: '🤡', text: 'Delulu', color: 'text-orange-400' };
    return { emoji: '🚨', text: 'MAXIMUM DELULU', color: 'text-red-400' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">🎮 Swipe Challenge</h1>
          <Link href="/dashboard" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>Dashboard</span>
            <span>→</span>
          </Link>
        </div>

        {/* Setup Phase */}
        {gameState === 'setup' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">💕</div>
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Test Your Delulu Level?</h2>
            <p className="text-white/80 mb-8">
              Swipe through dating scenarios and we'll judge how delusional you are! 
              <br />💚 = Valid Rizz | ❤️ = Delulu Risk
            </p>
            
            <div className="mb-8">
              <label className="block text-white font-semibold mb-4">
                How many cards do you want to swipe?
              </label>
              <select 
                value={cardCount} 
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="bg-white/20 text-white border border-white/30 rounded-lg px-4 py-2 text-center"
              >
                <option value={3}>3 cards (Quick)</option>
                <option value={5}>5 cards (Standard)</option>
                <option value={7}>7 cards (Extended)</option>
                <option value={10}>10 cards (Maximum Delulu)</option>
              </select>
            </div>
            
            <button
              onClick={startGame}
              className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors text-lg"
            >
              Start Swiping! 🚀
            </button>
          </div>
        )}

        {/* Swiping Phase */}
        {gameState === 'swiping' && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">
                  Card {currentCardIndex + 1} of {scenarios.length}
                </span>
                <span className="text-white/80">
                  {swipeResults.filter(r => r.choice === 'rizz').length} 💚 | {swipeResults.filter(r => r.choice === 'risk').length} ❤️
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCardIndex) / scenarios.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Card */}
            <div className="relative h-96 flex items-center justify-center">
              <div 
                ref={cardRef}
                className={`
                  bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center
                  transform transition-all duration-300
                  ${cardAnimation === 'left' ? '-translate-x-full rotate-12 opacity-0' : ''}
                  ${cardAnimation === 'right' ? 'translate-x-full -rotate-12 opacity-0' : ''}
                `}
              >
                <div className="text-4xl mb-6">🤔</div>
                <p className="text-gray-800 text-lg leading-relaxed mb-8">
                  {scenarios[currentCardIndex]}
                </p>
                
                <div className="flex justify-center space-x-6">
                  <button
                    onClick={() => handleSwipe('risk')}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <span>❤️</span>
                    <span>Delulu Risk</span>
                  </button>
                  
                  <button
                    onClick={() => handleSwipe('rizz')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <span>💚</span>
                    <span>Valid Rizz</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-white/70 text-sm">
                💚 = This could actually be a sign they're interested
                <br />
                ❤️ = This is probably just you being delusional
              </p>
            </div>
          </div>
        )}

        {/* Results Phase */}
        {gameState === 'results' && (
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">AI is judging your choices... 🤖</p>
              </div>
            ) : aiJudgment && (
              <>
                {/* AI Judgment */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">🎭</div>
                  <h2 className="text-2xl font-bold text-white mb-4">Your Delulu Diagnosis</h2>
                  
                  <div className="mb-6">
                    <div className={`text-4xl font-bold ${getDeluluLevel(aiJudgment.deluluRating).color} mb-2`}>
                      {getDeluluLevel(aiJudgment.deluluRating).emoji} {aiJudgment.deluluRating}/10
                    </div>
                    <div className={`text-lg font-semibold ${getDeluluLevel(aiJudgment.deluluRating).color}`}>
                      {getDeluluLevel(aiJudgment.deluluRating).text}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-6 mb-6">
                    <p className="text-white text-lg">{aiJudgment.judgment}</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-white">{swipeResults.length}</div>
                      <div className="text-white/70 text-sm">Cards Swiped</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-400">
                        {swipeResults.filter(r => r.choice === 'rizz').length}
                      </div>
                      <div className="text-green-300 text-sm">Valid Rizz 💚</div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-400">
                        {swipeResults.filter(r => r.choice === 'risk').length}
                      </div>
                      <div className="text-red-300 text-sm">Delulu Risk ❤️</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resetGame}
                    className="bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Play Again 🔄
                  </button>
                  
                  <Link href="/dashboard">
                    <div className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors">
                      View Dashboard 📊
                    </div>
                  </Link>
                </div>

                {/* Saved Notice */}
                <div className="text-center">
                  <p className="text-white/70 text-sm">
                    ✅ Your results have been saved to your dashboard!
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}