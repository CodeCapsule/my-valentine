
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NO_BUTTON_PHRASES, GIFS } from './constants';

const HeartConfetti: React.FC = () => {
  const hearts = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 3 + 2}s`,
        animationDelay: `${Math.random() * 3}s`,
      },
      content: ['💖', '❤️', '💕', '😍'][Math.floor(Math.random() * 4)],
    })), []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
      {hearts.map(heart => (
        <div key={heart.id} className="heart" style={heart.style}>
          {heart.content}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [noCount, setNoCount] = useState<number>(0);
  const [isYesPressed, setIsYesPressed] = useState<boolean>(false);
  const [noPosition, setNoPosition] = useState<{ top: string; left: string } | null>(null);
  const [musicPlayed, setMusicPlayed] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioRef.current = document.getElementById('bg-music') as HTMLAudioElement;
  }, []);

  // Effect to reposition the 'No' button and avoid collision
  useEffect(() => {
    if (noCount === 0) return;

    if (!containerRef.current || !yesButtonRef.current || !noButtonRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const yesRect = yesButtonRef.current.getBoundingClientRect();
    const noRect = noButtonRef.current.getBoundingClientRect();

    let newPos = { top: 0, left: 0 };
    let collision = true;
    let attempts = 0;

    const yesTop = yesRect.top - containerRect.top;
    const yesLeft = yesRect.left - containerRect.top;

    while (collision && attempts < 50) {
        const top = Math.random() * (containerRect.height - noRect.height);
        const left = Math.random() * (containerRect.width - noRect.width);
        
        const noBox = { x: left, y: top, width: noRect.width, height: noRect.height };
        const yesBox = { x: yesLeft, y: yesTop, width: yesRect.width, height: yesRect.height };

        collision = (
            noBox.x < yesBox.x + yesBox.width &&
            noBox.x + noBox.width > yesBox.x &&
            noBox.y < yesBox.y + yesBox.height &&
            noBox.y + noBox.height > yesBox.y
        );
        
        if (!collision) {
            newPos = { top, left };
        }
        attempts++;
    }

    if (!collision) {
        setNoPosition({ top: `${newPos.top}px`, left: `${newPos.left}px` });
    } else {
        // Fallback position if no safe spot is found
        setNoPosition({ top: '0px', left: '0px' });
    }
  }, [noCount]);

  const playMusicOnce = () => {
    if (!musicPlayed && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Autoplay was blocked:", e));
      setMusicPlayed(true);
    }
  };

  const handleNoClick = () => {
    playMusicOnce();
    setNoCount(prev => prev + 1);
  };

  const handleYesClick = () => {
    playMusicOnce();
    setIsYesPressed(true);
  };

  const getNoButtonText = () => {
    return NO_BUTTON_PHRASES[Math.min(noCount, NO_BUTTON_PHRASES.length - 1)];
  };

  const yesButtonScale = 1 + noCount * 0.3;
  const noButtonScale = Math.max(1 - noCount * 0.15, 0);
  const noButtonText = getNoButtonText();

  const noButtonStyle: React.CSSProperties = {
    transform: `scale(${noButtonScale})`,
    opacity: noButtonScale,
    pointerEvents: noButtonScale === 0 ? 'none' : 'auto',
    zIndex: 10,
  };
  
  if (noPosition) {
    noButtonStyle.position = 'absolute';
    noButtonStyle.top = noPosition.top;
    noButtonStyle.left = noPosition.left;
    noButtonStyle.opacity = noButtonScale > 0 ? 0.95 : 0; // Add transparency when dodging
  }

  if (isYesPressed) {
    return (
      <>
        <HeartConfetti />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="w-full max-w-md bg-rose-100/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <img src={GIFS.SUCCESS} alt="Happy bears kissing" className="w-64 h-64 md:w-80 md:h-80 mx-auto" />
            <h1 className="text-3xl md:text-5xl font-bold text-rose-700 mt-6 font-gummy uppercase">
              YAYYYYY!!! See you soon!
            </h1>
          </div>
           <footer className="mt-4 text-sm text-rose-500 font-gummy uppercase tracking-wider">
             Created by Rex Punlagao
           </footer>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md bg-rose-100/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
        <img
          src={noCount > 0 ? GIFS.SAD : GIFS.INITIAL}
          alt="Cute bear"
          className="w-64 h-64 md:w-80 md:h-80 mx-auto mb-6"
        />
        <h1 
          className="text-3xl md:text-4xl font-bold text-rose-800 font-gummy uppercase"
          style={{ marginBottom: `${2 + noCount * 0.5}rem` }} // Dynamic margin to prevent overlap
        >
          Hi Aki &lt;3, Will you be my Valentine?
        </h1>
        <div ref={containerRef} className="relative w-full flex items-center justify-center gap-4 mt-4 min-h-[150px]">
          <button
            ref={yesButtonRef}
            onClick={handleYesClick}
            className="btn-pushable btn-yes"
            style={{
              transform: `scale(${yesButtonScale})`,
              zIndex: 1,
            }}
          >
            <span className="btn-shadow"></span>
            <span className="btn-edge"></span>
            <span className="btn-front font-gummy">
              Yes
            </span>
          </button>
          <button
            ref={noButtonRef}
            onClick={handleNoClick}
            className={`btn-pushable btn-no ${noCount > 0 ? 'dodging' : ''}`}
            style={noButtonStyle}
          >
            <span className="btn-shadow"></span>
            <span className="btn-edge"></span>
            <span className="btn-front font-gummy">
              {noButtonText}
            </span>
          </button>
        </div>
      </div>
      <footer className="mt-4 text-sm text-rose-500 font-gummy uppercase tracking-wider">
        Created by Rex Punlagao
      </footer>
    </div>
  );
};

export default App;
