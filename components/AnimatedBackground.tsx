import React, { useState, useEffect, useRef } from 'react';

// Make VANTA and THREE globally available for the script
declare global {
    interface Window {
        VANTA: any;
        THREE: any;
    }
}

export const AnimatedBackground: React.FC = () => {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initVanta = () => {
        if (window.VANTA && vantaRef.current && !vantaEffect) {
            const effect = window.VANTA.WAVES({
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: false,
              touchControls: false,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0x10102c, // Deep space purple/navy
              shininess: 25.00,
              waveHeight: 7.00,
              waveSpeed: 0.4,
              zoom: 0.7,
            });
            setVantaEffect(effect);
        }
    };
    
    // Vanta.js might take a moment to load from CDN
    if (!window.VANTA) {
        const interval = setInterval(() => {
            if(window.VANTA) {
                clearInterval(interval);
                initVanta();
            }
        }, 500);
    } else {
        initVanta();
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="fixed top-0 left-0 w-full h-full z-[-1]" />;
};