"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiStar } from "react-icons/fi";
import { logIn } from "@/utils/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      floatingRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.to(ref, {
            y: -25,
            x: index % 2 === 0 ? 20 : -20,
            rotation: index % 2 === 0 ? 8 : -8,
            duration: 5 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.4,
          });
        }
      });

      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "back.out(1.7)" }
      );

      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.3 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await logIn(email, password);
    if (error) {
      setError(error.message);
      gsap.to(formRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(formRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => router.push("/features"),
      });
    }
    setIsLoading(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={(el) => (floatingRefs.current[0] = el)}
          className="absolute top-16 right-16 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[1] = el)}
          className="absolute bottom-16 left-16 w-72 h-72 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
        />
        <div
          ref={(el) => (floatingRefs.current[2] = el)}
          className="absolute top-1/3 left-1/3 w-56 h-56 bg-gradient-to-r from-green-600/15 to-emerald-600/15 rounded-full blur-3xl"
        />
      </div>
      <div ref={formRef} className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-3xl blur opacity-20"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <FiStar className="text-white text-xl" />
            </div>
            <span className="ml-3 text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              rizzORrisk.ai
            </span>
          </div>
          <h2 ref={titleRef} className="text-3xl font-black text-center mb-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h2>
          <p className="text-gray-400 text-center mb-8 font-medium">
            Ready to check your vibe? 😎
          </p>
          <div className="space-y-6">
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all backdrop-blur-sm"
              />
            </div>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging you in...
                  </>
                ) : (
                  <>
                    Log In & Vibe Check 🎯
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-6 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center font-medium">
                {error} 😕
              </div>
            )}
          </div>
          <p className="mt-8 text-center text-gray-400">
            New to the vibe?{" "}
            <Link
              href="/auth/signup"
              className="text-cyan-400 hover:text-blue-400 font-bold transition-colors hover:underline"
            >
              Join us now 🚀
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}