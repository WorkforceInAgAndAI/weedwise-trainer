import { useState, useMemo } from 'react';
import { Scan, Radio, Footprints, Satellite } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import WeedImage from '@/components/game/WeedImage';
import cornField1 from '@/assets/images/corn_field_1.jpg';
import cornField2 from '@/assets/images/corn_field_2.jpg';
import soybeanField1 from '@/assets/images/soybean_field_1.jpg';
import pastureField1 from '@/assets/images/pasture_field_1.jpg';
import pastureField2 from '@/assets/images/pasture_field_2.jpg';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const WEED_IDS = ['waterhemp', 'palmer-amaranth', 'lambsquarters', 'giant-ragweed', 'velvetleaf', 'kochia', 'morningglory', 'marestail', 'large-crabgrass', 'green-foxtail'];

const MIN_DIST = 10;

type WeedLayout = 'mixed' | 'rows' | 'center' | 'edges' | 'clumped' | 'diagonal' | 'scattered';

function generateWeedSpots(layout: WeedLayout, count: number, seed: number): Array<{ x: number; y: number; weedId: string }> {
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
      switch (layout) {
        case 'mixed': x = 5 + r1 * 90; y = 5 + r2 * 90; break;
        case 'rows': x = 5 + r1 * 90; y = 10 + Math.floor(i / 2) * 18 + (r2 * 12 - 6); break;
        case 'center': x = 20 + r1 * 60; y = 15 + r2 * 70; break;
        case 'edges': {
          const side = (i + attempt) % 4;
          if (side === 0) { x = 2 + r1 * 12; y = 5 + r2 * 90; }
          else if (side === 1) { x = 86 + r1 * 12; y = 5 + r2 * 90; }
          else if (side === 2) { x = 5 + r1 * 90; y = 2 + r2 * 12; }
          else { x = 5 + r1 * 90; y = 86 + r2 * 12; }
          break;
        }
        case 'clumped': {
          const cx = 20 + (i % 3) * 30;
          const cy = 25 + Math.floor(i / 3) * 30;
          x = cx + (r1 * 20 - 10); y = cy + (r2 * 20 - 10); break;
        }
        case 'diagonal':
          x = 5 + (i / count) * 85 + (r1 * 15 - 7); y = 5 + (i / count) * 85 + (r2 * 15 - 7); break;
        case 'scattered':
          x = 3 + r1 * 94; y = 3 + r2 * 94; break;
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
    if (!placed) spots.push({ x: 5 + (i * 11) % 85, y: 5 + (i * 13) % 85, weedId: ids[i % ids.length] });
  }
  return spots;
}

const TOOLS = [
  { id: 'drone', name: 'Drone', Icon: Radio, desc: 'Aerial survey — best for large open fields', best: ['large', 'open'] },
  { id: 'rover', name: 'Rover', Icon: Scan, desc: 'Ground robot — best for row crops and precise mapping', best: ['row', 'precise'] },
  { id: 'manual', name: 'Manual Scouting', Icon: Footprints, desc: 'Walking with hand tools — best for small or irregular fields', best: ['small', 'irregular'] },
  { id: 'satellite', name: 'Satellite / Remote', Icon: Satellite, desc: 'Satellite imagery — best for monitoring large areas over time', best: ['monitor', 'vast'] },
];

interface FieldDef {
  id: number;
  desc: string;
  bestTool: string;
  note: string;
  crop: 'corn' | 'soybean' | 'pasture';
  weedLayout: WeedLayout;
  weedCount: number;
}

const FIELDS: FieldDef[] = [
  { id: 1, desc: 'A 500-acre flat corn field with suspected herbicide-resistant patches across the center.', bestTool: 'drone', note: 'A drone can quickly survey the large flat area and identify resistant patches via NDVI imaging.', crop: 'corn', weedLayout: 'center', weedCount: 12 },
  { id: 2, desc: 'A 2-acre organic vegetable garden with narrow raised beds and mixed crops.', bestTool: 'manual', note: 'Small, irregular area with obstacles makes manual scouting the most practical approach.', crop: 'soybean', weedLayout: 'mixed', weedCount: 6 },
  { id: 3, desc: 'A 200-acre soybean field with uniform row spacing needing precise weed density counts.', bestTool: 'rover', note: 'A ground rover can navigate between rows and provide precise per-plant weed density data.', crop: 'soybean', weedLayout: 'rows', weedCount: 10 },
  { id: 4, desc: 'A 10,000-acre ranch needing seasonal weed spread monitoring across multiple pastures.', bestTool: 'satellite', note: 'Satellite imagery is ideal for monitoring vast areas over time without physical access.', crop: 'pasture', weedLayout: 'scattered', weedCount: 18 },
  { id: 5, desc: 'A 50-acre wheat field surrounded by trees with gusty wind conditions.', bestTool: 'manual', note: 'Wind makes drone flight dangerous, and the moderate size is manageable for manual scouting.', crop: 'corn', weedLayout: 'edges', weedCount: 8 },
  { id: 6, desc: 'A 1,200-acre corn field with weeds concentrated along irrigation channels.', bestTool: 'drone', note: 'A drone can follow irrigation lines and quickly map weed density along them.', crop: 'corn', weedLayout: 'rows', weedCount: 14 },
  { id: 7, desc: 'A 5-acre pumpkin patch with irregular spacing and hand-planted rows.', bestTool: 'manual', note: 'The small, irregularly planted area is best scouted on foot with hand tools.', crop: 'soybean', weedLayout: 'clumped', weedCount: 7 },
  { id: 8, desc: 'A 300-acre soybean field needing precise weed counts at each growth stage.', bestTool: 'rover', note: 'A rover can methodically traverse rows and log precise weed counts per zone.', crop: 'soybean', weedLayout: 'diagonal', weedCount: 11 },
  { id: 9, desc: 'A 15,000-acre cattle ranch monitoring invasive spread over 3 years.', bestTool: 'satellite', note: 'Satellite time-series imagery is the only practical way to monitor such vast areas over years.', crop: 'pasture', weedLayout: 'scattered', weedCount: 20 },
  { id: 10, desc: 'A 100-acre pasture with weed clusters near water troughs and fence posts.', bestTool: 'drone', note: 'A drone can quickly identify weed clusters around infrastructure without disturbing livestock.', crop: 'pasture', weedLayout: 'clumped', weedCount: 9 },
];

const CROP_IMAGES: Record<string, string[]> = {
  corn: [cornField1, cornField2],
  soybean: [soybeanField1],
  pasture: [pastureField1, pastureField2],
};

const TOTAL_ROUNDS = 10;

export default function FieldScoutTools({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const rounds = useMemo(() => shuffle([...FIELDS]).slice(0, TOTAL_ROUNDS), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [scouted, setScouted] = useState(false);
  const [showToolAnim, setShowToolAnim] = useState(false);
  const [score, setScore] = useState(0);
  const done = idx >= rounds.length;

  const currentField = !done ? rounds[idx] : rounds[0];

  const weedSpots = useMemo(() => {
    if (done) return [];
    return generateWeedSpots(currentField.weedLayout, currentField.weedCount, currentField.id * 17 + idx * 31);
  }, [idx, done]);

  const cropImg = useMemo(() => {
    if (done) return '';
    const imgs = CROP_IMAGES[currentField.crop] || CROP_IMAGES.corn;
    return imgs[idx % imgs.length];
  }, [idx, done]);

  const select = (tId: string) => { if (!scouted) setPicked(tId); };
  const scout = () => {
    setScouted(true);
    setShowToolAnim(true);
    if (picked === currentField.bestTool) setScore(s => s + 1);
    setTimeout(() => setShowToolAnim(false), 2500);
  };
  const next = () => { setIdx(i => i + 1); setPicked(null); setScouted(false); setShowToolAnim(false); };
  const restart = () => { setIdx(0); setPicked(null); setScouted(false); setShowToolAnim(false); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'hs-field-scout', gameName: 'Field Scout Tools', level: 'HS', score, total: rounds.length });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Footprints className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Scouting Complete!</h2>
        <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
        <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const f = currentField;
  const PickedIcon = TOOLS.find(t => t.id === picked)?.Icon;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Field Scout Tools</h1>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        </div>

        {/* Field image with weeds */}
        <div className="relative w-full aspect-[3/2] rounded-xl border-2 border-border mb-4 overflow-hidden">
          <img src={cropImg} alt="Field view" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          {weedSpots.map((spot, i) => (
            <div key={i} className="absolute w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-md overflow-hidden"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%,-50%)' }}>
              <WeedImage weedId={spot.weedId} stage="vegetative" className="w-full h-full object-cover" />
            </div>
          ))}
          {/* Tool animation overlay */}
          {showToolAnim && PickedIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 rounded-full p-4 animate-pulse">
                <PickedIcon className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 bg-background/80 rounded-lg p-2">
            <p className="text-xs text-foreground font-medium">{f.desc}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 text-center">Which scouting tool is best for this field?</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {TOOLS.map(t => {
            const ToolIcon = t.Icon;
            let cls = 'border-border bg-card';
            if (scouted && !showToolAnim && t.id === f.bestTool) cls = 'border-green-500 bg-green-500/20';
            else if (scouted && !showToolAnim && t.id === picked && t.id !== f.bestTool) cls = 'border-destructive bg-destructive/20';
            else if (picked === t.id) cls = 'border-primary bg-primary/10';
            return (
              <button key={t.id} onClick={() => select(t.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${cls}`}>
                <ToolIcon className="w-8 h-8 mx-auto mb-1 text-foreground" />
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
              </button>
            );
          })}
        </div>
        {!scouted && picked && <button onClick={scout} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Scout!</button>}
        {scouted && !showToolAnim && (
          <div>
            <div className={`rounded-xl p-3 mb-3 ${picked === f.bestTool ? 'bg-green-500/10 border border-green-500' : 'bg-destructive/10 border border-destructive'}`}>
              <p className={`text-sm font-bold ${picked === f.bestTool ? 'text-green-600' : 'text-destructive'}`}>
                {picked === f.bestTool ? 'Correct!' : `Better choice: ${TOOLS.find(t => t.id === f.bestTool)?.name}`}
              </p>
              <p className="text-sm text-foreground mt-1">{f.note}</p>
            </div>
            <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next Field</button>
          </div>
        )}
      </div>
    </div>
  );
}
