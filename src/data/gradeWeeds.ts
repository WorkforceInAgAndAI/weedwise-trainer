import { weeds } from "./weeds";
import type { GradeLevel, Weed } from "@/types/game";

/**
 * K-5 (Plant Explorer) curriculum weeds — the 14 species featured in the
 * "14 Weeds You Can Spot" learning module. All K-5 learning modules and
 * practice games should be restricted to this set.
 */
export const ELEMENTARY_WEED_IDS: string[] = [
  "Dandelion",
  "giant-foxtail",
  "lambsquarters",
  "common_Milkweed",
  "Wild_Carrot",
  "canada-thistle",
  "giant-ragweed",
  "pennsylvania-smartweed",
  "kochia",
  "wild-parsnip",
  "yellow-nutsedge",
  "velvetleaf",
  "Field_bindweed",   // labeled "Morningglory" in K-5 module
  "Venice_mallow",
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
  "Dandelion",
  "lambsquarters",
  "common_Milkweed",
  "Wild_Carrot",
  "canada-thistle",
  "giant-ragweed",
  "pennsylvania-smartweed",
  "kochia",
  "wild-parsnip",
  "velvetleaf",
  "Tall_morningglory",
  "Venice_mallow",
  "giant-foxtail",
  "yellow-nutsedge",
  "common-ragweed",
  "Redroot_pigweed",
  "commonPokeweed",           // replaces Common purslane
  "volunteer-sunflower",      // replaces Broadleaf plantain
  "Common_teasel",            // replaces Buckhorn plantain
  "Field_bindweed",
  "common_Cocklebur",
  "Jimsonweed",
  "Horsenettle",
  "Curly_dock",
  "CommonChickweed",
  "Henbit_deadnettle",        // covers Henbit + Purple deadnettle
  "Shepherds_Purse",
  "Ground_ivy",
  "Common_Burdock",           // replaces Common mullein
  "Musk_thistle",             // replaces Bull thistle
  "Horseweed",
  "Field_Horsetail",          // replaces Yellow woodsorrel
  "large-crabgrass",
  "barnyardgrass",
];

const ELEM_ID_SET = new Set(ELEMENTARY_WEED_IDS);
const MIDDLE_ID_SET = new Set(MIDDLE_SCHOOL_WEED_IDS);

/** The master weeds list filtered to the K-5 curriculum. */
export const elementaryWeeds = weeds.filter((w) => ELEM_ID_SET.has(w.id));

/**
 * The master weeds list filtered to the 6-8 curriculum.
 * Use this in place of `weeds` for any grades-6-8 practice game.
 */
export const middleSchoolWeeds = weeds.filter((w) => MIDDLE_ID_SET.has(w.id));

/** Convenience predicate for one-off checks. */
export const isMiddleSchoolWeed = (id: string): boolean => MIDDLE_ID_SET.has(id);
export const isElementaryWeed = (id: string): boolean => ELEM_ID_SET.has(id);

/**
 * Return the weed pool a learning module or practice game should use for
 * a given grade level. High school still uses the full 86-species dataset.
 */
export function weedsForGrade(grade: GradeLevel): Weed[] {
  if (grade === "elementary") return elementaryWeeds;
  if (grade === "middle") return middleSchoolWeeds;
  return weeds;
}