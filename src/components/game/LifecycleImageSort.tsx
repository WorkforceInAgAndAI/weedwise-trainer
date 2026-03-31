import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import { getImageSrc } from './WeedImage';

const STAGES = ['seed', 'seedling', 'vegetative', 'flower'] as const;

interface SortImage {
 id: string;
 weedId: string;
 src: string;
 stageLabel: string;
}

interface Props {
 onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
 onNext: () => void;
}

export default function LifecycleImageSort({ onComplete, onNext }: Props) {
 const { categories, images } = useMemo(() => {
 const picked = [...weeds].sort(() => Math.random() - 0.5).slice(0, 3);
 const cats = picked.map(w => ({ id: w.id, name: w.commonName }));
 const imgs: SortImage[] = [];
 picked.forEach(w => {
 STAGES.forEach(stage => {
 const variant = (Math.random() < 0.5 ? 1 : 2) as 1 | 2;
 imgs.push({
 id: `${w.id}-${stage}`,
 weedId: w.id,
 src: getImageSrc(w.id, stage, variant),
 stageLabel: stage,
 });
 });
 });
 // Shuffle images
 for (let i = imgs.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
 }
 return { categories: cats, images: imgs };
 }, []);

 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);

 const unplaced = images.filter(img => !placements[img.id]);

 const handleCatClick = (catId: string) => {
 if (checked || !selected) return;
 setPlacements(prev => ({ ...prev, [selected]: catId }));
 setSelected(null);
 };

 const handleRemove = (imgId: string) => {
 if (checked) return;
 setPlacements(prev => { const n = { ...prev }; delete n[imgId]; return n; });
 };

 const handleCheck = () => {
 setChecked(true);
 const imgResults = images.map(img => ({
 weedId: img.weedId,
 correct: placements[img.id] === img.weedId,
 }));
 // Deduplicate by weedId — correct only if ALL images for that weed are correct
 const byWeed: Record<string, boolean> = {};
 imgResults.forEach(r => {
 if (byWeed[r.weedId] === undefined) byWeed[r.weedId] = true;
 if (!r.correct) byWeed[r.weedId] = false;
 });
 onComplete(Object.entries(byWeed).map(([weedId, correct]) => ({ weedId, correct })));
 };

 const correctCount = checked ? images.filter(img => placements[img.id] === img.weedId).length : 0;

 return (
 <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
 <div>
 <h2 className="font-display font-bold text-lg text-foreground"> Life Stage Image Sort</h2>
 <p className="text-sm text-muted-foreground">Sort these growth stage images into the correct species. Tap an image, then tap the species it belongs to.</p>
 </div>

 {/* Category bins */}
 <div className="grid grid-cols-3 gap-3">
 {categories.map(cat => {
 const catImgs = images.filter(img => placements[img.id] === cat.id);
 return (
 <button key={cat.id} onClick={() => handleCatClick(cat.id)}
 className={`p-3 rounded-xl border-2 border-border text-left transition-all min-h-[100px] bg-secondary/30 ${selected && !checked ? 'hover:border-primary/50 cursor-pointer' : 'cursor-default'}`}>
 <div className="text-sm font-bold text-foreground mb-2">{cat.name}</div>
 <div className="grid grid-cols-3 gap-1">
 {catImgs.map(img => (
 <div key={img.id} onClick={e => { e.stopPropagation(); handleRemove(img.id); }}
 className={`h-12 rounded overflow-hidden cursor-pointer relative ${
 checked ? (img.weedId === cat.id ? 'ring-2 ring-accent' : 'ring-2 ring-destructive opacity-60') : 'hover:opacity-75'
 }`}>
 <img src={img.src} alt="" className="w-full h-full object-cover" />
 {!checked && <span className="absolute top-0 right-0 text-[8px] bg-destructive/80 text-destructive-foreground px-1 rounded-bl"></span>}
 </div>
 ))}
 </div>
 </button>
 );
 })}
 </div>

 {/* Unsorted images */}
 {unplaced.length > 0 && (
 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
 {unplaced.map(img => (
 <button key={img.id} onClick={() => setSelected(selected === img.id ? null : img.id)}
 className={`rounded-lg border-2 overflow-hidden transition-all h-24 ${
 selected === img.id ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-border hover:border-primary/50'
 }`}>
 <img src={img.src} alt="" className="w-full h-full object-cover" />
 </button>
 ))}
 </div>
 )}

 {!checked && unplaced.length === 0 && (
 <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
 Check Answers
 </button>
 )}

 {checked && (
 <div className="rounded-lg p-4 space-y-2 animate-scale-in border border-border bg-muted/30">
 <div className="text-lg font-bold text-foreground">{correctCount}/{images.length} Images Correct!</div>
 <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
 </div>
 )}
 </div>
 );
}
