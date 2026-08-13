import { weeds } from "./weeds";
import type { GradeLevel, Weed } from "@/types/game";
import { getRegion } from "./regions";

/**
 * Region-aware weed pool.
 *
 * When a user has picked a geographic region on the home page, the species
 * that are most prevalent in that region are pushed to the front of the pool
 * and the remaining species are thinned (every other one) so regional weeds
 * come up noticeably more often. Non-regional weeds are still present.
 */
function storedRegionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("weednet-region");
  } catch {
    return null;
  }
}

export function applyRegionPriority(list: Weed[]): Weed[] {
  const region = getRegion(storedRegionId());
  if (!region) return list;
  const priority = new Set(region.priorityWeedIds);
  const regional = list.filter((w) => priority.has(w.id));
  if (regional.length < 6) return list;
  const others = list.filter((w) => !priority.has(w.id));
  const thinned = others.filter((_, i) => i % 2 === 0);
  return [...regional, ...(thinned.length >= 6 ? thinned : others)];
}

/**
 * K-5 (Plant Explorer) curriculum weeds — the 14 species featured in the
 * "14 Weeds You Can Spot" learning module. All K-5 learning modules and
 * practice games should be restricted to this set.
 */
export const ELEMENTARY_WEED_IDS: string[] = [
  "canada-thistle",
  "common_Milkweed",
  "Common_mullein",
  "Dandelion",
  "Field_bindweed",
  "giant-foxtail",
  "giant-ragweed",
  "kochia",
  "lambsquarters",
  "pennsylvania-smartweed",
  "velvetleaf",
  "Venice_mallow",
  "Wild_Carrot",
  "wild-parsnip",
  "yellow-nutsedge",
];

/**
 * The curated set of weeds shown to 6-8 (Field Scout / middle school)
 * learners. Practice games in `practice-games/middle/` filter the master
 * `weeds` list down to these IDs so students only see the species defined
 * in the 6-8 curriculum.
 *
 * NOTE: `Henbit_deadnettle` covers both "Henbit" and "Purple deadnettle"
 * from the curriculum list — the dataset stores them as a single entry.
 */
export const MIDDLE_SCHOOL_WEED_IDS: string[] = [
  "barnyardgrass",
  "canada-thistle",
  "Common_Burdock",
  "CommonChickweed",
  "common_Cocklebur",
  "common_Milkweed",
  "Common_mullein",
  "commonPokeweed",
  "common-ragweed",
  "Common_teasel",
  "Curly_dock",
  "Dandelion",
  "Field_bindweed",
  "Field_Horsetail",
  "giant-foxtail",
  "giant-ragweed",
  "golden-alexanders",
  "Ground_ivy",
  "Henbit_deadnettle",
  "Horsenettle",
  "Horseweed",
  "Jimsonweed",
  "kochia",
  "lambsquarters",
  "large-crabgrass",
  "Musk_thistle",
  "pennsylvania-smartweed",
  "Redroot_pigweed",
  "Shepherds_Purse",
  "Tall_morningglory",
  "velvetleaf",
  "Venice_mallow",
  "volunteer-sunflower",
  "Wild_Carrot",
  "wild-parsnip",
  "Witchgrass",
  "yellow-nutsedge",
];

const ELEM_ID_SET = new Set(ELEMENTARY_WEED_IDS);
const MIDDLE_ID_SET = new Set(MIDDLE_SCHOOL_WEED_IDS);

/**
 * 9-12 (High School) curriculum weeds — 55 species. The full 86-species
 * dataset is reserved for the collegiate level; high school practice games
 * and learning modules pull from this pool only.
 */
export const HIGH_SCHOOL_WEED_IDS: string[] = [
  "Asiatic_dayflower",
  "barnyardgrass",
  "Buffalobur",
  "canada-thistle",
  "Catchweed_bedstraw",
  "Common_Burdock",
  "CommonChickweed",
  "common_Cocklebur",
  "Common_Mallow",
  "common_Milkweed",
  "Common_mullein",
  "commonPokeweed",
  "common-ragweed",
  "Common_teasel",
  "Curly_dock",
  "Dandelion",
  "Eastern_black_nightshade",
  "Field_bindweed",
  "Field_Horsetail",
  "Garlic_mustard",
  "giant-foxtail",
  "giant-ragweed",
  "Goosegrass",
  "green-foxtail",
  "Ground_ivy",
  "Hemp_dogbane",
  "Henbit_deadnettle",
  "Honey-vine_climbing_milkweed",
  "Horsenettle",
  "Horseweed",
  "Jimsonweed",
  "kochia",
  "lambsquarters",
  "large-crabgrass",
  "Marijuana",
  "Musk_thistle",
  "palmer-amaranth",
  "pennsylvania-smartweed",
  "poison-hemlock",
  "Prickly_lettuce",
  "Quackgrass",
  "Redroot_pigweed",
  "Shepherds_Purse",
  "Spotted_spurge",
  "Star_of_Bethlehem",
  "Tall_morningglory",
  "velvetleaf",
  "Venice_mallow",
  "volunteer-sunflower",
  "waterhemp",
  "Wild_Carrot",
  "Wild_mustard",
  "wild-parsnip",
  "yellow-foxtail",
  "yellow-nutsedge",
  "yellow_Rocket",
  "golden-alexanders",
  "Witchgrass",
];

const HIGH_ID_SET = new Set(HIGH_SCHOOL_WEED_IDS);

/** The master weeds list filtered to the K-5 curriculum. */
export const elementaryWeeds = weeds.filter((w) => ELEM_ID_SET.has(w.id));

/**
 * The master weeds list filtered to the 6-8 curriculum.
 * Use this in place of `weeds` for any grades-6-8 practice game.
 */
export const middleSchoolWeeds = applyRegionPriority(weeds.filter((w) => MIDDLE_ID_SET.has(w.id)));

/** The master weeds list filtered to the 9-12 (high school) curriculum. */
export const highSchoolWeeds = applyRegionPriority(weeds.filter((w) => HIGH_ID_SET.has(w.id)));

/** Full 87-species collegiate pool, region-prioritized. */
export const collegiateWeeds = applyRegionPriority(weeds);

/**
 * Complete, unfiltered collegiate species list. Learning modules must show
 * every species, so they use this instead of the region-thinned pool.
 */
export const collegiateWeedsAll: Weed[] = weeds;

/** Grade levels usable for content pools, including collegiate. */
export type PoolGrade = GradeLevel | "collegiate";

/**
 * Weed pool for learning-module content. Collegiate always receives the
 * complete species list (no region thinning, no 9-12 subset).
 */
export function weedsForPool(grade: PoolGrade): Weed[] {
  if (grade === "collegiate") return collegiateWeedsAll;
  return weedsForGrade(grade);
}

/** Convenience predicate for one-off checks. */
export const isMiddleSchoolWeed = (id: string): boolean => MIDDLE_ID_SET.has(id);
export const isElementaryWeed = (id: string): boolean => ELEM_ID_SET.has(id);
export const isHighSchoolWeed = (id: string): boolean => HIGH_ID_SET.has(id);

/**
 * Return the weed pool a learning module or practice game should use for
 * a given grade level. The full 86-species dataset is reserved for the
 * collegiate level (not currently exposed as its own grade).
 */
export function weedsForGrade(grade: GradeLevel): Weed[] {
  if (grade === "elementary") return elementaryWeeds;
  if (grade === "middle") return middleSchoolWeeds;
  return highSchoolWeeds;
}