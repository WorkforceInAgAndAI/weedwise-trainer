import { DollarSign, ShoppingBag, Check, Lock } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import { useState } from 'react';
import type { ShopItem } from '@/lib/practiceShop';

interface Props {
  title?: string;
  gameKey?: string;
  level: number;
  score: number;
  total: number;
  money: number;
  owned: string[];
  earnedThisLevel: number;
  catalog: ShopItem[];
  onBuy: (item: ShopItem) => void;
  onContinue: () => void;
  onStartOver: () => void;
  onBack: () => void;
  gameId?: string;
  gameName?: string;
  gradeLabel?: string;
}

/**
 * Shown between levels. Kids see money they earned this level, spend it on
 * new tools that unlock in the NEXT level, then continue. Owned items are
 * persistent across levels via usePracticeShop.
 */
export default function BetweenLevelShop({
  title = 'IPM Supply Shop',
  level, score, total, money, owned, earnedThisLevel, catalog,
  onBuy, onContinue, onStartOver, onBack, gameId, gameName, gradeLabel,
}: Props) {
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  if (showLevelComplete) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={total}
        onNextLevel={onContinue}
        onStartOver={onStartOver}
        onBack={onBack}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <ShoppingBag className="w-10 h-10 mx-auto text-primary mb-1" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            You earned <span className="font-bold text-emerald-700 dark:text-emerald-300">${earnedThisLevel}</span> in Level {level}. Spend on new tools to use next level.
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-lg font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
            <DollarSign className="w-5 h-5" />{money}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {catalog.map(it => {
            const has = owned.includes(it.id);
            const afford = money >= it.cost;
            return (
              <button
                key={it.id}
                onClick={() => onBuy(it)}
                disabled={has || !afford}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  has ? 'border-green-500 bg-green-500/10'
                    : afford ? 'border-border bg-card hover:border-primary'
                    : 'border-border bg-card opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-foreground text-sm">{it.name}</span>
                  {has ? <Check className="w-4 h-4 text-green-600" />
                    : !afford ? <Lock className="w-4 h-4 text-muted-foreground" />
                    : <span className="text-xs font-bold text-amber-700 dark:text-amber-300 inline-flex items-center"><DollarSign className="w-3 h-3" />{it.cost}</span>}
                </div>
                {it.tag && <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{it.tag}</p>}
                <p className="text-xs text-muted-foreground">{it.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground mb-3 text-center italic">
          Owned tools stay with you every level. Save up for the pricey ones!
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setShowLevelComplete(true)}
            className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Continue to Next Level →
          </button>
        </div>
      </div>
    </div>
  );
}
