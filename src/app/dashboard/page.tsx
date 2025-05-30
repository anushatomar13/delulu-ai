'use client';

import { useState, useEffect } from 'react';
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
}

const milestones = [
  { threshold: 3, name: "Delulu Debut", description: "First badge – shows commitment" },
  { threshold: 5, name: "Rizz Rookie", description: "You're on your way" },
  { threshold: 10, name: "Certified Delusionist", description: "You've earned your stripes" },
  { threshold: 20, name: "Risk Master", description: "Consistency and effort" },
  { threshold: 50, name: "Reality Challenger", description: "Significant engagement" },
  { threshold: 100, name: "Grand Delusion", description: "Ultimate badge – top-tier recognition" }
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const achievedMilestones = milestones
    .filter(m => responses.length >= m.threshold)
    .sort((a, b) => b.threshold - a.threshold);

  const redFlags = responses.filter(r => r.classification.includes('Red Flag')).length;
  const greenFlags = responses.filter(r => r.classification.includes('Green Flag')).length;

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

  const fetchResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('responses')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'P2025' && error.code !== 'PGRST116') { // Not found error codes
        console.error('Error fetching responses:', error);
        setLoading(false);
        return;
      }

      if (data?.responses) {
        const parsedResponses = typeof data.responses === 'string' 
          ? JSON.parse(data.responses) 
          : data.responses;
        setResponses(parsedResponses.reverse()); // Show newest first
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
      neutral: '😐'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">📊 Your Delulu Dashboard</h1>
          <Link href="/analyze" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>Analyze</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">{responses.length}</div>
            <p className="text-white/80">Scenarios Analyzed</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">{redFlags}</div>
            <p className="text-white/80">Red Flags 🚨</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">{greenFlags}</div>
            <p className="text-white/80">Green Flags ✅</p>
          </div>
        </div>

        {responses.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-white mb-4">Milestone Progress</h3>
            </div>

            {achievedMilestones.length > 0 && (
              <>
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 mb-8">
                  <h4 className="text-xl font-bold text-white mb-2">Latest Achievement</h4>
                  <ShareableBadge
                    responseCount={responses.length}
                    redFlags={redFlags}
                    greenFlags={greenFlags}
                    badgeName={achievedMilestones[0].name}
                    badgeDescription={achievedMilestones[0].description}
                    isCurrent={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievedMilestones.slice(1).map((milestone, index) => (
                    <ShareableBadge
                      key={index}
                      responseCount={milestone.threshold}
                      redFlags={0}
                      greenFlags={0}
                      badgeName={milestone.name}
                      badgeDescription={milestone.description}
                      isCurrent={false}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4">Next Milestones</h4>
              <div className="grid grid-cols-2 gap-4">
                {milestones
                  .filter(m => responses.length < m.threshold)
                  .slice(0, 4)
                  .map((milestone, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{milestone.name}</p>
                          <p className="text-white/60 text-sm">{milestone.description}</p>
                        </div>
                        <span className="text-white/40 text-sm">
                          {milestone.threshold - responses.length} to go
                        </span>
                      </div>
                      <div className="mt-2 h-1 bg-white/10 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          style={{
                            width: `${Math.min((responses.length / milestone.threshold) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Your Analysis History</h2>
          
          {responses.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">🤷‍♀️</div>
              <h3 className="text-xl font-semibold text-white mb-2">No analyses yet!</h3>
              <p className="text-white/70 mb-6">Start analyzing your crush scenarios to see them here.</p>
              <Link href="/analyze">
                <div className="inline-block bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                  Analyze Your First Scenario
                </div>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {responses.map((response, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white mb-2">
                        {response.classification}
                      </div>
                      <p className="text-white/80 text-sm">
                        {formatDate(response.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <p className="text-white/90 text-sm mb-2"><strong>Scenario:</strong></p>
                    <p className="text-white/80">
                      {response.scenario.length > 150 
                        ? `${response.scenario.substring(0, 150)}...` 
                        : response.scenario}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <p className="text-white/90 text-sm mb-2"><strong>AI Analysis:</strong></p>
                    <p className="text-white/80">{response.message}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {response.emotions.slice(0, 3).map((emotion, emotionIndex) => (
                      <div key={emotionIndex} className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <span>{getEmotionEmoji(emotion.label)}</span>
                        <span className="text-white/80 text-xs capitalize">{emotion.label}</span>
                        <span className="text-white/60 text-xs">
                          {Math.round(emotion.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {responses.length > 0 && responses.length < 3 && (
          <div className="text-center mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-2">
              Keep Going! 🎯
            </h3>
            <p className="text-white/80 mb-4">
              Analyze {3 - responses.length} more scenario{3 - responses.length > 1 ? 's' : ''} to unlock your shareable badge!
            </p>
            <Link href="/analyze">
              <div className="inline-block bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                Continue Analyzing
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
