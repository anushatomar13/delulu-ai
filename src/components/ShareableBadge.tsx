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

  // GSAP Animations
  useEffect(() => {
    gsap.set([badgeRef.current, buttonsRef.current], { opacity: 0, y: 20 });
    gsap.to([badgeRef.current, buttonsRef.current], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    // Hover effects for buttons
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

  const createBadgeCanvas = (size: 'story' | 'post' | 'square' = 'story') => {
    const canvas = document.createElement('canvas');

    const dimensions = {
      story: { width: 1080, height: 1920 },
      post: { width: 1080, height: 1080 },
      square: { width: 800, height: 800 }
    };

    canvas.width = dimensions[size].width;
    canvas.height = dimensions[size].height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    const { width, height } = dimensions[size];
    const centerX = width / 2;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(0.3, '#8b5cf6');
    gradient.addColorStop(0.7, '#4f46e5');
    gradient.addColorStop(1, '#1e1b4b');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const numDots = size === 'story' ? 25 : 15;
    for (let i = 0; i < numDots; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * (width * 0.1) + (width * 0.02);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const scale = width / 1080;
    const fontSize = {
      emoji: Math.floor(120 * scale),
      title: Math.floor(64 * scale),
      subtitle: Math.floor(36 * scale),
      brand: Math.floor(48 * scale),
      stats: Math.floor(28 * scale),
      cta: Math.floor(32 * scale),
      watermark: Math.floor(24 * scale)
    };

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    const positions = size === 'story'
      ? {
          emoji: height * 0.21,
          title1: height * 0.31,
          title2: height * 0.35,
          subtitle: height * 0.42,
          brand: height * 0.46,
          stats1: height * 0.52,
          stats2: height * 0.55,
          cta: height * 0.73,
          watermark: height * 0.94
        }
      : {
          emoji: height * 0.25,
          title1: height * 0.35,
          title2: height * 0.42,
          subtitle: height * 0.52,
          brand: height * 0.58,
          stats1: height * 0.68,
          stats2: height * 0.72,
          cta: height * 0.85,
          watermark: height * 0.95
        };

    if (badgeName) {
      ctx.font = `bold ${fontSize.title}px Arial`;
      ctx.fillText(badgeName.toUpperCase(), centerX, positions.title1);
    }

    ctx.font = `bold ${fontSize.emoji}px Arial`;
    ctx.fillText('🏆', centerX, positions.emoji);

    if (badgeDescription) {
      ctx.font = `${fontSize.subtitle}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      wrapText(ctx, badgeDescription, centerX, positions.title2 + fontSize.subtitle, width * 0.8, fontSize.subtitle);
    }

    ctx.font = `bold ${fontSize.title}px Arial`;
    ctx.fillStyle = 'white';
    if (showStats) {
      ctx.fillText(`${responseCount} scenarios analyzed`, centerX, positions.stats1);
      ctx.font = `${fontSize.stats}px Arial`;
      ctx.fillText(`🚨 ${redFlags} Red • ✅ ${greenFlags} Green`, centerX, positions.stats2);
    }

    ctx.font = `${fontSize.subtitle}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Check if you are on', centerX, positions.subtitle);

    ctx.font = `bold ${fontSize.brand}px Arial`;
    ctx.fillStyle = 'white';
    ctx.fillText('Rizz or Risk AI', centerX, positions.brand);

    ctx.font = `${fontSize.watermark}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Rizz or Risk AI', centerX, positions.watermark);

    return canvas;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  const downloadBadge = (size: 'story' | 'post' | 'square' = 'story') => {
    const canvas = createBadgeCanvas(size);
    const filename = `delulu-badge-${badgeName?.replace(/\s+/g, '-').toLowerCase() || 'milestone'}-${responseCount}-analyses.png`;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const shareToStory = async () => {
    setIsSharing(true);
    const canvas = createBadgeCanvas('story');

    if (navigator.share) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'delulu-badge.png', { type: 'image/png' });
          try {
            await navigator.share({
              title: badgeName || "I've been pretty delusional!",
              text: badgeDescription || `Check if you are on Rizz or Risk AI 🌀 ${responseCount} scenarios analyzed!`,
              files: [file]
            });
            onShare?.();
          } catch (error) {
            console.log('Share cancelled or failed:', error);
            downloadBadge('story');
          }
        }
        setIsSharing(false);
      });
    } else {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Badge copied to clipboard! 📋\n\nYou can now:\n• Paste it to your Instagram story\n• Share on Snapchat\n• Post on any social media app\n\nJust open the app and paste! 📱');
          } catch (error) {
            downloadBadge('story');
            alert('Badge downloaded! 💾\n\nYou can now upload it to your story or social media. The image is optimized for Instagram stories! 📱');
          }
        }
        setIsSharing(false);
      });
    }
  };

  const copyShareText = () => {
    const shareText = `${badgeName || "I've been pretty delusional"} 🌀 ${responseCount} scenarios analyzed on Rizz or Risk AI! ${badgeDescription || "Check if you are too 😅"} #RizzOrRisk #DeluluCheck`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Share text copied! 📋\n\nPaste this as your caption or story text along with the badge image! ✨');
    });
  };

  const shareOptions = [
    {
      label: 'Share to Story',
      icon: '📱',
      action: shareToStory,
      description: 'Perfect for Instagram & Snapchat stories',
      primary: true
    },
    {
      label: 'Download Story',
      icon: '💾',
      action: () => downloadBadge('story'),
      description: 'Instagram Story size (1080x1920)'
    },
    {
      label: 'Download Post',
      icon: '📸',
      action: () => downloadBadge('post'),
      description: 'Instagram Post size (1080x1080)'
    },
    {
      label: 'Copy Caption',
      icon: '📋',
      action: copyShareText,
      description: 'Get the perfect caption text'
    }
  ];

  return (
    <div className={`space-y-6 ${isCurrent ? 'ring-4 ring-purple-400 rounded-xl' : ''}`}>
      <div
        ref={badgeRef}
        className={`relative overflow-hidden rounded-2xl p-6 max-w-xs mx-auto text-center bg-gradient-to-br from-gray-900/90 to-gray-800/80 backdrop-blur-sm border border-gray-700 shadow-lg`}
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
          {badgeName && <p className="text-white font-bold text-lg mb-1">{badgeName}</p>}
          <div className="text-4xl mb-3">🏆</div>
          {badgeDescription && <p className="text-gray-300 text-sm mb-2">{badgeDescription}</p>}
          {showStats && (
            <>
              <p className="text-gray-300 font-bold text-sm mb-1">I've analyzed</p>
              <p className="text-white font-bold text-lg mb-3">{responseCount}+ Scenarios</p>
              <div className="pt-3 border-t border-gray-600">
                <p className="text-gray-300 text-xs">🚨 {redFlags} Red • ✅ {greenFlags} Green</p>
              </div>
            </>
          )}
        </div>
      </div>
      {showStats && (
        <div ref={buttonsRef} className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              disabled={isSharing}
              className={`
                ${option.primary
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gray-800 hover:bg-gray-700'
                }
                text-gray-100 font-semibold py-3 px-4 rounded-lg transition-all
                flex flex-col items-center justify-center space-y-1 min-h-[80px]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="text-lg">{isSharing && option.primary ? '⏳' : option.icon}</span>
              <span className="text-xs text-center leading-tight">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
