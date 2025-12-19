import { useEffect, useRef, useState } from 'react';

// --- Typewriter Hook ---
const useTypewriter = (text: string, speed = 50, start = false) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        if (!start) {
            setDisplayText('');
            return;
        }

        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval);
    }, [text, speed, start]);

    return displayText;
};


const BootScreen = ({ onBootComplete }: { onBootComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0); // 0: Rain, 1: Text reveal, 2: Exiting
  
  // --- Text lines state ---
  const [startLine1, setStartLine1] = useState(false);
  const [startLine2, setStartLine2] = useState(false);
  const [startLine3, setStartLine3] = useState(false);

  const line1 = useTypewriter('> BIO-LINK ESTABLISHED...', 50, startLine1);
  const line2 = useTypewriter('> AUTHENTICATING SENTIENCE...', 50, startLine2);
  const line3 = useTypewriter('> ACCESS GRANTED.', 50, startLine3);


  // --- Digital Rain Effect ---
  useEffect(() => {
    if (step !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const setup = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン'.split('');
        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(1);
        const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00ff00';
        
        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            if (Math.random() > 0.98) {
                 ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                 ctx.font = `${fontSize + 2}px monospace`;
                 ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, Math.random() * 100);
            }

            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };
        const animate = () => {
            draw();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    };
    setup();
    window.addEventListener('resize', setup);

    return () => {
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(animationFrameId);
    };
  }, [step]);

  // --- Main Boot Sequence ---
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2500),      
      setTimeout(() => setStartLine1(true), 3000),
      setTimeout(() => setStartLine2(true), 4000),
      setTimeout(() => setStartLine3(true), 5000),
      setTimeout(() => setStep(2), 6500),      
      setTimeout(onBootComplete, 7500),       
    ];
    return () => timers.forEach(clearTimeout);
  }, [onBootComplete]);


  return (
    <div className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-1000 ${step === 2 ? 'opacity-0' : 'opacity-100'}`}>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 transition-opacity duration-500 ${step === 0 ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {step >= 1 && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-auto text-xl text-green-400 font-mono tracking-widest">
                <p className="w-[25ch]">{line1}<span className="animate-ping">_</span></p>
                <p className="w-[29ch]">{line2}<span className="animate-ping">_</span></p>
                {startLine3 && <p className="w-[17ch] mt-4 text-fuchsia-500 animate-pulse">{line3}<span className="animate-ping">_</span></p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default BootScreen;
