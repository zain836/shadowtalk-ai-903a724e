import { useEffect, useState, useRef } from 'react';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now();
    // This duration should roughly match the simulated loading time in App.tsx
    const duration = 2000; 

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const currentProgress = Math.min((elapsedTime / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
          boxShadow: '0 0 10px hsl(var(--primary-glow)), 0 0 5px hsl(var(--secondary))',
          transition: 'width 0.05s linear',
        }}
      ></div>
    </div>
  );
};

export default LoadingBar;
