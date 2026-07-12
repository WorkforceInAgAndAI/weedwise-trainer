# Batch Update Plan

Splitting your list into **A) Gameplay redesigns** (bigger) and **B) Quick data/image fixes** (small, do first).

---

## B. Quick fixes (fast, low risk — do first)

1. **Rename "Smooth Witchgrass" → "Fall Panicum"** across `src/data/weeds.ts`, `gradeWeeds.ts`, glossary, and any hardcoded string references. Keep the same image folder or rename the folder mapping in `imageMap.ts`.
2. **Waterhemp habitat fix** — remove "aquatic" classification in weed data; reclassify to disturbed/row-crop habitat.
3. **Asiatic Dayflower ligule photo** — remove ligule reference/photo (dayflower is a dicot-like monocot without a grass ligule). Fix in image references + LiguleLens game options.
4. **K-5 LifeStagesSequence arrows** — flip arrow direction (or flip card order) so arrow points from earlier → later stage matching the visual flow.
5. **Taxonomy Tower reproductive photos** — change `stage="flower"` (already flower in HS version) → force `stage="flower"` or `stage="seed"` reproductive-only in K-5 and Middle versions too; confirm HS is already correct.

---

## A. Gameplay redesigns

### 1. Farm Mode / Play — realistic weed spread + seasonal events
- Replace random one-off weed dots with **cluster/patch generation**: pick 2–4 "colonizer" weeds per field, seed 5–15 spots per cluster with jittered positions to look like real patches.
- Add a **season event system**: on each season tick, roll from `{Heavy Rain, Drought, Seed Bank Flush, Wind Dispersal, Neighboring Field Escape, Cold Snap}`. Each event mutates the field (adds patches, kills seedlings, shifts species mix) and shows a toast/banner.
- Store spread as `patches: {weedId, centerX, centerY, radius, density}[]` instead of individual dots.

### 2. Life Cycle Matching → "Pasture Walk" mode
- Add **energy meter (100) and step budget** at top.
- Player clicks/taps weeds across a pasture view; each visit costs energy proportional to distance from current position.
- Player must decide **spray now vs skip / spray later** based on life stage shown — wrong-stage sprays waste herbicide.
- Score = (weeds correctly treated) − (wasted herbicide) − (energy overrun penalty).

### 3. Field Scouting — draw-your-own transect
- Replace preset pattern picker with a **drag-to-draw path** on a field canvas.
- Constraints: **max path length** (e.g., 400 units) and **limited herbicide charges** (e.g., 8 sprays).
- Scoring is **dual-objective**:
  - **Coverage score**: total weeds intersected by scouting radius
  - **Diversity score**: unique species discovered / total species in field
- Final grade combines both, so a straight line through one hotspot loses to a smart W/zigzag hitting multiple patches.

### 4. Herbicide injury photos ↔ game options alignment
- Audit `src/data/herbicides.ts` and the injury-photo mapping used in `CropDoctor` / `HerbicideApplicator` / `HerbicideResistor`.
- Photos are currently keyed by WSSA group; game answer options are specific active ingredients. **Fix**: either
  - (a) change game options to **group names** so they match photo keys, OR
  - (b) add a chem→group lookup and pick photos via the group of the shown chem.
- Recommend **(b)** so quiz text stays specific but images resolve correctly.

---

## Technical notes

- Farm patches: extend `FarmMode.tsx` state shape; add `src/data/seasonalEvents.ts`.
- Pasture Walk: new file `src/components/game/practice-games/{grade}/PastureWalk.tsx`, replace existing LifeCycleMatching entries in each grade's PracticeHub.
- Field Scouting draw: use `<canvas>` + pointer events; new file per grade under `practice-games/*/FieldScoutDraw.tsx`, retire old pattern picker.
- Herbicide alignment: single helper `src/lib/herbicideInjury.ts` exporting `getInjuryImage(chemId | groupId)`.

---

## Order of execution

I'll do **B (all quick fixes)** in one pass, then tackle **A** in this order: (4) herbicide alignment → (1) Farm spread + events → (3) Field Scouting draw → (2) Pasture Walk.

Reply **"go"** to start, or tell me to reorder / drop items.
