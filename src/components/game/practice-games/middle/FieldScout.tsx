import { useState, useMemo } from 'react';
import WeedImage from '@/components/game/WeedImage';
import cornField1 from '@/assets/images/corn_field_1.jpg';
import cornField2 from '@/assets/images/corn_field_2.jpg';
import soybeanField1 from '@/assets/images/soybean_field_1.jpg';
import pastureField1 from '@/assets/images/pasture_field_1.jpg';
import pastureField2 from '@/assets/images/pasture_field_2.jpg';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const WEED_IDS = ['waterhemp', 'palmer-amaranth', 'lambsquarters', 'giant-ragweed', 'velvetleaf', 'kochia', 'morningglory', 'marestail', 'large-crabgrass', 'green-foxtail'];

const MIN_DIST = 10;

function generateWeedSpots(layout: 'mixed' | 'rows' | 'center' | 'edges' | 'clumped' | 'diagonal' | 'scattered', count: number, seed: number): Array<{ x: number; y: number; weedId: string }> {
  const rng = (i: number) => ((seed * 9301 + 49297 + i * 1277) % 233280) / 233280;
  const spots: Array<{ x: number; y: number; weedId: string }> = [];
  const ids = shuffle(WEED_IDS);
  const maxAttempts = 100;
  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let x: number, y: number;
      const r1 = rng(i * 3 + attempt * 97);
      const r2 = rng(i * 3 + 1 + attempt * 97);
      const r3 = rng(i * 3 + 2 + attempt * 53);
      switch (layout) {
        case 'mixed':
          x = 5 + r1 * 90;
          y = 5 + r2 * 90;
          break;
        case 'rows':
          x = 5 + r1 * 90;
          y = 10 + Math.floor(i / 2) * 18 + (r2 * 12 - 6);
          break;
        case 'center':
          x = 20 + r1 * 60;
          y = 15 + r2 * 70;
          break;
        case 'edges':
          const side = (i + attempt) % 4;
          if (side === 0) { x = 2 + r1 * 12; y = 5 + r2 * 90; }
          else if (side === 1) { x = 86 + r1 * 12; y = 5 + r2 * 90; }
          else if (side === 2) { x = 5 + r1 * 90; y = 2 + r2 * 12; }
          else { x = 5 + r1 * 90; y = 86 + r2 * 12; }
          break;
        case 'clumped': {
          const cx = 20 + (i % 3) * 30;
          const cy = 25 + Math.floor(i / 3) * 30;
          x = cx + (r1 * 20 - 10);
          y = cy + (r2 * 20 - 10);
          break;
        }
        case 'diagonal':
          x = 5 + (i / count) * 85 + (r1 * 15 - 7);
          y = 5 + (i / count) * 85 + (r2 * 15 - 7);
          break;
        case 'scattered':
          x = 3 + r1 * 94;
          y = 3 + r2 * 94;
          break;
      }
      x = Math.max(3, Math.min(97, x!));
      y = Math.max(3, Math.min(97, y!));
      const tooClose = spots.some(s => {
        const dx = s.x - x!; const dy = s.y - y!;
        return Math.sqrt(dx * dx + dy * dy) < MIN_DIST;
      });
      if (!tooClose) {
        spots.push({ x: x!, y: y!, weedId: ids[i % ids.length] });
        placed = true;
        break;
      }
    }
    if (!placed) {
      spots.push({ x: 5 + (i * 11) % 85, y: 5 + (i * 13) % 85, weedId: ids[i % ids.length] });
    }
  }
  return spots;
}

const PATTERNS = [
  { id: 'w', name: 'W-Pattern', desc: 'Walk in a "W" shape across the field — covers center and edges efficiently.', best: ['mixed', 'scattered'] },
  { id: 'z', name: 'Z-Pattern', desc: 'Zig-zag across the field in a "Z" shape — good for long rectangular fields.', best: ['rows', 'diagonal'] },
  { id: 'x', name: 'X-Pattern', desc: 'Walk from corner to corner in an "X" — covers all quadrants.', best: ['center', 'clumped'] },
  { id: 'edge', name: 'Edge Walk', desc: 'Walk around the perimeter — good for spotting boundary-specific weeds.', best: ['edges'] },
];

type WeedLayout = 'mixed' | 'rows' | 'center' | 'edges' | 'clumped' | 'diagonal' | 'scattered';

interface FieldDef {
  id: number;
  crop: 'corn' | 'soybean' | 'pasture';
  weedLayout: WeedLayout;
  label: string;
  bestPattern: string;
  weedCount: number;
  note: string;
}

const FIELDS: FieldDef[] = [
  { id: 1, crop: 'corn', weedLayout: 'mixed', label: 'Square corn field with mixed weed patches throughout', bestPattern: 'w', weedCount: 14, note: 'W-pattern crosses the most ground for mixed distributions.' },
  { id: 2, crop: 'soybean', weedLayout: 'rows', label: 'Long narrow soybean field with weeds along rows', bestPattern: 'z', weedCount: 9, note: 'Z-pattern works best for long fields by crossing each row.' },
  { id: 3, crop: 'pasture', weedLayout: 'center', label: 'Square pasture with weeds concentrated in the center', bestPattern: 'x', weedCount: 18, note: 'X-pattern hits the center where the weeds are concentrated.' },
  { id: 4, crop: 'pasture', weedLayout: 'edges', label: 'Irregularly shaped field with weed pressure on edges', bestPattern: 'edge', weedCount: 7, note: 'Edge walks catch boundary weeds that other patterns miss.' },
  { id: 5, crop: 'corn', weedLayout: 'clumped', label: 'Corn field with clustered weed patches in 2-3 spots', bestPattern: 'x', weedCount: 12, note: 'X-pattern finds clumped patches by crossing through them.' },
  { id: 6, crop: 'soybean', weedLayout: 'diagonal', label: 'Soybean field with weeds spreading diagonally from a corner', bestPattern: 'z', weedCount: 10, note: 'Z-pattern catches diagonal spreads across the field.' },
  { id: 7, crop: 'corn', weedLayout: 'scattered', label: 'Large corn field with randomly scattered weeds', bestPattern: 'w', weedCount: 16, note: 'W-pattern is most efficient for randomly scattered weeds.' },
  { id: 8, crop: 'pasture', weedLayout: 'edges', label: 'Pasture with heavy weed pressure along fence lines', bestPattern: 'edge', weedCount: 11, note: 'Fence-line weeds are best found with an edge walk.' },
  { id: 9, crop: 'soybean', weedLayout: 'center', label: 'Soybean field with a dense weed patch in the middle', bestPattern: 'x', weedCount: 15, note: 'The X-pattern crosses through the center where weeds are densest.' },
  { id: 10, crop: 'corn', weedLayout: 'rows', label: 'Corn field with weeds emerging between crop rows', bestPattern: 'z', weedCount: 13, note: 'Z-pattern effectively crosses between rows to find emerging weeds.' },
];

const CROP_IMAGES: Record<string, string[]> = {
  corn: [cornField1, cornField2],
  soybean: [soybeanField1],
  pasture: [pastureField1, pastureField2],
};

const TOTAL_ROUNDS = 10;

export default function FieldScout({ onBack }: { onBack: () => void }) {
  const fieldOrder = useMemo(() => {
    const shuffled = shuffle([...FIELDS]);
    // Ensure we have 10 rounds — repeat if needed
    const result: FieldDef[] = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      result.push(shuffled[i % shuffled.length]);
    }
    return result;
  }, []);

  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [scouting, setScouting] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const finished = round >= TOTAL_ROUNDS;
  const field = !finished ? fieldOrder[round] : fieldOrder[0];

  const weedSpots = useMemo(() => {
    if (finished) return [];
    return generateWeedSpots(field.weedLayout, field.weedCount, field.id * 17 + round * 31);
  }, [round, finished]);

  const cropImg = useMemo(() => {
    if (finished) return '';
    const imgs = CROP_IMAGES[field.crop] || CROP_IMAGES.corn;
    return imgs[round % imgs.length];
  }, [round, finished]);

  const select = (pId: string) => {
    if (scouting || done) return;
    setChosen(pId);
  };

  const scout = () => {
    if (!chosen) return;
    setScouting(true);
    setTimeout(() => {
      setScouting(false);
      setDone(true);
      if (chosen === field.bestPattern) setScore(s => s + 1);
    }, 2000);
  };

  const next = () => { setRound(r => r + 1); setChosen(null); setDone(false); };
  const restart = () => { setRound(0); setChosen(null); setDone(false); setScore(0); };

  if (finished) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Scouting Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{TOTAL_ROUNDS} best patterns chosen</p>
        <p className="text-sm text-muted-foreground mb-4">Fields are shuffled each time you play.</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  const isCorrect = chosen === field.bestPattern;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Field Scout</h1>
        <span className="text-sm text-muted-foreground">Field {round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative w-full aspect-[3/2] rounded-xl border-2 border-border mb-4 overflow-hidden">
          <img src={cropImg} alt="Aerial field view" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          {weedSpots.map((spot, i) => (
            <div key={i} className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md overflow-hidden" style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%,-50%)' }}>
              <WeedImage weedId={spot.weedId} stage="vegetative" className="w-full h-full object-cover" />
            </div>
          ))}
          {scouting && chosen && (
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
              {chosen === 'w' && <polyline points="20,180 75,40 150,160 225,40 280,180" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className="animate-pulse" />}
              {chosen === 'z' && <polyline points="20,40 280,40 20,180 280,180" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className="animate-pulse" />}
              {chosen === 'x' && <><line x1="20" y1="20" x2="280" y2="180" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className="animate-pulse" /><line x1="280" y1="20" x2="20" y2="180" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className="animate-pulse" /></>}
              {chosen === 'edge' && <rect x="20" y="20" width="260" height="160" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className="animate-pulse" />}
            </svg>
          )}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 rounded-lg p-2">
            <p className="text-xs text-foreground font-medium">{field.label}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 text-center">Choose the best scouting pattern for this field</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {PATTERNS.map(p => (
            <button key={p.id} onClick={() => select(p.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                done ? (p.id === field.bestPattern ? 'border-green-500 bg-green-500/10' : p.id === chosen ? 'border-destructive bg-destructive/10' : 'border-border bg-card')
                : chosen === p.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}>
              <span className="font-bold text-sm text-foreground">{p.name}</span>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>

        {!done && chosen && !scouting && (
          <button onClick={scout} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Scout the Field</button>
        )}
        {scouting && <p className="text-center text-primary font-bold animate-pulse">Scouting in progress...</p>}
        {done && (
          <div className="text-center">
            <p className={`font-bold mb-1 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {isCorrect ? 'Great choice!' : `The best pattern was: ${PATTERNS.find(p => p.id === field.bestPattern)?.name}`}
            </p>
            <p className="text-sm text-muted-foreground mb-1">Weeds spotted: {field.weedCount}</p>
            <p className="text-sm text-muted-foreground mb-4">{field.note}</p>
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Field</button>
          </div>
        )}
      </div>
    </div>
  );
}
