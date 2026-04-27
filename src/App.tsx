import { useState, useEffect, useRef, useCallback } from "react";

// Dummy AI-generated music tracks (Using public domain/test audio links as placeholders)
const TRACKS = [
  {
    id: 1,
    title: "Neon Grid (AI Synthwave)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Cyber Serenade (AI Generated)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Bitstream Dreams (AI Gen)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

const GRID_SIZE = 20;

type Point = { x: number; y: number };

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);

  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirectionRef = useRef<Point>({ x: 0, y: -1 });

  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on the snake
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    setIsGamePaused(false);
    setFood(generateFood([{ x: 10, y: 10 }]));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === " ") {
        setIsGamePaused((prev) => !prev);
        return;
      }

      const { x, y } = directionRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
          if (y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
          if (x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
          if (x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver || isGamePaused) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        directionRef.current = nextDirectionRef.current;
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y,
        };

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check Self Collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [gameOver, isGamePaused, food, generateFood]);

  // --- Music Logic ---
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (dir: number) => {
    setCurrentTrackIndex((prev) => {
      let next = prev + dir;
      if (next >= TRACKS.length) next = 0;
      if (next < 0) next = TRACKS.length - 1;
      return next;
    });
  };

  // Auto-play next track if we change it while playing
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center font-mono selection:bg-pink-500 p-4">
      
      {/* Dashboard Container mimicking the bento grid layout */}
      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-[1fr_340px] gap-5">
        
        {/* Header */}
        <header className="md:col-span-2 flex flex-col md:flex-row items-center justify-between pb-4 border-b-2 border-cyan-400 shadow-[0_10px_20px_-10px_rgba(0,243,255,0.3)] mb-2">
          <div className="text-3xl font-black tracking-[4px] text-[#00f3ff] drop-shadow-[0_0_10px_#00f3ff]">
            SYNTH//SNAKE
          </div>
          <div className="text-xs text-slate-500 flex gap-5 mt-4 md:mt-0 font-bold tracking-wider">
            <span>CPU: 42%</span>
            <span>MEM: 128MB</span>
            <span>OS: NEON_V2.0</span>
          </div>
        </header>

        {/* Game Container (Left side on md+) */}
        <div className="bg-[#0c0c14] border border-[#00f3ff]/10 rounded-xl p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
          
          <div 
            className="relative w-full aspect-square max-w-[500px]"
            onClick={() => {
              if (isGamePaused && !gameOver) setIsGamePaused(false);
            }}
          >
             <div className="absolute inset-0 border-2 border-cyan-400 opacity-20 pointer-events-none rounded shadow-[0_0_15px_#00f3ff]"></div>
             
             {/* Use the specific gradient from the design for the board */}
             <div 
               className="absolute inset-0 bg-[#0c0c14]"
               style={{
                 backgroundImage: `linear-gradient(rgba(0,243,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.1) 1px, transparent 1px)`,
                 backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
               }}
             />

            {/* Render Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-[2px] ${
                  index === 0
                    ? "bg-white z-10 shadow-[0_0_15px_#00f3ff]"
                    : "bg-[#00f3ff] shadow-[0_0_15px_#00f3ff]"
                }`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  boxShadow: index === 0 ? "0 0 15px #00f3ff, inset 0 0 5px rgba(0,243,255,0.5)" : "0 0 15px #00f3ff",
                  border: index !== 0 ? "1px solid rgba(0,243,255,0.5)" : "none"
                }}
              />
            ))}

            {/* Render Food */}
            <div
              className="absolute bg-[#ff00ff] rounded-full shadow-[0_0_15px_#ff00ff] animate-[pulse_1s_ease-in-out_infinite]"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
            />

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                <h2 className="text-3xl font-black text-[#ff00ff] drop-shadow-[0_0_15px_rgba(255,0,255,0.5)] mb-6 tracking-widest text-center">
                  SYSTEM FAILURE
                </h2>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 border border-[#00f3ff] text-[#00f3ff] font-bold uppercase tracking-wider hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_15px_#00f3ff] transition-all bg-transparent"
                >
                  REBOOT SEQUENCE
                </button>
              </div>
            )}

            {/* Paused Screen */}
            {isGamePaused && !gameOver && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-[#00f3ff] drop-shadow-[0_0_10px_#00f3ff] tracking-[4px] animate-pulse">
                  SYSTEM PAUSED
                </h2>
              </div>
            )}
          </div>
        </div>

        {/* Bento Stack (Right side on md+) */}
        <div className="flex flex-col gap-5">
          
          {/* Bento Card: Session Data */}
          <div className="bg-[#0c0c14] border border-[#00f3ff]/10 rounded-xl p-5 relative overflow-hidden">
            <span className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-3 block border-l-2 border-[#ff00ff] pl-2">
              Session Data
            </span>
            <div className="text-5xl font-bold text-[#ff00ff] drop-shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-tighter">
              {score.toString().padStart(5, "0")}
            </div>
            {/* Optional high score display - static for aesthetic as per design */}
            <div className="mt-2 text-[11px] text-slate-500 font-bold tracking-wider">
               HIGH SCORE: <span className="text-white">04200</span>
            </div>
          </div>

          {/* Bento Card: Music Player */}
          <div className="bg-[#0c0c14] border border-[#00f3ff]/10 rounded-xl p-5 flex flex-col justify-between flex-grow relative overflow-hidden">
             
             {/* Background decorative glow */}
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff00ff]/10 rounded-full blur-[30px] pointer-events-none"></div>

            <span className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-3 block border-l-2 border-[#00f3ff] pl-2">
              Audio Deck
            </span>

            <div className="mb-5 z-10">
              <div className="text-lg text-[#00f3ff] mb-1 font-bold truncate tracking-tight drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]">
                 {TRACKS[currentTrackIndex].title.split(" (")[0].toUpperCase()}
              </div>
              <div className="text-[12px] text-slate-500 tracking-wider">
                 AI SYNTH GENERATOR // VOL {TRACKS[currentTrackIndex].id}
              </div>
            </div>

            {/* Fake Progress Bar to match aesthetic */}
            <div className="w-full h-1 bg-[#1a1a2e] rounded-sm my-4 relative overflow-hidden">
               <div 
                 className={`h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-all duration-1000 ${isPlaying ? 'w-[65%]' : 'w-[10%]'}`}
               ></div>
            </div>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={TRACKS[currentTrackIndex].url}
              onEnded={() => skipTrack(1)}
            />

            {/* Player Controls */}
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => skipTrack(-1)}
                className="w-10 h-10 rounded-full border border-[#00f3ff] text-[#00f3ff] flex items-center justify-center text-lg hover:bg-[#00f3ff] hover:text-[#050507] hover:shadow-[0_0_15px_#00f3ff] transition-all bg-transparent"
              >
                «
              </button>

              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full border border-[#ff00ff] text-[#ff00ff] flex items-center justify-center text-xl hover:bg-[#ff00ff] hover:text-[#050507] hover:shadow-[0_0_15px_#ff00ff] transition-all bg-transparent"
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>

              <button 
                onClick={() => skipTrack(1)}
                className="w-10 h-10 rounded-full border border-[#00f3ff] text-[#00f3ff] flex items-center justify-center text-lg hover:bg-[#00f3ff] hover:text-[#050507] hover:shadow-[0_0_15px_#00f3ff] transition-all bg-transparent"
              >
                »
              </button>
            </div>
          </div>

          {/* Bento Card: Controls */}
          <div className="bg-[#0c0c14] border border-[#00f3ff]/10 rounded-xl p-5 text-[11px] text-slate-500 leading-relaxed font-bold tracking-widest relative overflow-hidden">
             
             {/* Background decorative glow */}
             <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#00f3ff]/5 rounded-full blur-[30px] pointer-events-none"></div>

             <span className="text-[10px] uppercase tracking-[2px] text-slate-500 mb-3 block border-l-2 border-slate-500 pl-2">
              System Inputs
            </span>
            <div className="space-y-2 mt-2">
              <p><span className="text-[#00f3ff]">W A S D</span> TO STEER VECTOR</p>
              <p><span className="text-[#00f3ff]">SPACE</span> TO TOGGLE SYSTEM PAUSE</p>
              <p><span className="text-[#00f3ff]">ESC</span> TO ABORT SEQUENCE</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
