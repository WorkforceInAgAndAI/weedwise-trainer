import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

const HABITAT_OPTIONS = [
 { key: 'Warm-Season / Full Sun', icon: '', label: 'Warm-Season / Full Sun' },
 { key: 'Cool-Season / Early Spring', icon: '', label: 'Cool-Season / Early Spring' },
 { key: 'Wet / Poorly Drained', icon: '', label: 'Wet / Poorly Drained' },
 { key: 'Dry / Disturbed', icon: '', label: 'Dry / Disturbed' },
];

const PAIR_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];

interface Props {
 onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
 onNext: () => void;
}

export default function HabitatConnect({ onComplete, onNext }: Props) {
 const { picked, habitats } = useMemo(() => {
 // Pick 4 weeds, one from each habitat if possible
 const byHab: Record<string, typeof weeds> = {};
 for (const w of weeds) {
 const hab = HABITAT_OPTIONS.find(h => w.primaryHabitat.startsWith(h.key.split(' ')[0]));
 const key = hab?.key || w.primaryHabitat;
 if (!byHab[key]) byHab[key] = [];
 byHab[key].push(w);
 }

 const selected: typeof weeds[number][] = [];
 const usedHabs = new Set<string>();

 // Try to get one from each habitat
 for (const hab of HABITAT_OPTIONS) {
 const candidates = byHab[hab.key];
 if (candidates && candidates.length > 0) {
 const pick = candidates[Math.floor(Math.random() * candidates.length)];
 selected.push(pick);
 usedHabs.add(hab.key);
 }
 }

 // Fill remaining slots if needed
 while (selected.length < 4) {
 const remaining = weeds.filter(w => !selected.some(s => s.id === w.id));
 if (remaining.length === 0) break;
 selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
 }

 // Shuffle
 for (let i = selected.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [selected[i], selected[j]] = [selected[j], selected[i]];
 }

 return { picked: selected, habitats: [...HABITAT_OPTIONS].sort(() => Math.random() - 0.5) };
 }, []);

 const [connections, setConnections] = useState<Record<string, string>>({});
 const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const getCorrectHabitat = (weedId: string) => {
 const w = picked.find(p => p.id === weedId);
 if (!w) return '';
 return w.primaryHabitat;
 };

 const getConnectionIndex = (weedId: string) => {
 const entries = Object.entries(connections);
 return entries.findIndex(([k]) => k === weedId);
 };

 const getRightConnectionIndex = (habKey: string) => {
 const entries = Object.entries(connections);
 return entries.findIndex(([, v]) => v === habKey);
 };

 const handleLeftClick = (id: string) => {
 if (checked) return;
 setSelectedLeft(selectedLeft === id ? null : id);
 };

 const handleRightClick = (habKey: string) => {
 if (checked || !selectedLeft) return;
 const newConn = { ...connections };
 // Allow many-to-one (multiple weeds can share a habitat)
 newConn[selectedLeft] = habKey;
 setConnections(newConn);
 setSelectedLeft(null);
 };

 const handleCheck = () => {
 setChecked(true);
 onComplete(picked.map(w => ({
 weedId: w.id,
 correct: connections[w.id] === getCorrectHabitat(w.id),
 })));
 };

 const allConnected = Object.keys(connections).length === picked.length;
 const correctCount = checked ? picked.filter(w => connections[w.id] === getCorrectHabitat(w.id)).length : 0;

 return (
 <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
 <div>
 <h2 className="font-display font-bold text-lg text-foreground"> Habitat Connect</h2>
 <p className="text-sm text-muted-foreground">Tap a weed on the left, then tap its habitat on the right to connect them.</p>
 </div>

 <div className="flex gap-4">
 {/* Left column - weeds with images */}
 <div className="flex-1 space-y-2">
 {picked.map(w => {
 const connIdx = getConnectionIndex(w.id);
 const isConnected = connIdx >= 0;
 return (
 <button key={w.id} onClick={() => handleLeftClick(w.id)}
 className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
 checked
 ? (connections[w.id] === getCorrectHabitat(w.id) ? 'border-accent bg-accent/10' : 'border-destructive bg-destructive/10')
 : selectedLeft === w.id ? 'border-primary bg-primary/10'
 : isConnected ? 'border-foreground/30 bg-secondary' : 'border-border hover:border-primary/50'
 }`}>
 <div className="flex items-center gap-3">
 {isConnected && <span className={`w-4 h-4 rounded-full ${PAIR_COLORS[connIdx % PAIR_COLORS.length]} shrink-0`} />}
 <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
 <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
 </div>
 <span className="text-sm font-semibold text-foreground">{w.commonName}</span>
 </div>
 </button>
 );
 })}
 </div>

 {/* Right column - habitats */}
 <div className="flex-1 space-y-2">
 {habitats.map(hab => {
 const connIdx = getRightConnectionIndex(hab.key);
 const isConnected = connIdx >= 0;
 // Count how many weeds are connected to this habitat
 const connCount = Object.values(connections).filter(v => v === hab.key).length;
 return (
 <button key={hab.key} onClick={() => handleRightClick(hab.key)}
 disabled={checked || !selectedLeft}
 className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
 checked ? 'border-border opacity-70'
 : isConnected ? 'border-foreground/30 bg-secondary' : selectedLeft ? 'border-border hover:border-primary/50 cursor-pointer' : 'border-border cursor-default'
 }`}>
 <div className="flex items-center gap-2">
 {isConnected && (
 <div className="flex gap-0.5">
 {Object.entries(connections).filter(([, v]) => v === hab.key).map(([k], i) => (
 <span key={k} className={`w-3 h-3 rounded-full ${PAIR_COLORS[Object.keys(connections).indexOf(k) % PAIR_COLORS.length]}`} />
 ))}
 </div>
 )}
 <span className="text-lg">{hab.icon}</span>
 <span className="text-sm font-medium text-foreground">{hab.label}</span>
 {connCount > 0 && <span className="ml-auto text-xs text-muted-foreground">({connCount})</span>}
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {!checked && allConnected && (
 <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
 Check Connections
 </button>
 )}

 {checked && (
 <div className="rounded-lg p-4 space-y-3 animate-scale-in border border-border bg-muted/30">
 <div className={`text-lg font-bold ${correctCount === picked.length ? 'text-accent' : correctCount >= picked.length / 2 ? 'text-primary' : 'text-destructive'}`}>
 {correctCount === picked.length ? ' Perfect!' : `${correctCount}/${picked.length} Correct`}
 </div>
 {picked.map(w => {
 const isCorrect = connections[w.id] === getCorrectHabitat(w.id);
 const userHab = HABITAT_OPTIONS.find(h => h.key === connections[w.id]);
 const correctHab = HABITAT_OPTIONS.find(h => h.key === getCorrectHabitat(w.id));
 return (
 <div key={w.id} className={`flex items-center gap-3 p-2 rounded-lg ${isCorrect ? 'bg-accent/10' : 'bg-destructive/10'}`}>
 <span className="text-sm">{isCorrect ? '' : ''}</span>
 <div className="w-8 h-8 rounded overflow-hidden shrink-0">
 <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
 </div>
 <div className="flex-1 min-w-0">
 <span className="text-sm font-semibold text-foreground">{w.commonName}</span>
 {!isCorrect && (
 <p className="text-xs text-muted-foreground">
 Your answer: {userHab?.icon} {userHab?.label} → Correct: {correctHab?.icon} {correctHab?.label}
 </p>
 )}
 </div>
 </div>
 );
 })}
 <div className="bg-primary/10 rounded-lg p-3 text-xs text-foreground space-y-1">
 {picked.map(w => (
 <p key={w.id}><span className="font-semibold text-primary"> {w.commonName}:</span> {w.memoryHook}</p>
 ))}
 </div>
 <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
 </div>
 )}
 </div>
 );
}
