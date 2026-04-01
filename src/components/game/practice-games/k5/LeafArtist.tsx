import { useState, useRef, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { supabase } from '@/integrations/supabase/client';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const venationTypes = [
 { type: 'Parallel', plantType: 'Monocot', description: 'Lines run side by side from base to tip (like grass)', shape: 'Long and narrow (linear)' },
 { type: 'Netted', plantType: 'Dicot', description: 'Veins branch out like a net from a central line', shape: 'Wide and rounded (ovate or heart-shaped)' },
];

const STUDY_TIME = 8; // seconds to view the image

export default function LeafArtist({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const [drawing, setDrawing] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [grading, setGrading] = useState(false);
 const [aiGrade, setAiGrade] = useState<{ score: number; feedback: string } | null>(null);
 const [roundIdx, setRoundIdx] = useState(0);
 const [studyTimer, setStudyTimer] = useState(STUDY_TIME);
 const [studyDone, setStudyDone] = useState(false);

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

 // Study timer countdown
 useEffect(() => {
 if (studyDone || done) return;
 if (studyTimer <= 0) { setStudyDone(true); return; }
 const t = setTimeout(() => setStudyTimer(s => s - 1), 1000);
 return () => clearTimeout(t);
 }, [studyTimer, studyDone, done]);

 // Init canvas
 useEffect(() => {
 const c = canvasRef.current;
 if (!c) return;
 const ctx = c.getContext('2d');
 if (!ctx) return;
 ctx.fillStyle = '#f5f3ef';
 ctx.fillRect(0, 0, c.width, c.height);
 }, [roundIdx, studyDone]);

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
 if (submitted || !studyDone) return;
 setDrawing(true);
 const ctx = canvasRef.current?.getContext('2d');
 if (!ctx) return;
 const { x, y } = getPos(e);
 ctx.beginPath();
 ctx.moveTo(x, y);
 ctx.lineWidth = 3;
 ctx.strokeStyle = '#2d5016';
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
 ctx.fillStyle = '#f5f3ef';
 ctx.fillRect(0, 0, c.width, c.height);
 };

 const submitDrawing = async () => {
 setSubmitted(true);
 setGrading(true);

 const c = canvasRef.current;
 if (!c) { setGrading(false); return; }

 try {
 const dataUrl = c.toDataURL('image/png');
 const base64 = dataUrl.split(',')[1];

 const { data, error } = await supabase.functions.invoke('grade-drawing', {
 body: { imageBase64: base64, venationType: round.venation.type, weedName: round.weed.commonName },
 });

 if (error) throw error;
 setAiGrade(data);
 } catch (err) {
 console.error('AI grading error:', err);
 setAiGrade({ score: 2, feedback: 'Nice work on your leaf drawing!' });
 } finally {
 setGrading(false);
 }
 };

 const nextRound = () => {
 setRoundIdx(i => i + 1);
 setSubmitted(false);
 setAiGrade(null);
 setStudyTimer(STUDY_TIME);
 setStudyDone(false);
 };

 const restart = () => {
 setRoundIdx(0);
 setSubmitted(false);
 setAiGrade(null);
 setStudyTimer(STUDY_TIME);
 setStudyDone(false);
 };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 const gradeLabels = ['', 'Keep Practicing', 'Good Try', 'Great Job'];
 const gradeColors = ['', 'text-warning', 'text-primary', 'text-success'];

 if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-display font-bold text-foreground text-lg flex-1">Leaf Artist</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 <span className="text-sm text-muted-foreground">Round {roundIdx + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <div className="max-w-lg mx-auto space-y-4">
 {/* Instructions */}
 <div className="bg-secondary/50 rounded-xl p-4">
 <p className="text-sm font-bold text-foreground mb-1">
 Draw a leaf with <span className="text-primary">{round.venation.type} venation</span>
 </p>
 <p className="text-xs text-muted-foreground">{round.venation.description}</p>
 <p className="text-xs text-muted-foreground mt-1">Leaf shape: {round.venation.shape}</p>
 </div>

 {/* Study phase: show image */}
 {!studyDone && (
 <div className="text-center space-y-3">
 <p className="text-sm font-medium text-foreground">Study this leaf — {studyTimer}s remaining</p>
 <div className="w-full max-w-xs mx-auto aspect-square rounded-xl overflow-hidden border-2 border-primary/30 bg-secondary">
 <WeedImage weedId={round.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 <p className="text-xs text-muted-foreground">{round.weed.commonName}</p>
 <button onClick={() => { setStudyTimer(0); setStudyDone(true); }}
 className="text-xs text-primary hover:underline">I'm ready to draw</button>
 </div>
 )}

 {/* Drawing phase: full-width canvas */}
 {studyDone && (
 <>
 <div>
 <div className="flex justify-between items-center mb-2">
 <p className="text-sm font-medium text-foreground">Now draw from memory!</p>
 {!submitted && <button onClick={clearCanvas} className="text-xs text-destructive hover:underline">Clear</button>}
 </div>
 <canvas
 ref={canvasRef}
 width={500} height={500}
 className="w-full aspect-square rounded-xl border-2 border-border cursor-crosshair touch-none bg-background"
 onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
 onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
 />
 </div>

 {!submitted ? (
 <button onClick={submitDrawing} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
 Submit Drawing
 </button>
 ) : grading ? (
 <div className="text-center py-6">
 <div className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
 <p className="text-sm text-muted-foreground">AI is grading your drawing...</p>
 </div>
 ) : aiGrade ? (
 <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
 <p className={`text-xl font-display font-bold ${gradeColors[aiGrade.score]}`}>
 {gradeLabels[aiGrade.score]}
 </p>
 <p className="text-sm text-muted-foreground">{aiGrade.feedback}</p>
 <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
 Next Leaf →
 </button>
 </div>
 ) : null}
 </>
 )}
 </div>
 </div>
 </div>
 );
}
