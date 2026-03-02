import type { GameEngine } from '@/hooks/useGameEngine';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

export default function Glossary({ setShowGlossary }: GameEngine) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary">📖 Weed Glossary</h1>
          <button onClick={() => setShowGlossary(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeds.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">{w.commonName}</div>
                  <div className="text-xs text-primary italic">{w.scientificName}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>EPPO: <span className="text-foreground">{w.eppoCode}</span> | Family: <span className="text-foreground">{w.family}</span></p>
                <p>{w.plantType} • {w.lifeCycle} • {w.origin}</p>
                <p className="text-foreground">Habitat: {w.habitat}</p>
                <p className="text-primary">💡 {w.memoryHook}</p>
              </div>
              {w.safetyNote && <div className="text-xs bg-destructive/15 text-destructive-foreground p-2 rounded">{w.safetyNote}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
