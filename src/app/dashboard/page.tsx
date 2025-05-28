"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';

interface UserResponse {
  id: string;
  response_type: string;
  result: string;
  delulu_rating: number;
  scenario_text: string;
  card_choices: any;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [canShareBadge, setCanShareBadge] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchUserResponses();
  }, [user, router]);

  const fetchUserResponses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching responses:', error);
      } else {
        setResponses(data || []);
        // Check if user can share badge (every 3 responses)
        setCanShareBadge(data && data.length > 0 && data.length % 3 === 0);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeluluLevel = (rating: number): string => {
    if (rating >= 8) return "Extremely Delulu 🤯";
    if (rating >= 6) return "Pretty Delulu 😵‍💫";
    if (rating >= 4) return "Mildly Delulu 🙃";
    return "Realistic 😎";
  };

  const getDeluluColor = (rating: number): string => {
    if (rating >= 8) return "bg-red-500";
    if (rating >= 6) return "bg-orange-500";
    if (rating >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareBadge = () => {
    setShowBadgeModal(true);
  };

  const downloadBadge = () => {
    // Create canvas for badge
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#3B82F6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("I've been pretty", 200, 120);
    ctx.fillText("DELUSIONAL 💭", 200, 160);
    
    ctx.font = '18px Arial';
    ctx.fillText("Check if you're delusional", 200, 220);
    ctx.fillText("or not on", 200, 250);
    
    ctx.font = 'bold 22px Arial';
    ctx.fillText("RIZZ OR RISK AI", 200, 290);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Total Responses: ${responses.length}`, 200, 340);

    // Download the image
    const link = document.createElement('a');
    link.download = 'delulu-badge.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareToStory = () => {
    // For web sharing (Instagram story sharing requires mobile app)
    if (navigator.share) {
      navigator.share({
        title: 'My Delulu Badge',
        text: 'I\'ve been pretty delusional! Check if you\'re delusional or not on Rizz or Risk AI',
        url: window.location.origin
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`I've been pretty delusional! Check if you're delusional or not on Rizz or Risk AI - ${window.location.origin}`);
      alert('Badge text copied to clipboard!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your dashboard</h2>
          <Button onClick={() => router.push('/auth/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading your delulu history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Delulu Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.email}</p>
          <p className="text-sm text-gray-500">Total Responses: {responses.length}</p>
        </div>

        {canShareBadge && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white text-center">
            <h3 className="text-xl font-bold mb-2">🎉 Badge Unlocked!</h3>
            <p className="mb-4">You've completed {responses.length} responses! Share your delulu badge now!</p>
            <Button 
              onClick={handleShareBadge}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Share Badge
            </Button>
          </div>
        )}

        {responses.length === 0 ? (
          <div className="text-center bg-white rounded-lg p-8 shadow">
            <h3 className="text-xl font-bold text-gray-700 mb-4">No responses yet!</h3>
            <p className="text-gray-600 mb-6">Start analyzing your crush scenarios or play the card swipe game!</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/features/delulu-analyzer')}>
                Delulu Analyzer
              </Button>
              <Button onClick={() => router.push('/features/card-swipe')}>
                Card Swipe Game
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <Card key={response.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {response.response_type === 'text-analysis' ? '📝 Scenario Analysis' : '🃏 Card Swipe Game'}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{formatDate(response.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getDeluluColor(response.delulu_rating || 5)} text-white`}>
                        {response.delulu_rating || 5}/10
                      </Badge>
                      <Badge variant="outline">
                        {getDeluluLevel(response.delulu_rating || 5)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {response.scenario_text && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Your Input:</h4>
                      <p className="text-gray-600 text-sm">{response.scenario_text}</p>
                    </div>
                  )}
                  
                  {response.card_choices && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Your Choices:</h4>
                      <div className="flex flex-wrap gap-2">
                        {response.card_choices.map((choice: any, index: number) => (
                          <Badge key={index} variant={choice.choice === 'rizz' ? 'default' : 'destructive'}>
                            Card {index + 1}: {choice.choice === 'rizz' ? '💚 Rizz' : '❤️ Risk'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">AI's Verdict:</h4>
                    <p className="text-gray-700 text-sm">{response.result}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Badge Modal */}
        {showBadgeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-64 h-64 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex flex-col items-center justify-center text-white">
                  <h3 className="text-xl font-bold mb-2">I've been pretty</h3>
                  <h2 className="text-2xl font-bold mb-4">DELUSIONAL 💭</h2>
                  <p className="text-sm mb-2">Check if you're delusional</p>
                  <p className="text-sm mb-2">or not on</p>
                  <p className="text-lg font-bold">RIZZ OR RISK AI</p>
                  <p className="text-xs mt-2">Total Responses: {responses.length}</p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={downloadBadge}>
                    Download Badge
                  </Button>
                  <Button onClick={shareToStory} variant="outline">
                    Share to Story
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setShowBadgeModal(false)}
                  variant="ghost"
                  className="mt-4"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;