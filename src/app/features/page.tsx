'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { FiMousePointer, FiStar, FiZap } from 'react-icons/fi';
import { gsap } from 'gsap';

const Features = () => {
  const router = useRouter();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.particle', {
        opacity: 0,
        scale: 0
      });

      gsap.to('.particle', {
        opacity: 0.6,
        scale: 1,
        duration: 2,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });

      gsap.fromTo(titleRef.current, 
        { 
          y: -100, 
          opacity: 0,
          rotationX: -90
        },
        { 
          y: 0, 
          opacity: 1,
          rotationX: 0,
          duration: 1.2,
          ease: 'back.out(1.7)'
        }
      );

      gsap.fromTo(cardsRef.current,
        {
          y: 100,
          opacity: 0,
          rotationY: -45,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          rotationY: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center gap-12 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full particle"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full particle"></div>
        <div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full particle"></div>
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-yellow-400 rounded-full particle"></div>
        <div className="absolute bottom-20 right-40 w-2 h-2 bg-green-400 rounded-full particle"></div>
        <div className="absolute top-1/2 left-32 w-1 h-1 bg-blue-400 rounded-full particle"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <h1 
          ref={titleRef}
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-6xl md:text-7xl font-black tracking-tight"
        >
          Features
        </h1>
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 animate-pulse"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 relative z-10">
        <TiltCard 
          ref={el => cardsRef.current[0] = el}
          title="Are you delulu or not?" 
          subtitle="Reality Check Mode 💀"
          icon={<FiStar />}
          gradient="from-purple-500 to-pink-500"
          onClick={() => router.push('/features/delulu-analyzer')} 
        />
        <TiltCard 
          ref={el => cardsRef.current[1] = el}
          title="Red flags or Green flags?" 
          subtitle="Vibe Check Central 🚩"
          icon={<FiZap />}
          gradient="from-cyan-500 to-blue-500"
          onClick={() => router.push('/features/red-or-green-flag')} 
        />
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="text-gray-500 text-sm mt-8 font-mono"
      >
        no cap, these features hit different ✨
      </motion.p>
    </div>
  );
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

interface TiltCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}

const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(({ title, subtitle, icon, gradient, onClick }, ref) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  useEffect(() => {
    if (ref && typeof ref === 'object') {
      ref.current = cardRef.current;
    }
  }, [ref]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeaveGsap = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        handleMouseLeave();
        handleMouseLeaveGsap();
      }}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d', transform }}
      className="relative h-80 w-64 cursor-pointer group"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300`}></div>
      <div className="relative h-full w-full rounded-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`}></div>
        <div
          style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
          className="relative h-full flex flex-col items-center justify-center p-6 text-center space-y-4"
        >
          <div 
            style={{ transform: 'translateZ(25px)' }}
            className={`text-5xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
          >
            {icon}
          </div>
          <h3 
            style={{ transform: 'translateZ(25px)' }}
            className="text-white text-xl font-bold leading-tight"
          >
            {title}
          </h3>
          <p 
            style={{ transform: 'translateZ(15px)' }}
            className="text-gray-400 text-sm font-medium"
          >
            {subtitle}
          </p>
          <motion.div
            style={{ transform: 'translateZ(10px)' }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <FiMousePointer className="text-gray-500 text-lg" />
          </motion.div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
      </div>
    </motion.div>
  );
});

TiltCard.displayName = 'TiltCard';

export default Features;
