"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { FiArrowRight, FiStar, FiZap, FiHeart, FiTrendingUp, FiUsers, FiShield } from "react-icons/fi";

const Homepage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 50,
      });

      floatingRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: -20,
            x: index % 2 === 0 ? 10 : -10,
            rotation: index % 2 === 0 ? 5 : -5,
            duration: 3 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.2,
          });
        }
      });

      const tl = gsap.timeline();
      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
      })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .to(
          buttonsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.4"
        );

      gsap.fromTo(
        featuresRef.current?.children || [],
        {
          opacity: 0,
          y: 80,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          delay: 2,
        }
      );

      gsap.fromTo(
        statsRef.current?.children || [],
        {
          opacity: 0,
          scale: 0.5,
          rotation: -180,
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 2.5,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
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
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (floatingRefs.current[i + 3] = el)}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <nav className="relative z-50 flex items-center justify-between p-6 backdrop-blur-sm bg-gray-900/20 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-50" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            rizzORrisk.ai
          </span>
        </div>
        <button
          onClick={() => router.push("/auth/signup")}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-bold transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10">Get Started 🚀</span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </nav>
      <div ref={heroRef} className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div ref={titleRef} className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Rizz
            </span>
            <span className="text-white mx-4">or</span>
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Risk?
            </span>
          </h1>
          <div className="text-4xl md:text-6xl">💕</div>
        </div>
        <div ref={subtitleRef} className="text-center mb-12 max-w-3xl">
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium">
            AI-powered vibe check for your situationship! 🤔
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
              Are you smooth with the rizz or just deep in delulu?
            </span>
          </p>
          <p className="text-lg text-gray-400 mt-4">
            Swipe on red & green flags and let AI drop the truth! 🚩✅
          </p>
        </div>
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 mb-16">
          <button
            onClick={() => router.push("/features")}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Vibe Check ✨
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="group rounded-2xl border-2 border-gray-700 bg-gray-900/50 backdrop-blur-sm px-8 py-4 text-lg font-bold text-gray-300 transition-all duration-300 hover:scale-105 hover:border-cyan-500 hover:bg-gray-800/50 hover:text-white hover:shadow-xl hover:shadow-cyan-500/20"
          >
            <span className="flex items-center gap-2">
              View Dashboard 📊
              <FiTrendingUp className="transition-transform group-hover:rotate-12" />
            </span>
          </button>
        </div>
        <div ref={statsRef} className="grid grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              10K+
            </div>
            <div className="text-gray-400 text-sm md:text-base">Vibes Checked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              95%
            </div>
            <div className="text-gray-400 text-sm md:text-base">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-gray-400 text-sm md:text-base">AI Support</div>
          </div>
        </div>
      </div>
      <div ref={featuresRef} className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-20">
        <FeatureCard
          icon={<FiStar className="text-3xl" />}
          title="Delulu Detector"
          description="AI analyzes your situation and tells you if you're being realistic or just delulu fr 💀"
          gradient="from-purple-500 to-pink-500"
        />
        <FeatureCard
          icon={<FiZap className="text-3xl" />}
          title="Flag Scanner"
          description="Swipe through scenarios and get instant red/green flag analysis 🚩✅"
          gradient="from-cyan-500 to-blue-500"
        />
        <FeatureCard
          icon={<FiHeart className="text-3xl" />}
          title="Rizz Rating"
          description="Get your rizz score and tips to level up your game 📈"
          gradient="from-pink-500 to-red-500"
        />
        <FeatureCard
          icon={<FiUsers className="text-3xl" />}
          title="Community Vibes"
          description="See what others think about similar situations 👥"
          gradient="from-green-500 to-emerald-500"
        />
        <FeatureCard
          icon={<FiShield className="text-3xl" />}
          title="Privacy First"
          description="Your business stays your business - encrypted & secure 🔒"
          gradient="from-yellow-500 to-orange-500"
        />
        <FeatureCard
          icon={<FiTrendingUp className="text-3xl" />}
          title="Growth Tracking"
          description="Watch your relationship game improve over time 📊"
          gradient="from-indigo-500 to-purple-500"
        />
      </div>
      <footer className="relative z-10 text-center py-12 border-t border-gray-800/50">
        <p className="text-gray-500 font-mono text-sm">no cap, this AI knows your vibe fr 💯</p>
        <p className="text-gray-600 text-xs mt-2">© 2025 rizzORrisk.ai - Anusha Tomar✨</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      y: -10,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300`}
      />
      <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 p-6 transition-all duration-300">
        <div
          className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default Homepage;
