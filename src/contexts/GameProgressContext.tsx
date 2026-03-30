import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Award, Star, Trophy, Target, Zap, Shield, BookOpen, Leaf, Microscope, FlaskConical, Map, Globe, Eye, Sprout } from 'lucide-react';

export interface GameBadge {
  gameId: string;
  gameName: string;
  level: string;
  score: number;
  total: number;
  earnedAt: string;
}

interface GameProgressContextType {
  badges: GameBadge[];
  addBadge: (badge: Omit<GameBadge, 'earnedAt'>) => void;
  getBadgesForGame: (gameId: string) => GameBadge[];
  totalBadges: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const GameProgressContext = createContext<GameProgressContextType | null>(null);

export function GameProgressProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<GameBadge[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addBadge = useCallback((badge: Omit<GameBadge, 'earnedAt'>) => {
    setBadges(prev => {
      const existing = prev.findIndex(b => b.gameId === badge.gameId && b.level === badge.level);
      const newBadge: GameBadge = { ...badge, earnedAt: new Date().toISOString() };
      if (existing >= 0) {
        // Update if better score
        if (badge.score > prev[existing].score) {
          const updated = [...prev];
          updated[existing] = newBadge;
          return updated;
        }
        return prev;
      }
      return [...prev, newBadge];
    });
  }, []);

  const getBadgesForGame = useCallback((gameId: string) => {
    return badges.filter(b => b.gameId === gameId);
  }, [badges]);

  return (
    <GameProgressContext.Provider value={{
      badges,
      addBadge,
      getBadgesForGame,
      totalBadges: badges.length,
      sidebarOpen,
      setSidebarOpen,
    }}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress() {
  const ctx = useContext(GameProgressContext);
  if (!ctx) throw new Error('useGameProgress must be used within GameProgressProvider');
  return ctx;
}
