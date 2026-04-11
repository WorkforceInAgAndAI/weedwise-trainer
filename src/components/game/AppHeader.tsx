import { Leaf, BookOpen, Gamepad2, Target, BookMarked, FileText, GraduationCap } from 'lucide-react';

interface Props {
  onOpenLearning: () => void;
  onOpenFarmMode: () => void;
  onOpenPracticeHub: () => void;
  onOpenGlossary: () => void;
  onOpenReferences: () => void;
  onOpenInstructor: () => void;
}

export default function AppHeader({
  onOpenLearning, onOpenFarmMode, onOpenPracticeHub, onOpenGlossary,
  onOpenReferences, onOpenInstructor,
}: Props) {
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <button onClick={() => window.location.hash = ''} className="flex items-center gap-2 shrink-0">
          <Leaf className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display font-bold text-lg text-primary">WeedNet</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Weed Identification</span>
          </div>
          <span className="font-display font-bold text-lg text-primary sm:hidden">WeedNet</span>
        </button>

        {/* Center Nav — Learn, Practice, Play, Glossary, References */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Learn', action: onOpenLearning, icon: BookOpen },
            { label: 'Practice', action: onOpenPracticeHub, icon: Target },
            { label: 'Play', action: onOpenFarmMode, icon: Gamepad2 },
            { label: 'Glossary', action: onOpenGlossary, icon: BookMarked },
            { label: 'References', action: onOpenReferences, icon: FileText },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Instructor button */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onOpenInstructor} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all">
            <GraduationCap className="w-4 h-4 text-primary" /> Instructor
          </button>
        </div>
      </div>
    </header>
  );
}
