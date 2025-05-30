'use client';

import { useState, useEffect } from 'react';
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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!scenario.trim() && !file) {
      setError('Please enter a scenario or upload a screenshot');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('scenario', scenario);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);

      // Store result in Supabase
      if (user) {
        await storeResult(data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const storeResult = async (analysisResult: AnalysisResult) => {
    try {
      // First, get existing responses
      const { data: existingData } = await supabase
        .from('users')
        .select('responses')
        .eq('id', user?.id)
        .single();

      const newResponse = {
        scenario: scenario,
        classification: analysisResult.classification,
        message: analysisResult.message,
        emotions: analysisResult.emotions,
        timestamp: new Date().toISOString()
      };

      let updatedResponses = [];
      if (existingData?.responses) {
        // If responses exist, parse and add new one
        const existingResponses = typeof existingData.responses === 'string' 
          ? JSON.parse(existingData.responses) 
          : existingData.responses;
        updatedResponses = [...existingResponses, newResponse];
      } else {
        updatedResponses = [newResponse];
      }

      // Update user's responses
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user?.id,
          email: user?.email,
          responses: JSON.stringify(updatedResponses)
        });

      if (error) {
        console.error('Error storing result:', error);
      }
    } catch (err) {
      console.error('Error storing result:', err);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>←</span>
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">🔍 Analyze Your Scenario</h1>
          <Link href="/dashboard" className="text-white hover:text-gray-200 flex items-center space-x-2">
            <span>Dashboard</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Tell us your scenario</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Describe your crush scenario:
                </label>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="e.g., 'They liked my Instagram story from 3 weeks ago at 2 AM. We're basically dating now, right?'"
                  className="w-full h-32 p-4 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Or upload a screenshot (optional):
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full p-3 rounded-lg bg-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-purple-600 hover:file:bg-gray-100"
                />
                {file && (
                  <p className="text-white/80 text-sm mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || (!scenario.trim() && !file)}
                className="w-full bg-white text-purple-600 font-semibold py-4 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze This 🔮'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">AI Analysis</h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Classification */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{result.classification}</div>
                  <p className="text-white/80">Overall Vibe Check</p>
                </div>

                {/* Emotions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Detected Emotions:</h3>
                  <div className="space-y-2">
                    {result.emotions.map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getEmotionEmoji(emotion.label)}</span>
                          <span className="text-white capitalize">{emotion.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-white/20 rounded-full">
                            <div 
                              className="h-full bg-white rounded-full transition-all"
                              style={{ width: `${emotion.score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white/80 text-sm">
                            {Math.round(emotion.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Message */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">AI Verdict:</h3>
                  <p className="text-white/90 leading-relaxed">{result.message}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setScenario('');
                      setFile(null);
                    }}
                    className="flex-1 bg-white/20 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Analyze Another
                  </button>
                  <Link href="/dashboard" className="flex-1">
                    <div className="w-full bg-white text-purple-600 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-center">
                      View Dashboard
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-16">
                <div className="text-6xl mb-4">🤖</div>
                <p>AI is ready to analyze your scenario...</p>
                <p className="text-sm mt-2">Fill out the form and hit analyze!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}