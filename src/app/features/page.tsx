'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { FiMousePointer } from 'react-icons/fi';

const Features = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 px-4 py-12">
      <h1 className="text-white text-4xl font-bold">Features</h1>
      <div className="flex flex-wrap justify-center gap-8">
        <TiltCard title="Are you delulu or not?" onClick={() => router.push('/features/delulu-analyzer')} />
        <TiltCard title="Red flags or Green flags?" onClick={()=>router.push('/features/red-or-green-flag')} />
      </div>
    </div>
  );
};

const ROTATION_RANGE = 32.5;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

interface TiltCardProps {
  title: string;
  onClick?: () => void;
}

const TiltCard: React.FC<TiltCardProps> = ({ title, onClick }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
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

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d', transform }}
      className="relative h-96 w-72 rounded-xl bg-gradient-to-br from-indigo-300 to-violet-300 cursor-pointer"
    >
      <div
        style={{ transform: 'translateZ(75px)', transformStyle: 'preserve-3d' }}
        className="absolute inset-4 flex flex-col items-center justify-center rounded-xl bg-white shadow-lg"
      >
        <FiMousePointer style={{ transform: 'translateZ(75px)' }} className="text-4xl text-gray-800" />
        <p style={{ transform: 'translateZ(50px)' }} className="text-center text-2xl font-bold text-gray-900">
          {title}
        </p>
      </div>
    </motion.div>
  );
};

export default Features;
