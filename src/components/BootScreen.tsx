import React, { useEffect } from 'react';

interface BootScreenProps {
  onBootComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onBootComplete();
    }, 3000); // Refined timing for a smoother feel

    return () => clearTimeout(timer);
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <style>
        {`
          @keyframes smooth-fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }

          @keyframes text-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }

          @keyframes gentle-pulse {
            0%, 100% { filter: drop-shadow(0 0 5px hsl(var(--primary)/0.7)); }
            50% { filter: drop-shadow(0 0 12px hsl(var(--primary))); }
          }

          .logo-container {
            animation: smooth-fade-in-scale 2s ease-in-out forwards;
          }
          
          .logo-symbol {
             animation: gentle-pulse 3s infinite ease-in-out;
          }

          .boot-text {
            opacity: 0;
            animation: text-fade-in 2s ease-in-out forwards 0.5s;
            text-shadow: 0 0 8px hsl(var(--primary)/0.5);
          }

          .shimmer-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            animation: shimmer 3.5s ease-in-out infinite 1s;
            mix-blend-mode: screen;
            opacity: 0.8;
          }
        `}
      </style>
      <div className="relative w-96 h-96">
        <div className="logo-container">
            <svg viewBox="0 0 400 400" className="w-full h-full logo-symbol">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>

              {/* Main Frame */}
              <g stroke="url(#logoGradient)" fill="none" strokeWidth="8">
                <path d="M 100,300 A 140,140 0 0,1 300,300" />
                <path d="M 300,100 A 140,140 0 0,1 100,100" />
              </g>
              
              {/* Decorative elements */}
              <g stroke="url(#logoGradient)" fill="none" strokeWidth="4">
                  <path d="M 60 150 L 100 125" />
                  <path d="M 60 250 L 100 275" />
                  <path d="M 340 150 L 300 125" />
                  <path d="M 340 250 L 300 275" />
              </g>
               <polygon points="60,150 75,140 70,155" fill="url(#logoGradient)" />
               <polygon points="60,250 75,260 70,245" fill="url(#logoGradient)" />
               <polygon points="340,150 325,140 330,155" fill="url(#logoGradient)" />
               <polygon points="340,250 325,260 330,245" fill="url(#logoGradient)" />
            </svg>
            <div className="shimmer-overlay"></div>
        </div>
        
        {/* Central Text */}
        <div 
            className="absolute inset-0 flex items-center justify-center"
        >
            <div 
                className="boot-text text-5xl font-bold text-slate-100"
            >
                ShadowTalk-AI
            </div>
        </div>

      </div>
    </div>
  );
};

export default BootScreen;
