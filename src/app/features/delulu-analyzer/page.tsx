"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from "gsap";
import { FiZap, FiMessageCircle, FiLoader, FiArrowRight, FiStar } from 'react-icons/fi';
import ImageUploader from './components/ImageUploader';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@supabase/auth-helpers-react'

export default function CrushScenarioForm() {
  const user = useUser() 
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating background elements
      floatingRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: -15,
            x: index % 2 === 0 ? 10 : -10,
            rotation: index % 2 === 0 ? 4 : -4,
            duration: 4 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.15,
          });
        }
      });

      // Initial animations
      gsap.set([cardRef.current, titleRef.current, formRef.current], {
        opacity: 0,
        y: 60,
        scale: 0.9,
      });

      const tl = gsap.timeline();
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      .to(cardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      }, "-=0.5")
      .to(formRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.3");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleTextExtracted = (extractedText: string) => {
    setScenario(extractedText);
    // Animate text area when text is extracted
    const textArea = document.getElementById('scenario');
    if (textArea) {
      gsap.fromTo(textArea,
        { scale: 0.95, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  const extractDeluluRating = (aiResponse: string): number => {
    const ratingMatch = aiResponse.match(/(\d+)\/10|rating:?\s*(\d+)/i);
    if (ratingMatch) {
      return parseInt(ratingMatch[1] || ratingMatch[2]);
    }
    const lowerResponse = aiResponse.toLowerCase();
    if (lowerResponse.includes('very delulu') || lowerResponse.includes('extremely delulu')) return 9;
    if (lowerResponse.includes('delulu') && lowerResponse.includes('high')) return 7;
    if (lowerResponse.includes('delulu')) return 6;
    if (lowerResponse.includes('realistic') || lowerResponse.includes('not delulu')) return 3;
    return 5;
  };

  const storeResponseInSupabase = async (scenario: string, aiResponse: string) => {
    if (!user) return;

    try {
      const deluluRating = extractDeluluRating(aiResponse);
      
      const { error } = await supabase
        .from('user_responses')
        .insert({
          user_id: user.id,
          response_type: 'text-analysis',
          result: aiResponse,
          delulu_rating: deluluRating,
          scenario_text: scenario,
          card_choices: null
        });

      if (error) {
        console.error('Error storing response in Supabase:', error);
      } else {
        console.log('Response stored successfully in Supabase');
      }
    } catch (error) {
      console.error('Error storing response:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    // Loading animation for button
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }

    const formData = new FormData();
    formData.append('scenario', scenario);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        await storeResponseInSupabase(scenario, data.message);
        
        if (user) {
          const { data: existing, error: fetchError } = await supabase
            .from('user_scenarios')
            .select('*')
            .eq('user_id', user.id)
            .single();
      
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user data:', fetchError);
          }
      
          if (existing) {
            const { error: updateError } = await supabase
              .from('user_scenarios')
              .update({
                scenarios: [...existing.scenarios, scenario],
                results: [...existing.results, data.message],
                updated_at: new Date()
              })
              .eq('user_id', user.id);
      
            if (updateError) {
              console.error('Error updating scenario:', updateError);
            }
          } else {
            const { error: insertError } = await supabase
              .from('user_responses')
              .insert({
                user_id: user.id,
                scenarios: [scenario],
                results: [data.message]
              });
      
            if (insertError) {
              console.error('Error inserting scenario:', insertError);
            }
          }
        }

        // Success animation before redirect
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
              router.push(`/features/delulu-analyzer/result?scenario=${encodeURIComponent(scenario)}&result=${encodeURIComponent(data.message)}`);
            }
          });
        } else {
          router.push(`/features/delulu-analyzer/result?scenario=${encodeURIComponent(scenario)}&result=${encodeURIComponent(data.message)}`);
        }
      } else {
        setResponse("Something went wrong bestie. Try again! 😔");
      }
    } catch (error) {
      console.error("Error analyzing scenario:", error);
      setResponse("Something went wrong bestie. Try again! 😔");
    }

    setLoading(false);
  };

  const handleButtonHover = (isEntering: boolean) => {
    if (!loading && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: isEntering ? 1.05 : 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-4 py-8">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={(el) => (floatingRefs.current[0] = el)}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[1] = el)}
          className="absolute top-1/3 right-20 w-96 h-96 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[2] = el)}
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full blur-3xl"
        />
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (floatingRefs.current[i + 3] = el)}
            className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
              <FiStar className="text-white text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Delulu Detector ✨
            </h1>
          </div>
          <p className="text-gray-400 font-medium">
            Time for a reality check bestie 💅
          </p>
        </div>

        {/* Main Card */}
        <div ref={cardRef} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Textarea Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <FiMessageCircle className="text-purple-400 text-lg" />
                  <label htmlFor="scenario" className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Spill the Tea ☕
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="scenario"
                    rows={5}
                    placeholder="Tell me about your crush situation... don't hold back! 👀"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 font-medium leading-relaxed"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                <p className="text-gray-500 text-sm">
                  Be honest - the AI can smell cap from a mile away 🧢
                </p>
              </div>
              
              {/* Image Uploader */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiZap className="text-cyan-400 text-lg" />
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Or Drop Screenshots 📱
                  </span>
                </div>
                <ImageUploader 
                  onTextExtracted={handleTextExtracted}
                  onFileChange={handleFileChange}
                />
              </div>
              
              {/* Submit Button */}
              <button
                ref={buttonRef}
                type="submit"
                disabled={loading || !scenario.trim()}
                onMouseEnter={() => handleButtonHover(true)}
                onMouseLeave={() => handleButtonHover(false)}
                className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Reading your vibe... 🔮
                    </>
                  ) : (
                    <>
                      Get the Truth 💯
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>
            
            {/* Error Message */}
            {response && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-center">
                <p className="text-red-400 font-medium">{response}</p>
              </div>
            )}
            
            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm font-mono">
                powered by rizzORrisk.ai 🤖
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}