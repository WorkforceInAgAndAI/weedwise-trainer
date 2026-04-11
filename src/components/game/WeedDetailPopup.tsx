import { useMemo } from 'react';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';
import { X } from 'lucide-react';
import { getSessionCitations } from '@/data/imageReferences';

interface Props {
 weed: Weed;
 onClose: () => void;
}

export default function WeedDetailPopup({ weed, onClose }: Props) {
 const isGrass = weed.plantType === 'Monocot';

 return (
 <div className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
 <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-card-hover animate-scale-in" onClick={e => e.stopPropagation()}>
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-xl font-display font-bold text-foreground">{weed.commonName}</h2>
 <p className="text-sm text-primary italic">{weed.scientificName}</p>
 <p className="text-xs text-muted-foreground mt-0.5">EPPO: {weed.eppoCode} · {weed.family}</p>
 </div>
 <button onClick={onClose} className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Image gallery */}
  {(() => {
    const hasSeeds = weed.id !== 'Field_Horsetail';
    const stages = hasSeeds ? ['seed', 'seedling', 'vegetative', 'flower', 'whole'] as const : ['seedling', 'vegetative', 'flower', 'whole'] as const;
    const colCount = stages.length + (isGrass ? 1 : 0);
    return (
      <div className={`grid grid-cols-3 sm:grid-cols-${colCount} gap-2`}>
        {stages.map(stage => (
          <div key={stage} className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground uppercase text-center tracking-wider">
              {stage === 'seed' ? 'Seed' : stage === 'whole' ? 'Whole Plant' : stage === 'flower' ? 'Reproductive' : stage.charAt(0).toUpperCase() + stage.slice(1)}
            </div>
            <div className="aspect-square rounded-md overflow-hidden bg-muted">
              <WeedImage weedId={weed.id} stage={stage} className="w-full h-full" />
            </div>
          </div>
        ))}
        {isGrass && (
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-muted-foreground uppercase text-center tracking-wider">Ligule</div>
            <div className="aspect-square rounded-md overflow-hidden bg-muted">
              <WeedImage weedId={weed.id} stage="ligule" className="w-full h-full" />
            </div>
          </div>
        )}
      </div>
    );
  })()}

  {/* Tags */}
 <div className="flex flex-wrap gap-1.5">
 <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">{weed.plantType}</span>
 <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">{weed.lifeCycle}</span>
 <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">{weed.origin}</span>
 <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-medium">{weed.primaryHabitat}</span>
 </div>

 {weed.safetyNote && (
 <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-sm text-foreground">
 {weed.safetyNote}
 </div>
 )}

 <div>
 <h3 className="text-sm font-semibold text-foreground mb-2">Identifying Traits</h3>
 <ul className="space-y-1">
 {weed.traits.map((t, i) => (
 <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
 <span className="text-primary mt-0.5">·</span>{t}
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h3 className="text-sm font-semibold text-foreground mb-1">Habitat</h3>
 <p className="text-sm text-muted-foreground">{weed.habitat}</p>
 </div>

 <div>
 <h3 className="text-sm font-semibold text-foreground mb-1">Management</h3>
 <p className="text-sm text-muted-foreground">{weed.management}</p>
 <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Timing:</span> {weed.controlTiming}</p>
 {weed.actImmediately && (
 <p className="text-sm text-destructive mt-1">Act Immediately: {weed.actReason}</p>
 )}
 </div>

 <div className="bg-secondary rounded-md p-3">
 <h3 className="text-sm font-semibold text-foreground mb-1">Look-Alike: {weed.lookAlike.species}</h3>
 <p className="text-sm text-muted-foreground">{weed.lookAlike.difference}</p>
 </div>

  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
  <h3 className="text-sm font-semibold text-primary mb-1">Memory Hook</h3>
  <p className="text-sm text-foreground">{weed.memoryHook}</p>
  </div>

  {/* Image References for this species */}
  <WeedCitations weedId={weed.id} />
  </div>
  </div>
  );
}

function WeedCitations({ weedId }: { weedId: string }) {
  const citations = useMemo(() => {
    const stages = weedId === 'Field_Horsetail'
      ? ['whole', 'seedling', 'vegetative', 'flower', 'ligule']
      : ['seed', 'whole', 'seedling', 'vegetative', 'flower', 'ligule'];
    return getSessionCitations([weedId], stages);
  }, [weedId]);

  if (citations.length === 0) return null;

  return (
    <div className="border-t border-border pt-3">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Image References</h3>
      <ol className="list-decimal list-inside space-y-0.5">
        {citations.map((c, i) => (
          <li key={i} className="text-[10px] leading-relaxed text-muted-foreground break-words">{c}</li>
        ))}
      </ol>
    </div>
  );
}
