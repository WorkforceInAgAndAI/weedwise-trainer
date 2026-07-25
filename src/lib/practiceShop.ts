import { useCallback, useEffect, useState } from 'react';

/**
 * Persistent per-game "shop" inventory. Money and owned items survive across
 * levels (and page reloads for a given browser). Used by all management
 * practice games so students BUILD UP their toolkit level by level: they
 * start with a limited set of tools, earn money for correct decisions, then
 * spend that money between levels to unlock new controls to use next level.
 */

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  tag?: string;
}

interface ShopState { money: number; owned: string[]; }

function storageKey(gameKey: string) { return `practice-shop:${gameKey}`; }

function readState(gameKey: string, starterOwned: string[], startingMoney: number): ShopState {
  if (typeof window === 'undefined') return { money: startingMoney, owned: starterOwned };
  try {
    const raw = window.localStorage.getItem(storageKey(gameKey));
    if (!raw) return { money: startingMoney, owned: starterOwned };
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    return {
      money: typeof parsed.money === 'number' ? parsed.money : startingMoney,
      owned: Array.isArray(parsed.owned) ? parsed.owned : starterOwned,
    };
  } catch { return { money: startingMoney, owned: starterOwned }; }
}

function writeState(gameKey: string, state: ShopState) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(storageKey(gameKey), JSON.stringify(state)); } catch { /* noop */ }
}

export function usePracticeShop(gameKey: string, starterOwned: string[] = [], startingMoney = 0) {
  const [state, setState] = useState<ShopState>(() => readState(gameKey, starterOwned, startingMoney));

  useEffect(() => { writeState(gameKey, state); }, [gameKey, state]);

  const earn = useCallback((amount: number) => {
    setState(s => ({ ...s, money: Math.max(0, s.money + amount) }));
  }, []);

  const buy = useCallback((item: ShopItem) => {
    setState(s => {
      if (s.owned.includes(item.id) || s.money < item.cost) return s;
      return { money: s.money - item.cost, owned: [...s.owned, item.id] };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ money: startingMoney, owned: starterOwned });
  }, [startingMoney, starterOwned]);

  const owns = useCallback((id: string) => state.owned.includes(id), [state.owned]);

  return { money: state.money, owned: state.owned, owns, earn, buy, reset };
}
