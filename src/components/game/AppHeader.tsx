import { Leaf, BookOpen, Gamepad2, Target, BookMarked, FileText, User, LogOut } from 'lucide-react';
import type { useAuth } from '@/hooks/useAuth';

interface Props {
 onOpenLearning: () => void;
 onOpenFarmMode: () => void;
 onOpenPracticeHub: () => void;
 onOpenGlossary: () => void;
 onOpenReferences: () => void;
 onOpenAuth: () => void;
 auth: ReturnType<typeof useAuth>;
}

export default function AppHeader({
 onOpenLearning, onOpenFarmMode, onOpenPracticeHub, onOpenGlossary,
 onOpenReferences, onOpenAuth, auth,
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

 {/* Center Nav */}
 <nav className="hidden md:flex items-center gap-1">
 {[
 { label: 'Learn', action: onOpenLearning, icon: BookOpen },
 { label: 'Play', action: onOpenFarmMode, icon: Gamepad2 },
 { label: 'Practice', action: onOpenPracticeHub, icon: Target },
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

 {/* Right: User */}
 <div className="flex items-center gap-3 shrink-0">
 {auth.isAuthenticated ? (
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
 <User className="w-4 h-4 text-primary" />
 </div>
 <span className="text-sm text-foreground font-medium hidden lg:inline">
 {auth.role === 'instructor' ? auth.instructor?.display_name : auth.user?.email?.split('@')[0]}
 </span>
 <button onClick={auth.logout} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Sign Out">
 <LogOut className="w-4 h-4" />
 </button>
 </div>
 ) : (
 <button onClick={onOpenAuth} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
 Log In
 </button>
 )}
 </div>
 </div>
 </header>
 );
}
