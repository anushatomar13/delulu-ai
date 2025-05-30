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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  const responseCount = responses.length;
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

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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

  const downloadBadge = () => {
    // Create a simple badge image download
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background gradient
      const gradient = ctx.createRadialGradient(300, 300, 0, 300, 300, 300);
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#4f46e5');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 600);
      
      // Badge content
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🌀', 300, 150);
      
      ctx.font = 'bold 28px Arial';
      ctx.fillText("I've been pretty", 300, 250);
      ctx.fillText('delusional', 300, 290);
      
      ctx.font = '20px Arial';
      ctx.fillText('Check if you are on', 300, 380);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Rizz or Risk AI', 300, 420);
      
      ctx.font = '16px Arial';
      ctx.fillText(`${responses.length} scenarios analyzed`, 300, 500);
      
      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'rizz-or-risk-badge.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }
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
        {/* Header */}
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

        {/* Stats & Badge */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">{responses.length}</div>
            <p className="text-white/80">Scenarios Analyzed</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {responses.filter(r => r.classification.includes('Red Flag')).length}
            </div>
            <p className="text-white/80">Red Flags 🚨</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white">
              {responses.filter(r => r.classification.includes('Green Flag')).length}
            </div>
            <p className="text-white/80">Green Flags ✅</p>
          </div>
        </div>

        {/* Badge Section */}
       {responses.length >= 3 && (
  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
    <div className="text-center mb-6">
      <div className="text-6xl mb-4">🏆</div>
      <h3 className="text-2xl font-bold text-white mb-4">Achievement Unlocked!</h3>
      <p className="text-white/80 mb-6">
        You've analyzed enough scenarios to unlock your delulu badge!
      </p>
    </div>
    <ShareableBadge
      responseCount={responseCount}
      redFlags={redFlags}
      greenFlags={greenFlags}
    />
  </div>
)}

        {/* Responses List */}
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

        {/* Footer CTA */}
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