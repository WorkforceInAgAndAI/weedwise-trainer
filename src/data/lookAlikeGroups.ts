/* ═══════════════════════════════════════════════════════════════════
   SPECIES GROUPS
   Every species is assigned to a look-alike group name, sourced directly
   from the curriculum team's species list (src/data/weeds.ts). Species
   that share the same group name are treated as look-alikes of each
   other — there is no separate curated pair/triple list anymore.
   ═══════════════════════════════════════════════════════════════════ */
export const SPECIES_GROUPS: Record<string, string> = {
  Asian_copperleaf: "Copperleafs",
  Asiatic_dayflower: "Grass-like monocots",
  Buffalobur: "Nightshades / similar",
  Burcucumber: "Vining weeds",
  Catchweed_bedstraw: "Small leaves and creeping",
  CommonChickweed: "Chickweed-type",
  Common_Burdock: "Bur-headed biennials",
  Common_Mallow: "Henbit-type",
  Common_Morningglory: "Vining weeds",
  Common_Mullein: "Wide-leaf rosete",
  Common_Sunflower: "Bur-headed biennials",
  Common_copperleaf: "Copperleafs",
  Common_teasel: "Textured and wide leaves",
  Corn_speedwell: "Chickweed-type",
  Curly_dock: "Wide-leaf rosete",
  Dandelion: "Dandelion-type rosettes",
  Downy_brome: "Awned cool-season grasses",
  Eastern_black_nightshade: "Nightshades / similar",
  Fall_Panicum: "Small panicle",
  Field_Horsetail: "Equisetum family",
  Field_Pennycress: "Mustard family",
  Field_bindweed: "Vining weeds",
  Foxtail_barley: "Awned cool-season grasses",
  Garlic_mustard: "Henbit-type",
  Goosegrass: "Prostrate finger panicle",
  Ground_ivy: "Henbit-type",
  Hedge_bindweed: "Vining weeds",
  Hemp: "Small toothed leaves",
  Hemp_dogbane: "Milkweeds",
  Henbit_deadnettle: "Henbit-type",
  Honeyvine_Milkweed: "Vining weeds",
  Horsenettle: "Nightshades / similar",
  Horseweed: "Tumbleweeds",
  Ivyleaf_morningglory: "Vining weeds",
  Jimsonweed: "Nightshades / similar",
  Ladysthumb: "Smartweed",
  Longspine_sandbur: "Sprawling grass",
  Mouseear_chickweed: "Chickweed-type",
  Musk_thistle: "True thistles",
  Nimblewill: "Sprawling grass",
  Pinnate_tansymustard: "Mustard family",
  Prickly_lettuce: "Dandelion-type rosettes",
  Prickly_sida: "Small toothed leaves",
  Quackgrass: "Tall grasses",
  Redroot_pigweed: "Pigweeds",
  Russian_thistle: "Tumbleweeds",
  Scouringrush: "Equisetum family",
  Shattercane_Sorghums: "Large panicle",
  Shepherds_Purse: "Mustard family",
  Smooth_Groundcherry: "Nightshades / similar",
  Spotted_spurge: "Small leaves and creeping",
  Star_of_Bethlehem: "Grass-like monocots",
  Tall_Hedge_Mustard: "Vining weeds",
  Toothed_spurge: "Small toothed leaves",
  Venice_mallow: "Nightshades / similar",
  Water_smartweed: "Smartweed",
  White_campion: "Wide-leaf rosete",
  Wild_Carrot: "Carrot family",
  "Wild_Four-o'clock": "Wide leaves",
  Wild_buckwheat: "Vining weeds",
  Wild_mustard: "Mustard family",
  Witchgrass: "Small panicle",
  Woolly_cupgrass: "Large seeded grasses",
  "annual-ryegrass": "Tall grasses",
  barnyardgrass: "Large seeded grasses",
  "canada-thistle": "True thistles",
  caraway: "Carrot family",
  "common-ragweed": "Ragweed-type",
  commonPokeweed: "Wide leaves",
  common_Cocklebur: "Textured and wide leaves",
  common_Milkweed: "Milkweeds",
  "giant-foxtail": "Foxtails",
  "giant-ragweed": "Ragweed-type",
  "golden-alexanders": "Carrot family",
  "green-foxtail": "Foxtails",
  johnsongrass: "Large panicle",
  kochia: "Tumbleweeds",
  lambsquarters: "Small toothed leaves",
  "large-crabgrass": "Prostrate finger panicle",
  "palmer-amaranth": "Pigweeds",
  "pennsylvania-smartweed": "Smartweed",
  "poison-hemlock": "Carrot family",
  velvetleaf: "Textured and wide leaves",
  waterhemp: "Pigweeds",
  "wild-oat": "Awned cool-season grasses",
  "wild-parsnip": "Carrot family",
  "yellow-foxtail": "Foxtails",
  "yellow-nutsedge": "Grass-like monocots",
  yellow_Rocket: "Mustard family",
};

/** The look-alike group name for a species id, if any. */
export function groupNameFor(id: string): string | undefined {
  return SPECIES_GROUPS[id];
}

interface PoolWeed {
  id: string;
  commonName: string;
}

export interface LookAlikeGroup<T> {
  ids: string[];
  name: string;
  weeds: T[];
  difference: string;
  stage: "flower" | "vegetative";
}

const GRASSY_GROUPS = new Set([
  "Awned cool-season grasses",
  "Tall grasses",
  "Foxtails",
  "Small panicle",
  "Large panicle",
  "Large seeded grasses",
  "Prostrate finger panicle",
  "Sprawling grass",
  "Grass-like monocots",
]);

/** Best comparison stage for a set of look-alike species. */
export function lookAlikeStage(ids: string[]): "flower" | "vegetative" {
  const group = ids.map((id) => SPECIES_GROUPS[id]).find(Boolean);
  return group && GRASSY_GROUPS.has(group) ? "vegetative" : "flower";
}

function differenceFor(name: string, weeds: PoolWeed[]): string {
  const names = weeds.map((w) => w.commonName).join(", ");
  return `${names} all belong to the "${name}" look-alike group. Compare leaf shape and margins, stem hairs and texture, and flower or seedhead structure to tell them apart.`;
}

/**
 * Build look-alike groups restricted to a grade-level weed pool. Species
 * are grouped together whenever they share the same SPECIES_GROUPS name.
 * Groups of size 1 (no look-alike present in the pool) are dropped.
 */
export function lookAlikeGroupsForPool<T extends PoolWeed>(pool: T[]): LookAlikeGroup<T>[] {
  const byGroup: Record<string, T[]> = {};
  for (const w of pool) {
    const group = SPECIES_GROUPS[w.id];
    if (!group) continue;
    (byGroup[group] ||= []).push(w);
  }
  const groups: LookAlikeGroup<T>[] = [];
  for (const [name, weeds] of Object.entries(byGroup)) {
    if (weeds.length < 2) continue;
    const ids = weeds.map((w) => w.id);
    groups.push({ ids, name, weeds, difference: differenceFor(name, weeds), stage: lookAlikeStage(ids) });
  }
  return groups;
}


/** Ids of species that share a group with `id`, optionally limited to a pool. */
export function lookAlikePartners(id: string, poolIds?: Set<string>): string[] {
  const group = SPECIES_GROUPS[id];
  if (!group) return [];
  return Object.keys(SPECIES_GROUPS).filter(
    (otherId) => otherId !== id && SPECIES_GROUPS[otherId] === group && (!poolIds || poolIds.has(otherId)),
  );
}

/** True when two species share the same look-alike group. */
export function isLookAlike(a: string, b: string): boolean {
  const ga = SPECIES_GROUPS[a];
  const gb = SPECIES_GROUPS[b];
  return !!ga && ga === gb;
}

/** Look-alike pairs available inside a grade pool (species sharing a group name). */
export function lookAlikePairsForPool<T extends PoolWeed>(pool: T[]): [T, T][] {
  const poolIds = new Set(pool.map((w) => w.id));
  const pairs: [T, T][] = [];
  const seen = new Set<string>();
  for (const w of pool) {
    for (const p of lookAlikePartners(w.id, poolIds)) {
      const key = [w.id, p].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const other = pool.find((x) => x.id === p);
      if (other) pairs.push([w, other]);
    }
  }
  return pairs;
}

/** Alias: ids of official look-alike partners for a species. */
export const officialPartners = lookAlikePartners;

/** Alias: true when two species are official look-alikes. */
export const isOfficialLookAlike = isLookAlike;
