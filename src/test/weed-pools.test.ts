import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import {
  ELEMENTARY_WEED_IDS,
  MIDDLE_SCHOOL_WEED_IDS,
  HIGH_SCHOOL_WEED_IDS,
  elementaryWeeds,
  middleSchoolWeeds,
  highSchoolWeeds,
  collegiateWeeds,
  collegiateWeedsAll,
  weedsForPool,
} from "@/data/gradeWeeds";
import { weeds, weedMap } from "@/data/weeds";
import { WEED_ARRIVAL_KNOWLEDGE } from "@/data/weedKnowledge";

const ROOT = resolve(__dirname, "../..");
const hubSrc = readFileSync(resolve(ROOT, "src/components/game/PracticeHub.tsx"), "utf8");

function extractGames(arrayName: string): { id: string; component: string }[] {
  const re = new RegExp(`const ${arrayName}: GameDef\\[\\] = \\[([\\s\\S]*?)\\];\\n`);
  const m = hubSrc.match(re);
  if (!m) return [];
  const games: { id: string; component: string }[] = [];
  const idRe = /id: '([^']+)'[\s\S]*?component: (\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = idRe.exec(m[1]))) {
    games.push({ id: match[1], component: match[2] });
  }
  return games;
}

function componentPath(component: string): string | null {
  const re = new RegExp(`import ${component} from '(\\.\\/practice-games\\/[^']+)'`);
  const m = hubSrc.match(re);
  return m ? resolve(ROOT, "src/components/game", m[1].replace("./", "") + ".tsx") : null;
}

function poolImports(filePath: string): string[] {
  const src = readFileSync(filePath, "utf8");
  const pools: string[] = [];
  const m = src.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/data\/gradeWeeds['"]/);
  if (m) {
    for (const part of m[1].split(",").map((s) => s.trim()).filter(Boolean)) {
      const as = part.match(/(\w+)\s+as\s+(\w+)/);
      pools.push(as ? as[1] : part.replace(/\s+/g, ""));
    }
  }
  if (/weedsForPool/.test(src)) pools.push("weedsForPool");
  return pools;
}

const HUB_EXPECTATIONS: Record<
  string,
  { array: string; accepted: string[] }
> = {
  newk5: { array: "newK5Games", accepted: ["elementaryWeeds", "weedsForPool"] },
  k5: { array: "k5Games", accepted: ["middleSchoolWeeds", "weedsForPool"] },
  "68": { array: "middleGames", accepted: ["highSchoolWeeds", "weedsForPool"] },
  "912": {
    array: "highGames",
    accepted: ["collegiateWeeds", "collegiateWeedsAll", "weedsForPool"],
  },
};

describe("grade weed ID sets", () => {
  it("every curriculum ID exists in the master weeds list", () => {
    for (const id of [...ELEMENTARY_WEED_IDS, ...MIDDLE_SCHOOL_WEED_IDS, ...HIGH_SCHOOL_WEED_IDS]) {
      expect(weedMap[id], `missing weed id ${id}`).toBeDefined();
    }
  });

  it("has no duplicate IDs within each grade list", () => {
    const assertUnique = (ids: string[], label: string) => {
      expect(new Set(ids).size, label).toBe(ids.length);
    };
    assertUnique(ELEMENTARY_WEED_IDS, "elementary");
    assertUnique(MIDDLE_SCHOOL_WEED_IDS, "middle");
    assertUnique(HIGH_SCHOOL_WEED_IDS, "high");
  });

  it("filters produce non-empty pools", () => {
    expect(elementaryWeeds.length).toBeGreaterThan(0);
    expect(middleSchoolWeeds.length).toBeGreaterThan(0);
    expect(highSchoolWeeds.length).toBeGreaterThan(0);
    expect(collegiateWeeds.length).toBe(weeds.length);
    expect(collegiateWeedsAll.length).toBe(weeds.length);
    expect(weedsForPool("collegiate").length).toBe(weeds.length);
  });

  it("weedKnowledge keys that exist resolve to master weeds", () => {
    for (const id of Object.keys(WEED_ARRIVAL_KNOWLEDGE)) {
      expect(weedMap[id], `weedKnowledge key missing from weeds.ts: ${id}`).toBeDefined();
    }
  });
});

describe("PracticeHub game pools match hub band", () => {
  for (const [hubId, { array, accepted }] of Object.entries(HUB_EXPECTATIONS)) {
    it(`${hubId} games import an accepted pool (or have no gradeWeeds import)`, () => {
      const games = extractGames(array);
      expect(games.length).toBeGreaterThan(0);

      const wrong: string[] = [];
      for (const g of games) {
        const file = componentPath(g.component);
        if (!file) {
          wrong.push(`${g.id}: missing import path for ${g.component}`);
          continue;
        }
        const pools = poolImports(file);
        if (pools.length === 0) continue; // concept / no-species game
        const ok = pools.some((p) => accepted.includes(p));
        if (!ok) wrong.push(`${g.id} (${g.component}): [${pools.join(", ")}]`);
      }
      expect(wrong, wrong.join("\n")).toEqual([]);
    });
  }
});
