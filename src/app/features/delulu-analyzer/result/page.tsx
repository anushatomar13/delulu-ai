"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { FiArrowLeft, FiZap, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scenario = searchParams.get("scenario");
  const result = searchParams.get("result");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating background elements
      floatingRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: -15,
            x: index % 2 === 0 ? 8 : -8,
            rotation: index % 2 === 0 ? 3 : -3,
            duration: 4 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.1,
          });
        }
      });

      // Initial animations
      gsap.set([cardRef.current, scenarioRef.current, resultRef.current, buttonRef.current], {
        opacity: 0,
        y: 50,
        scale: 0.9,
      });

      const tl = gsap.timeline();
      tl.to(cardRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
      .to(scenarioRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.4")
      .to(resultRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.3")
      .to(buttonRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      }, "-=0.2");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleButtonHover = (isEntering: boolean) => {
    gsap.to(buttonRef.current, {
      scale: isEntering ? 1.05 : 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={(el) => (floatingRefs.current[0] = el)}
          className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-600/15 to-pink-600/15 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[1] = el)}
          className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-to-r from-cyan-600/15 to-blue-600/15 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[2] = el)}
          className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-r from-green-600/15 to-emerald-600/15 rounded-full blur-3xl"
        />
        {[...Array(15)].map((_, i) => (
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

      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Glassmorphism card with gradient border */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <FiZap className="text-white text-xl" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Vibe Check Results ✨
                </h2>
              </div>
              <p className="text-gray-400 text-sm">no cap, the AI has spoken 💯</p>
            </div>

            {/* Scenario Section */}
            {scenario && (
              <div 
                ref={scenarioRef}
                className="mb-6 group/scenario"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover/scenario:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FiCheckCircle className="text-cyan-400 text-xl" />
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Your Scenario:
                      </h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed font-medium">"{scenario}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Section */}
            {result ? (
              <div 
                ref={resultRef}
                className="mb-8 group/result"
              >
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover/result:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FiAlertTriangle className="text-pink-400 text-xl" />
                      <h3 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        AI's Verdict:
                      </h3>
                    </div>
                    <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-4 border border-gray-700/30">
                      <p className="text-white leading-relaxed font-medium text-lg">{result}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                ref={resultRef}
                className="mb-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                  <FiAlertTriangle className="text-red-400" />
                  <p className="text-red-400 font-medium">No result found bestie 😔</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              ref={buttonRef}
              onClick={() => router.push("/features/delulu-analyzer")}
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
              className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                Run It Back 🔄
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

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