import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

interface Props {
  weed: Weed;
  onClose: () => void;
}

export default function WeedDetailPopup({ weed, onClose }: Props) {
  const isGrass = weed.plantType === 'Monocot';

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">{weed.commonName}</h2>
            <p className="text-sm text-primary italic">{weed.scientificName}</p>
            <p className="text-xs text-muted-foreground">EPPO: {weed.eppoCode} • {weed.family}</p>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg border border-border hover:bg-secondary text-sm">✕</button>
        </div>

        {/* Image gallery - all stages */}
        <div className={`grid ${isGrass ? 'grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-2`}>
          {(['whole', 'seedling', 'vegetative', 'flower'] as const).map(stage => (
            <div key={stage} className="space-y-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center">
                {stage === 'whole' ? 'Whole Plant' : stage === 'flower' ? 'Reproductive' : stage.charAt(0).toUpperCase() + stage.slice(1)}
              </div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <WeedImage weedId={weed.id} stage={stage} className="w-full h-full" />
              </div>
            </div>
          ))}
          {isGrass && (
            <div className="space-y-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center">Ligule</div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <WeedImage weedId={weed.id} stage="ligule" className="w-full h-full" />
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{weed.plantType}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{weed.lifeCycle}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{weed.origin}</span>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground font-medium">{weed.primaryHabitat}</span>
        </div>

        {weed.safetyNote && (
          <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-3 text-sm text-destructive-foreground">
            {weed.safetyNote}
          </div>
        )}

        {/* Traits */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Identifying Traits</h3>
          <ul className="space-y-1">
            {weed.traits.map((t, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>{t}
              </li>
            ))}
          </ul>
        </div>

        {/* Habitat */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Habitat</h3>
          <p className="text-sm text-muted-foreground">{weed.habitat}</p>
        </div>

        {/* Management */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Management</h3>
          <p className="text-sm text-muted-foreground">{weed.management}</p>
          <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Timing:</span> {weed.controlTiming}</p>
          {weed.actImmediately && (
            <p className="text-sm text-destructive mt-1">⚠️ Act Immediately: {weed.actReason}</p>
          )}
        </div>

        {/* Look-alike */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-foreground mb-1">🔀 Look-Alike: {weed.lookAlike.species}</h3>
          <p className="text-sm text-muted-foreground">{weed.lookAlike.difference}</p>
        </div>

        {/* Memory Hook */}
        <div className="bg-primary/10 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-primary mb-1">💡 Memory Hook</h3>
          <p className="text-sm text-foreground">{weed.memoryHook}</p>
        </div>
      </div>
    </div>
  );
}
