import { useState, useRef, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const venationTypes = [
  { type: 'Parallel', plantType: 'Monocot', description: 'Lines run side by side from base to tip (like grass)', shape: 'Long and narrow (linear)' },
  { type: 'Netted', plantType: 'Dicot', description: 'Veins branch out like a net from a central line', shape: 'Wide and rounded (ovate or heart-shaped)' },
];

export default function LeafArtist({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [roundIdx, setRoundIdx] = useState(0);

  const rounds = useMemo(() => {
    const monocots = shuffle(weeds.filter(w => w.plantType === 'Monocot')).slice(0, 2);
    const dicots = shuffle(weeds.filter(w => w.plantType === 'Dicot')).slice(0, 2);
    return shuffle([...monocots, ...dicots]).map(w => ({
      weed: w,
      venation: venationTypes.find(v => v.plantType === w.plantType)!,
    }));
  }, []);

  const round = rounds[roundIdx];
  const done = roundIdx >= rounds.length;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(0, 0, c.width, c.height);
  }, [roundIdx]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * (c.width / rect.width), y: (e.touches[0].clientY - rect.top) * (c.height / rect.height) };
    }
    const me = e as React.MouseEvent;
    return { x: (me.clientX - rect.left) * (c.width / rect.width), y: (me.clientY - rect.top) * (c.height / rect.height) };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (submitted) return;
    setDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d6a4f';
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || submitted) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(0, 0, c.width, c.height);
  };

  const nextRound = () => {
    setRoundIdx(i => i + 1);
    setSubmitted(false);
    setSelfScore(null);
  };

  const restart = () => { setRoundIdx(0); setSubmitted(false); setSelfScore(null); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Drawing!</h2>
        <p className="text-muted-foreground mb-6">You completed all {rounds.length} leaf drawings.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Leaf Artist</h1>
        <span className="text-sm text-muted-foreground">Round {roundIdx + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-secondary/50 rounded-xl p-4">
            <p className="text-sm font-bold text-foreground mb-1">Draw a leaf with <span className="text-primary">{round.venation.type} venation</span></p>
            <p className="text-xs text-muted-foreground">{round.venation.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Leaf shape: {round.venation.shape}</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Example: {round.weed.commonName}</p>
              <div className="w-full aspect-square rounded-lg overflow-hidden border border-border bg-secondary">
                <WeedImage weedId={round.weed.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-muted-foreground">Your drawing</p>
                {!submitted && <button onClick={clearCanvas} className="text-xs text-destructive hover:underline">Clear</button>}
              </div>
              <canvas
                ref={canvasRef}
                width={300} height={300}
                className="w-full aspect-square rounded-lg border-2 border-border cursor-crosshair touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
            </div>
          </div>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Submit Drawing</button>
          ) : selfScore === null ? (
            <div className="bg-card border border-border rounded-xl p-4 text-center space-y-3">
              <p className="font-bold text-foreground">How well did you match the {round.venation.type} venation pattern?</p>
              <div className="flex gap-2 justify-center">
                {['Needs Work', 'Good Try', 'Nailed It!'].map((label, i) => (
                  <button key={i} onClick={() => setSelfScore(i)} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
                    {['😕', '😊', '🌟'][i]} {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-foreground font-bold mb-3">{['Keep practicing!', 'Great effort!', 'Amazing artist!'][selfScore]}</p>
              <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Leaf →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
