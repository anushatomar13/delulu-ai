"use client";
import React, { useState, useEffect } from 'react';
import { Heart, X, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';


interface Card {
  id: number;
  scenario: string;
}

interface SwipeResult {
  cardId: number;
  scenario: string;
  choice: 'rizz' | 'risk';
}

const CardSwipePage: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeResults, setSwipeResults] = useState<SwipeResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [aiJudgment, setAiJudgment] = useState('');
  const [deluluRating, setDeluluRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');

  // Generate delulu scenarios
  const generateCards = () => {
    const scenarios = [
      "You've been texting someone for 2 days and already planning your wedding venue",
      "They left you on read for 3 hours so you're convinced they're playing hard to get",
      "You think every song they share on their story is about you",
      "You're analyzing their Instagram likes to see if they're interested in someone else",
      "You screenshot their story to see if they viewed yours right after",
      "You google their zodiac compatibility after the first date",
      "You already know what you'll name your future kids together",
      "You change your entire personality to match their interests"
    ];
    
    return scenarios.slice(0, 5).map((scenario, index) => ({
      id: index + 1,
      scenario
    }));
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setCards(generateCards());
  }, [user, router]);


  // Add realtime subscription
useEffect(() => {
  const channel = supabase
    .channel('swipe-results')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public' 
    }, () => fetchUserResponses())
    .subscribe();

  return () => { supabase.removeChannel(channel) };
}, [user]);

  const handleSwipe = (direction: 'rizz' | 'risk') => {
    const currentCard = cards[currentCardIndex];
    const newResult: SwipeResult = {
      cardId: currentCard.id,
      scenario: currentCard.scenario,
      choice: direction
    };

    const updatedResults = [...swipeResults, newResult];
    setSwipeResults(updatedResults);

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // All cards completed, get AI judgment
      getAIJudgment(updatedResults);
      setIsComplete(true);
    }
  };

  const getAIJudgment = async (results: SwipeResult[]) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ swipeResults: results }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const judgment = data.judgment;
      const rating = data.deluluRating || 5;

      setAiJudgment(judgment);
      setDeluluRating(rating);

      // Store results in Supabase
      if (user) {
        await storeResultInSupabase(judgment, rating, results);
      }

    } catch (error) {
      console.error('Failed to get AI judgment:', error);
      setError('Failed to get AI judgment. Please try again.');
      setAiJudgment("🤖 Oops! Something went wrong with the AI analysis. But hey, at least you completed the challenge!");
      setDeluluRating(5);
      
      // Still try to store the fallback result
      if (user) {
        await storeResultInSupabase(
          "🤖 Oops! Something went wrong with the AI analysis. But hey, at least you completed the challenge!",
          5,
          results
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const storeResultInSupabase = async (judgment: string, rating: number, results: SwipeResult[]) => {
    try {
      const { error } = await supabase
        .from('user_responses')
        .insert({
          user_id: user!.id,
          response_type: 'card-swipe',
          result: judgment,
          delulu_rating: rating,
          scenario_text: `Card Swipe Game - ${results.length} scenarios completed`,
card_choices: JSON.stringify(results)
        });

      if (error) {
        console.error('Error storing result in Supabase:', error);
        // Still try localStorage as fallback
        try {
          const response = {
            type: 'card-swipe',
            result: judgment,
            deluluRating: rating,
            timestamp: new Date().toISOString(),
            details: results
          };

          const existingResponses = JSON.parse(localStorage.getItem('userResponses') || '[]');
          existingResponses.push(response);
          localStorage.setItem('userResponses', JSON.stringify(existingResponses));
        } catch (storageError) {
          console.log('localStorage not available');
        }
      } else {
        console.log('Result stored successfully in Supabase');
      }
    } catch (error) {
      console.error('Error storing result:', error);
    }
  };

  const resetGame = () => {
    setCurrentCardIndex(0);
    setSwipeResults([]);
    setIsComplete(false);
    setAiJudgment('');
    setDeluluRating(0);
    setError('');
    setCards(generateCards());
  };

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to play the card swipe game and save your results.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-xl">Loading cards...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">🃏 Swipe Your Truth</h1>
          <p className="text-lg opacity-90">
            Swipe right (💚) if it's valid rizz, left (❤️) if it's risky delulu behavior
          </p>
          <p className="text-sm opacity-75 mt-2">
            Welcome, {user.email}! Your results will be saved to your dashboard.
          </p>
        </div>

        {!isComplete ? (
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300" 
                style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="text-center font-bold text-gray-600 mb-8 text-lg">
              Card {currentCardIndex + 1} of {cards.length}
            </div>

            <div className="flex justify-center mb-10">
              <div className="w-80 h-48 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 text-center">
                  <p className="text-white text-lg font-medium leading-relaxed">
                    {cards[currentCardIndex]?.scenario}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-6 mb-8">
              <button 
                className="flex flex-col items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={() => handleSwipe('risk')}
              >
                <X size={28} />
                <span>Delulu Risk</span>
              </button>
              
              <button 
                className="flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={() => handleSwipe('rizz')}
              >
                <Heart size={28} />
                <span>Valid Rizz</span>
              </button>
            </div>

            <div className="border-t-2 border-gray-100 pt-6">
              <h3 className="font-bold text-gray-700 mb-4">Your Choices:</h3>
              <div className="flex flex-wrap gap-3">
                {swipeResults.map((result, index) => (
                  <div key={result.cardId} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-lg">
                      {result.choice === 'rizz' ? '💚' : '❤️'}
                    </span>
                    <span className="text-gray-600">Card {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-xl text-gray-600">AI is analyzing your delulu level...</p>
                <p className="text-sm text-gray-500">Saving your results...</p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🎯 Your Delulu Judgment</h2>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-2xl mb-8">
                  <p className="text-lg font-medium leading-relaxed">
                    {aiJudgment}
                  </p>
                  {deluluRating > 0 && (
                    <div className="mt-4">
                      <p className="text-sm opacity-90">Delulu Rating: {deluluRating}/10</p>
                    </div>
                  )}
                  <p className="text-xs opacity-75 mt-2">✅ Results saved to your dashboard</p>
                </div>
                
                <div className="text-left mb-8">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Your Choices Summary:</h3>
                  <div className="space-y-3">
                    {swipeResults.map((result, index) => (
                      <div key={result.cardId} className="bg-gray-50 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 mb-2">{result.scenario}</div>
                        <div className={`font-bold ${result.choice === 'rizz' ? 'text-green-600' : 'text-red-600'}`}>
                          {result.choice === 'rizz' ? '💚 Valid Rizz' : '❤️ Delulu Risk'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                    onClick={resetGame}
                  >
                    <RotateCcw size={20} />
                    Play Again
                  </button>
                  
                  <button 
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
                    onClick={() => router.push('/dashboard')}
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSwipePage;