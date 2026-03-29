import { useState, useEffect, useCallback } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import type { useAuth } from '@/hooks/useAuth';
import type { GradeLevel } from '@/types/game';
import WeedImage from './WeedImage';
import { Leaf, BookOpen, Gamepad2, Target, BookMarked, Users, LayoutDashboard, BarChart3, ChevronRight, User, LogOut } from 'lucide-react';

const CAROUSEL_WEEDS = ['waterhemp', 'palmer-amaranth', 'giant-ragweed', 'lambsquarters', 'velvetleaf', 'marestail', 'kochia', 'morningglory'];

interface Props extends GameEngine {
  onOpenLearning: () => void;
  onOpenGlossary: () => void;
  onOpenClassJoin: () => void;
  onOpenDashboard: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenCompetition: () => void;
  onOpenFarmMode: () => void;
  onOpenPracticeHub: () => void;
  onOpenStats: () => void;
  studentSession: { nickname: string; className: string } | null;
  auth: ReturnType<typeof useAuth>;
  grade: GradeLevel;
  onGradeChange: (g: GradeLevel) => void;
}

const GRADES: { id: GradeLevel; label: string; short: string }[] = [
  { id: 'elementary', label: 'Elementary', short: 'K-5' },
  { id: 'middle', label: 'Middle School', short: '6-8' },
  { id: 'high', label: 'High School', short: '9-12' },
];

export default function LandingPage({
  setShowInstructor, onOpenLearning, onOpenGlossary, onOpenClassJoin,
  onOpenDashboard, onOpenAuth, onOpenFarmMode, onOpenPracticeHub,
  onOpenStats, studentSession, auth, grade, onGradeChange,
}: Props) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Sticky Header ─── */}
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 shrink-0">
            <Leaf className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="font-display font-bold text-lg text-primary hidden sm:inline">The Living Laboratory</span>
            <span className="font-display font-bold text-lg text-primary sm:hidden">TLL</span>
          </button>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Learn', action: onOpenLearning, icon: BookOpen },
              { label: 'Play', action: onOpenFarmMode, icon: Gamepad2 },
              { label: 'Practice', action: onOpenPracticeHub, icon: Target },
              { label: 'Glossary', action: onOpenGlossary, icon: BookMarked },
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

          {/* Right: Grade Selector + User */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Grade Selector Pill */}
            <div className="hidden sm:flex items-center bg-secondary rounded-md p-0.5">
              {GRADES.map(g => (
                <button
                  key={g.id}
                  onClick={() => onGradeChange(g.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                    grade === g.id
                      ? 'bg-card text-foreground shadow-subtle'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {g.short}
                </button>
              ))}
            </div>

            {/* User */}
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

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: '480px' }}>
        {/* Background carousel image */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-opacity duration-200 ${fadeClass}`}>
            <WeedImage weedId={CAROUSEL_WEEDS[carouselIdx]} stage="plant" className="w-full h-full object-cover" />
          </div>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        {/* Hero content */}
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-10 py-16 sm:py-24 flex items-center min-h-[480px]">
          <div className="max-w-xl animate-fade-in">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">The Living Laboratory</p>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
              Weed Science<br />for Every Age
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Learn, practice, and play in our interactive agricultural simulation. Explore the intricate world of botany through a researcher's lens.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onOpenFarmMode}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-success text-success-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-card"
              >
                Start Your Journey <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenLearning}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border-2 border-primary text-primary font-semibold text-base hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                View Curriculum
              </button>
            </div>
          </div>
        </div>

        {/* Carousel dots */}
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

      {/* ─── Content Cards ─── */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: 'Learn', desc: 'Study weeds by topic with detailed guides, real photographs, and botanical information organized by grade level.', icon: BookOpen, action: onOpenLearning },
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

      {/* ─── Student Session Banner ─── */}
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

      {/* ─── Secondary Actions ─── */}
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

        {/* Mobile grade selector */}
        <div className="sm:hidden mt-6 flex justify-center">
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            {GRADES.map(g => (
              <button
                key={g.id}
                onClick={() => onGradeChange(g.id)}
                className={`px-4 py-2 rounded text-xs font-medium transition-all ${
                  grade === g.id ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground'
                }`}
              >
                {g.short}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full border-t border-border py-8 text-center mt-auto">
        <p className="text-xs text-muted-foreground">The Living Laboratory — An educational tool for weed science</p>
      </footer>
    </div>
  );
}
