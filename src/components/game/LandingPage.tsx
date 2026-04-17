import { useState, useEffect, useCallback } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import type { GradeLevel } from '@/types/game';
import WeedImage from './WeedImage';
import { ChevronRight, Users, BarChart3, LayoutDashboard, BookOpen, Target, Gamepad2, Sprout, X } from 'lucide-react';

const GRADE_OPTIONS: { id: GradeLevel; label: string; range: string; desc: string }[] = [
 { id: 'elementary', label: 'Elementary', range: 'K-5', desc: 'Common names and visual traits.' },
 { id: 'middle', label: 'Middle School', range: '6-8', desc: 'Plant families and life cycles.' },
 { id: 'high', label: 'High School', range: '9-12', desc: 'Scientific names and advanced biology.' },
];

const CAROUSEL_WEEDS = ['waterhemp', 'palmer-amaranth', 'giant-ragweed', 'lambsquarters', 'velvetleaf', 'marestail', 'kochia', 'morningglory'];

interface Props extends GameEngine {
  onOpenLearning: () => void;
  onOpenGlossary: () => void;
  onOpenClassJoin: () => void;
  onOpenDashboard: () => void;
  onOpenLeaderboard: () => void;
  onOpenCompetition: () => void;
  onOpenFarmMode: () => void;
  onOpenPracticeHub: () => void;
  onOpenStats: () => void;
  studentSession: { nickname: string; className: string } | null;
  grade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
}

export default function LandingPage({
 startGame,
 onOpenLearning, onOpenGlossary, onOpenClassJoin,
 onOpenDashboard, onOpenFarmMode, onOpenPracticeHub,
 onOpenStats, studentSession,
}: Props) {
 const [carouselIdx, setCarouselIdx] = useState(0);
 const [fadeClass, setFadeClass] = useState('opacity-100');
 const [showGradePicker, setShowGradePicker] = useState(false);

 const nextSlide = useCallback(() => {
 setFadeClass('opacity-0');
 setTimeout(() => {
 setCarouselIdx(prev => (prev + 1) % CAROUSEL_WEEDS.length);
 setFadeClass('opacity-100');
 }, 200);
 }, []);

 useEffect(() => {
 const timer = setInterval(nextSlide, 6000);
 return () => clearInterval(timer);
 }, [nextSlide]);

 return (
 <div className="flex flex-col bg-background">
 {/* Hero Section */}
 <section className="relative overflow-hidden" style={{ minHeight: '480px' }}>
 <div className="absolute inset-0">
 <div className={`absolute inset-0 transition-opacity duration-200 ${fadeClass}`}>
 <WeedImage weedId={CAROUSEL_WEEDS[carouselIdx]} stage="plant" className="w-full h-full object-cover" />
 </div>
 <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
 </div>

 <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-16 sm:py-24 flex items-center min-h-[480px]">
 <div className="max-w-xl animate-fade-in">
 <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">WeedNet</p>
 <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
 Weed Science<br />for Every Age
 </h1>
 <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
 Learn, practice, and play in our interactive agricultural simulation. Explore the intricate world of botany through a researcher's lens.
 </p>
 <button
 onClick={onOpenLearning}
 className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-success text-success-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-card"
 >
 Start Your Journey <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
 {CAROUSEL_WEEDS.map((_, i) => (
 <button
 key={i}
 onClick={() => { setFadeClass('opacity-0'); setTimeout(() => { setCarouselIdx(i); setFadeClass('opacity-100'); }, 200); }}
 className={`w-2 h-2 rounded-full transition-all ${i === carouselIdx ? 'bg-primary w-6' : 'bg-border hover:bg-muted-foreground'}`}
 />
 ))}
 </div>
 </section>

 {/* Content Cards */}
 <section className="max-w-[1200px] mx-auto px-5 sm:px-10 py-16">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { title: 'Learn', desc: 'Study weeds by topic with detailed guides, real photographs, and botanical information organized by grade level.', icon: BookOpen, action: onOpenLearning },
 { title: 'Identify', desc: 'Answer timed weed identification questions. Earn XP, build streaks, and track your mastery by species.', icon: Sprout, action: () => setShowGradePicker(true) },
 { title: 'Practice', desc: 'Sharpen your skills with interactive mini-games covering identification, taxonomy, ecology, and management.', icon: Target, action: onOpenPracticeHub },
 { title: 'Play', desc: 'Manage a soybean farm through a full growing season. Scout fields, make management decisions, and harvest.', icon: Gamepad2, action: onOpenFarmMode },
 ].map(card => (
 <button
 key={card.title}
 onClick={card.action}
 className="group bg-card border border-border rounded-lg p-8 text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200"
 >
 <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors">
 <card.icon className="w-6 h-6 text-primary" />
 </div>
 <h3 className="font-display font-bold text-foreground text-xl mb-2">{card.title}</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
 <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 group-hover:gap-2 transition-all">
 Explore <ChevronRight className="w-4 h-4" />
 </span>
 </button>
 ))}
 </div>
 </section>

 {/* Grade picker modal for Identify */}
 {showGradePicker && (
 <div
  className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
  onClick={() => setShowGradePicker(false)}
 >
 <div
  className="bg-card border border-border rounded-xl shadow-card-hover max-w-lg w-full p-6 space-y-4 animate-scale-in"
  onClick={e => e.stopPropagation()}
 >
 <div className="flex items-center justify-between">
 <div>
 <h2 className="font-display font-bold text-xl text-foreground">Choose Your Level</h2>
 <p className="text-sm text-muted-foreground mt-1">Pick a grade band to start identifying weeds.</p>
 </div>
 <button
  onClick={() => setShowGradePicker(false)}
  className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground flex items-center justify-center"
  aria-label="Close"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 <div className="grid gap-3">
 {GRADE_OPTIONS.map(g => (
 <button
  key={g.id}
  onClick={() => { setShowGradePicker(false); startGame(g.id); }}
  className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-subtle transition-all"
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="font-semibold text-foreground">{g.label} <span className="text-muted-foreground font-normal">({g.range})</span></p>
 <p className="text-sm text-muted-foreground mt-0.5">{g.desc}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-muted-foreground" />
 </div>
 </button>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Student Session Banner */}
 {studentSession && (
 <div className="max-w-[1200px] mx-auto px-5 sm:px-10 pb-8">
 <div className="px-5 py-3 rounded-lg bg-secondary border border-border text-sm flex items-center gap-2">
 <Users className="w-4 h-4 text-muted-foreground" />
 <span className="text-foreground font-medium">{studentSession.nickname}</span>
 <span className="text-muted-foreground">in</span>
 <span className="text-primary font-medium">{studentSession.className}</span>
 </div>
 </div>
 )}

 {/* Secondary Actions */}
 <section className="max-w-[1200px] mx-auto px-5 sm:px-10 pb-16">
 <div className="flex flex-wrap gap-3 justify-center">
 {[
 { label: 'Class', icon: Users, action: onOpenClassJoin },
 { label: 'Stats', icon: BarChart3, action: onOpenStats },
 { label: 'Dashboard', icon: LayoutDashboard, action: onOpenDashboard },
 ].map(btn => (
 <button
 key={btn.label}
 onClick={btn.action}
 className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary hover:shadow-subtle transition-all duration-200"
 >
 <btn.icon className="w-4 h-4 text-muted-foreground" /> {btn.label}
 </button>
 ))}
 </div>
 </section>

 {/* Footer */}
 <footer className="w-full border-t border-border py-8 text-center mt-auto">
 <p className="text-xs text-muted-foreground">WeedNet — An educational tool for weed science</p>
 </footer>
 </div>
 );
}
