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
  
  // GSAP refs
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
        if (formRef.current) {
          formRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.3s both';
        }
        if (resultsRef.current) {
          resultsRef.current.style.animation = 'fadeInUp 0.8s ease-out 0.6s both';
        }
      };

      animateElements();
    }
  }, [user]);

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        try {
          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }

            // Create FormData for OCR API call
            const formData = new FormData();
            formData.append('file', blob, 'image.png');

            try {
              // Using OCR.space free API as an example
              // You can replace this with other OCR services like Google Vision API, Azure Cognitive Services, etc.
              const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                headers: {
                  'apikey': process.env.NEXT_PUBLIC_OCR_API_KEY || 'helloworld', // Free tier key
                },
                body: formData,
              });

              const ocrData = await ocrResponse.json();
              
              if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
                const extractedText = ocrData.ParsedResults[0].ParsedText;
                resolve(extractedText || '');
              } else {
                reject(new Error('No text found in image'));
              }
            } catch (error) {
              reject(error);
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Check if it's an image file
      if (selectedFile.type.startsWith('image/')) {
        setOcrLoading(true);
        setError('');
        
        try {
          const extractedText = await extractTextFromImage(selectedFile);
          if (extractedText.trim()) {
            // Clean up the extracted text
            const cleanedText = extractedText
              .replace(/\r\n/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            // Add to existing scenario or replace it
            if (scenario.trim()) {
              setScenario(prev => prev + '\n\n' + cleanedText);
            } else {
              setScenario(cleanedText);
            }
          }
        } catch (err) {
          console.error('OCR Error:', err);
          setError('Could not extract text from image. You can still analyze the image or type your scenario manually.');
        } finally {
          setOcrLoading(false);
        }
      }
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
          ref={(el) => (floatingRefs.current[0] = el)}
          className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[1] = el)}
          className="absolute top-1/3 right-20 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[2] = el)}
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
        />
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (floatingRefs.current[i + 3] = el)}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <Link href="/" className="nav-link flex items-center gap-2 hover:text-purple-400">
          <span>←</span>
          <span>back home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50" />
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            analyze zone
          </span>
        </div>
        <Link href="/dashboard" className="nav-link flex items-center gap-2 hover:text-cyan-400">
          <span>dashboard</span>
          <span>→</span>
        </Link>
      </nav>

      <div className="relative z-10 container mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <h1 className="text-5xl md:text-7lg font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent glitch-effect">
              delulu
            </span>
            <span className="text-white mx-3">or</span>
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent glitch-effect">
              reality?
            </span>
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            drop that screenshot or type a scenario and let AI decide whether you're delusional or not✨
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div ref={formRef} className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-8">
              <h2 className="text-3xl font-black text-white mb-2">spill the tea ☕</h2>
              <p className="text-gray-400 mb-8">be honest bestie, what's the situation?</p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-white text-lg font-bold mb-4">
                    your delulu scenario:
                  </label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="e.g., 'they liked my instagram story from 3 weeks ago at 2am. we're basically dating now right?' 💀"
                    className="w-full h-40 p-4 rounded-xl bg-gray-800/60 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none font-medium"
                    rows={6}
                  />
                  {ocrLoading && (
                    <div className="flex items-center space-x-3 mt-3 text-purple-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      <span className="text-sm font-medium">extracting text from your screenshot...</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white text-lg font-bold mb-4">
                    or drop that screenshot:
                  </label>
                  <div className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                    <span>💡</span>
                    <span>upload an image and we'll extract the text automatically</span>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={ocrLoading}
                      className="w-full p-4 rounded-xl bg-gray-800/60 text-white border border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 disabled:opacity-50 transition-all duration-200"
                    />
                  </div>
                  {file && (
                    <div className="mt-4 p-4 bg-gray-800/40 rounded-xl border border-gray-700">
                      <p className="text-white font-medium text-sm mb-1">
                        📷 {file.name}
                      </p>
                      {file.type.startsWith('image/') && (
                        <p className="text-green-400 text-sm flex items-center gap-2">
                          <span>✅</span>
                          <span>ready to extract text from this image</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-300 font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading || ocrLoading || (!scenario.trim() && !file)}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-5 text-lg font-black transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>AI is judging you...</span>
                      </>
                    ) : ocrLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>reading your screenshot...</span>
                      </>
                    ) : (
                      <>
                        <span>expose my delusions</span>
                        <span className="text-2xl">🔮</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="feature-card group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-8">
              <h2 className="text-3xl font-black text-white mb-2">AI reality check 🤖</h2>
              <p className="text-gray-400 mb-8">brace yourself bestie...</p>
              
              {result ? (
                <div className="space-y-8">
                  {/* Classification */}
                  <div className="text-center p-6 bg-gray-800/40 rounded-xl border border-gray-700">
                    <div className="text-6xl mb-4">{result.classification}</div>
                    <p className="text-gray-300 font-bold text-lg">overall vibe check</p>
                  </div>

                  {/* Emotions */}
                  <div>
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                      <span>🎭</span>
                      <span>emotional breakdown:</span>
                    </h3>
                    <div className="space-y-3">
                      {result.emotions.map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{getEmotionEmoji(emotion.label)}</span>
                            <span className="text-white font-bold capitalize">{emotion.label}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${emotion.score * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-bold text-sm min-w-[45px]">
                              {Math.round(emotion.score * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Message */}
                  <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                      <span>💬</span>
                      <span>AI's verdict:</span>
                    </h3>
                    <p className="text-gray-200 leading-relaxed font-medium text-lg">{result.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setResult(null);
                        setScenario('');
                        setFile(null);
                      }}
                      className="flex-1 bg-gray-800/60 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-700/60 transition-all duration-200 border border-gray-700 hover:border-gray-600"
                    >
                      roast me again 🔥
                    </button>
                    <Link href="/dashboard" className="flex-1">
                      <div className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-center">
                        view my delulu stats 📊
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-20">
                  <div className="text-8xl mb-6">🤖</div>
                  <p className="text-xl font-bold mb-3">AI is ready to judge...</p>
                  <p className="mb-2">enter a scenario and let's see how delulu you really are!</p>
                  <p className="text-sm text-gray-500 mt-6">
                    💡 pro tip: be as descriptive as you can to get better results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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