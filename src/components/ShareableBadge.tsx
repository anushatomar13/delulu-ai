'use client';

import { useState } from 'react';

interface ShareableBadgeProps {
  responseCount: number;
  redFlags: number;
  greenFlags: number;
  onShare?: () => void;
}

export default function ShareableBadge({ 
  responseCount, 
  redFlags, 
  greenFlags, 
  onShare 
}: ShareableBadgeProps) {
  const [isSharing, setIsSharing] = useState(false);

  const createBadgeCanvas = (size: 'story' | 'post' | 'square' = 'story') => {
    const canvas = document.createElement('canvas');
    
    // Different sizes for different platforms
    const dimensions = {
      story: { width: 1080, height: 1920 }, // Instagram/Snapchat Stories
      post: { width: 1080, height: 1080 },  // Instagram Posts
      square: { width: 800, height: 800 }   // General sharing
    };
    
    canvas.width = dimensions[size].width;
    canvas.height = dimensions[size].height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return canvas;
    
    const { width, height } = dimensions[size];
    const centerX = width / 2;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(0.3, '#8b5cf6');
    gradient.addColorStop(0.7, '#4f46e5');
    gradient.addColorStop(1, '#1e1b4b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative elements
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
    
    // Scale font sizes based on canvas size
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
    
    // Positioning based on canvas type
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
    
    // Main emoji
    ctx.font = `bold ${fontSize.emoji}px Arial`;
    ctx.fillText('🌀', centerX, positions.emoji);
    
    // Main text
    ctx.font = `bold ${fontSize.title}px Arial`;
    ctx.fillText("I've been pretty", centerX, positions.title1);
    ctx.fillText('DELUSIONAL', centerX, positions.title2);
    
    // Subtitle
    ctx.font = `${fontSize.subtitle}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Check if you are on', centerX, positions.subtitle);
    
    ctx.font = `bold ${fontSize.brand}px Arial`;
    ctx.fillStyle = 'white';
    ctx.fillText('Rizz or Risk AI', centerX, positions.brand);
    
    // Stats
    ctx.font = `${fontSize.stats}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(`${responseCount} scenarios analyzed`, centerX, positions.stats1);
    ctx.fillText(`🚨 ${redFlags} Red Flags  •  ✅ ${greenFlags} Green Flags`, centerX, positions.stats2);
    
    // Call to action (only for story size)
    if (size === 'story') {
      ctx.font = `bold ${fontSize.cta}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('Try it yourself!', centerX, positions.cta);
    }
    
    // Watermark
    ctx.font = `${fontSize.watermark}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Rizz or Risk AI', centerX, positions.watermark);
    
    return canvas;
  };

  const downloadBadge = (size: 'story' | 'post' | 'square' = 'story') => {
    const canvas = createBadgeCanvas(size);
    const filename = `delulu-badge-${size}-${responseCount}-analyses.png`;
    
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
      // Use Web Share API if available (mobile)
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'delulu-badge.png', { type: 'image/png' });
          try {
            await navigator.share({
              title: "I've been pretty delusional!",
              text: `Check if you are on Rizz or Risk AI 🌀 ${responseCount} scenarios analyzed!`,
              files: [file]
            });
            onShare?.();
          } catch (error) {
            console.log('Share cancelled or failed:', error);
            // Fallback to download
            downloadBadge('story');
          }
        }
        setIsSharing(false);
      });
    } else {
      // Fallback: copy to clipboard and show instructions
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('Badge copied to clipboard! 📋\n\nYou can now:\n• Paste it to your Instagram story\n• Share on Snapchat\n• Post on any social media app\n\nJust open the app and paste! 📱');
          } catch (error) {
            // If clipboard fails, just download
            downloadBadge('story');
            alert('Badge downloaded! 💾\n\nYou can now upload it to your story or social media. The image is optimized for Instagram stories! 📱');
          }
        }
        setIsSharing(false);
      });
    }
  };

  const copyShareText = () => {
    const shareText = `I've been pretty delusional 🌀 ${responseCount} scenarios analyzed on Rizz or Risk AI! Check if you are too 😅 #RizzOrRisk #DeluluCheck`;
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
    <div className="space-y-6">
      {/* Badge Preview */}
      <div className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 rounded-2xl p-6 max-w-xs mx-auto text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full"></div>
          <div className="absolute top-6 right-4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-3xl mb-3">🌀</div>
          <p className="text-white font-bold text-sm mb-1">I've been pretty</p>
          <p className="text-white font-bold text-lg mb-3">DELUSIONAL</p>
          <p className="text-white/90 text-xs mb-1">Check if you are on</p>
          <p className="text-white font-bold text-sm mb-3">Rizz or Risk AI</p>
          <div className="pt-3 border-t border-white/20">
            <p className="text-white/80 text-xs">{responseCount} scenarios analyzed</p>
            <p className="text-white/80 text-xs">🚨 {redFlags} Red • ✅ {greenFlags} Green</p>
          </div>
        </div>
      </div>

      {/* Share Options */}
      <div className="grid grid-cols-2 gap-3">
        {shareOptions.map((option, index) => (
          <button
            key={index}
            onClick={option.action}
            disabled={isSharing}
            className={`
              ${option.primary 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                : 'bg-white/20 hover:bg-white/30'
              } 
              text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105 
              flex flex-col items-center justify-center space-y-1 min-h-[80px]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
          >
            <span className="text-lg">{isSharing && option.primary ? '⏳' : option.icon}</span>
            <span className="text-xs text-center leading-tight">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-white/70 text-sm">
          💡 Tip: "Share to Story" works best on mobile devices!
        </p>
      </div>
    </div>
  );
}