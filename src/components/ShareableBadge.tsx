'use client';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface ShareableBadgeProps {
  responseCount: number;
  redFlags: number;
  greenFlags: number;
  badgeName?: string;
  badgeDescription?: string;
  isCurrent?: boolean;
  onShare?: () => void;
  showStats?: boolean;
}

export default function ShareableBadge({
  responseCount,
  redFlags,
  greenFlags,
  badgeName,
  badgeDescription,
  isCurrent = false,
  onShare,
  showStats = true
}: ShareableBadgeProps) {
  const [isSharing, setIsSharing] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Existing GSAP animations remain unchanged
  useEffect(() => {
    gsap.set([badgeRef.current, buttonsRef.current], { opacity: 0, y: 20 });
    gsap.to([badgeRef.current, buttonsRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    const buttons = buttonsRef.current?.querySelectorAll('button');
    if (buttons) {
      buttons.forEach((button) => {
        button.addEventListener('mouseenter', () => {
          gsap.to(button, {
            scale: 1.05,
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
            duration: 0.2
          });
        });
        button.addEventListener('mouseleave', () => {
          gsap.to(button, {
            scale: 1,
            boxShadow: 'none',
            duration: 0.2
          });
        });
      });
    }
  }, []);

  // Existing canvas creation and sharing logic remains unchanged
  const createBadgeCanvas = (size: 'story' | 'post' | 'square' = 'story') => { /* ... */ };
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => { /* ... */ };
  const downloadBadge = (size: 'story' | 'post' | 'square' = 'story') => { /* ... */ };
  const shareToStory = async () => { /* ... */ };
  const copyShareText = () => { /* ... */ };

  const shareOptions = [
    { label: 'Share to Story', icon: '📱', action: shareToStory, primary: true },
    { label: 'Download Story', icon: '💾', action: () => downloadBadge('story') },
    { label: 'Download Post', icon: '📸', action: () => downloadBadge('post') },
    { label: 'Copy Caption', icon: '📋', action: copyShareText }
  ];

  return (
    <div className={`space-y-4 sm:space-y-6 ${isCurrent ? 'ring-2 sm:ring-4 ring-purple-400 rounded-lg sm:rounded-xl' : ''}`}>
      {/* Responsive Badge Container */}
      <div
        ref={badgeRef}
        className={`relative overflow-hidden rounded-lg sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-xs mx-auto text-center bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-sm border border-gray-700 shadow-sm sm:shadow-lg`}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.2
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10">
          {badgeName && (
            <p className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
              {badgeName}
            </p>
          )}
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏆</div>
          {badgeDescription && (
            <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3">
              {badgeDescription}
            </p>
          )}
          {showStats && (
            <>
              <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                I've analyzed
              </p>
              <p className="text-white font-semibold text-base sm:text-lg mb-2 sm:mb-3">
                {responseCount}+ Scenarios
              </p>
              <div className="pt-2 sm:pt-3 border-t border-gray-600">
                <p className="text-gray-300 text-xs sm:text-xs">
                  🚨 {redFlags} Red • ✅ {greenFlags} Green
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive Buttons Grid */}
      {showStats && (
        <div ref={buttonsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full sm:max-w-xs mx-auto">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              disabled={isSharing}
              className={`
                ${option.primary 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                  : 'bg-gray-800 hover:bg-gray-700'}
                text-gray-100 font-medium text-sm sm:text-xs py-2 sm:py-3 px-3 sm:px-4 rounded-md sm:rounded-lg transition-all
                flex flex-col items-center justify-center space-y-1 min-h-[60px] sm:min-h-[80px]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-lg sm:text-xl">
                {isSharing && option.primary ? '⏳' : option.icon}
              </span>
              <span className="text-xs sm:text-xs text-center leading-tight">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
