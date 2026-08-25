# Weed pool reference (for content validation)

## How grades map in Practice Hub

Practice hub IDs are historical and **do not match folder names**:


| Hub id  | UI label    | Expected species pool                    |
| ------- | ----------- | ---------------------------------------- |
| `newk5` | Grades K-5  | `elementaryWeeds`                        |
| `k5`    | Grades 6-8  | `middleSchoolWeeds`                      |
| `68`    | Grades 9-12 | `highSchoolWeeds`                        |
| `912`   | Collegiate  | `collegiateWeeds` / `collegiateWeedsAll` |


Canonical filters live in `[src/data/gradeWeeds.ts](../src/data/gradeWeeds.ts)`. Master species records live in `[src/data/weeds.ts](../src/data/weeds.ts)`.

See the machine-readable inventory: `[weed-pool-reference-map.csv](./weed-pool-reference-map.csv)`.

## What was fixed in code

- 9–12 practice games that still imported `middleSchoolWeeds` now use `highSchoolWeeds`.
- Collegiate practice games that still imported `highSchoolWeeds` now use `collegiateWeeds`.
- Shared games (`FieldScoutChallenge`, `SleepySeeds`) take a `poolGrade` from the active Practice Hub band.
- Learning Module “Try this in a Practice Game” links use the **display** grade → hub map (`elementary→newk5`, `middle→k5`, `high→68`, `collegiate→912`).



## Manual QA checklist

1. Practice Hub → each grade tab → open Name / Habitat / Origins (or closest) → spot-check species against that grade’s `*_WEED_IDS` in `gradeWeeds.ts`.
2. Learning Module → each display grade → open a topic → Practice button → confirm the opened hub matches the display grade.
3. Optional: pick a region on the home page and confirm middle/high/collegiate game order changes (region priority), while collegiate learning “all species” views still show the full list where intended.

