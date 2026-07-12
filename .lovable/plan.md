## Goal

Rewrite the 6-8, 9-12, and Collegiate learning-module content in `src/components/game/LearningModule.tsx` to be more engaging, easier to read (7th-grade level for middle school), and themed per age group. Practice-game files are NOT touched.

## Themes (locked, applied consistently across all topics for that grade)

- **6-8 "Field Detective"** — case-file cards, evidence tags, "clue / suspect / verdict" framing, playful but not childish. Warm accent color, rounded cards, magnifier/fingerprint iconography.
- **9-12 "Researcher's Notebook"** — annotated field-log look, tabbed sections, ruled-paper accents, hypothesis/finding callouts, quick self-check boxes.
- **Collegiate "Diagnostic Key / Lab Journal"** — clean scientific layout, dichotomous couplet framing, sidebar terminology definitions, citations/references pulled forward.

## Batches (one shipped per turn, in this order)

### Batch 1 — Shared theme scaffolding
Add three small reusable presentational components at the top of `LearningModule.tsx` (or a sibling file):
- `<DetectiveCard>`, `<EvidenceTag>`, `<CaseCallout>` — 6-8
- `<NotebookSection>`, `<FieldNote>`, `<SelfCheck>` — 9-12
- `<KeyCouplet>`, `<TermSidebar>`, `<LabCallout>` — Collegiate

Uses only existing semantic tokens + Lucide icons (no emojis, no purple).

### Batch 2 — Identification / Names & ID (all three grades)
Rewrite intro copy + wrap existing photo comparisons (biennial rosette↔shoot, perennial above/below ground — already cleaned) in the themed components. 6-8 copy dropped to ~7th-grade reading level.

### Batch 3 — Life Cycle (all three grades)
Rewrite the Life Cycle sections with themed stage cards. 9-12 adds "why it matters for control" self-check. Collegiate adds phenology terminology sidebar.

### Batch 4 — Native vs Introduced (9-12 + Collegiate focus, plus 6-8 polish)
Add per-species origin context: **where** it came from (region), **when/how** it was introduced (ballast, ornamental trade, contaminated seed, etc.), and **why it spread**. 6-8 gets a lighter "passport" version. Data sourced from existing `weeds.ts` `origin` field, extended with new short origin-story strings pulled from standard invasive-species references.

### Batch 5 — Look-Alikes stage cycler
Add an arrow-through-stages viewer showing **Seedling** and **Flower/Reproductive** side-by-side for each look-alike pair (per your earlier selection). Applies across all three grades with theme-appropriate framing.

### Batch 6 — Field Scouting / Control (6-8, 9-12, Collegiate)
Rewrite scouting-pattern and control content with themes. 6-8 = "detective's route". 9-12 = notebook decision tree. Collegiate = diagnostic key + IPM decision matrix.

## What I will NOT do without asking

- Change any practice-game file
- Introduce new colors outside the design tokens
- Add emojis or AI-generated imagery
- Modify weed data schema (only additive origin-story strings)

## Technical notes

- Edits are surgical patches to `LearningModule.tsx` sections — not a full rewrite of the file.
- After each batch I'll verify the build compiles.
- Reading level for 6-8 copy targeted at Flesch-Kincaid grade ~7 (short sentences, concrete verbs, define jargon in-line).

## Confirm before I start

Reply **"go batch 1"** to begin with the shared theme components, or tell me to reorder / skip batches.
