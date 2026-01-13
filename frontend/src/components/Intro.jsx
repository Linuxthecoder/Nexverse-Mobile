import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const Intro = ({ onIntroEnd }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isComplete = false;

    // Smooth, fast progress (~2.5–3s total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const inc = prev + (Math.random() * 4 + 2);
        const newProgress = Math.min(inc, 100);

        if (newProgress === 100 && !isComplete) {
          isComplete = true;
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            onIntroEnd();
          }, 200);
        }

        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onIntroEnd]);

  if (!visible) return null;

  // Golden color palette
  const GOLD = "#D4AF37"; // Classic gold
  const GOLD_LIGHT = "#F9E076"; // Light gold for progress glow
  const GOLD_TEXT = "#E6C25D"; // Slightly softer for text

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: GOLD_TEXT,
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      {/* Logo — Golden */}
      <div style={{ marginBottom: '24px' }}>
        <MessageSquare
          size={64}
          color={GOLD}
          style={{ opacity: 0.9 }}
        />
      </div>

      {/* App Name — Golden */}
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          margin: '0 0 28px 0',
          color: GOLD,
        }}
      >
        NexVerse
      </h1>

      {/* Progress Bar — Golden Fill */}
      <div
        style={{
          width: '80%',
          maxWidth: '360px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          margin: '0 0 24px 0',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: GOLD,
            transition: 'none',
          }}
        />
      </div>

      {/* Footer Text — Golden Accent */}
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(212, 175, 55, 0.7)', // GOLD with 70% opacity
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Securing your connection...
      </div>
    </div>
  );
};

export default Intro;