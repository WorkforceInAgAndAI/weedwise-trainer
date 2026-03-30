import { ArrowLeft } from 'lucide-react';

export default function ReferencesPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-xl text-foreground">References</h1>
        </div>

        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-muted-foreground">References will be added here.</p>
        </div>
      </div>
    </div>
  );
}
