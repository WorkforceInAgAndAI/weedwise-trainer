# Seed Panels and Practice Game Fixes

## Changes

1. Make every Seeds & Seed Banks panel use the exact species-specific `seedDescription` from the seed-facts dataset, including Barnyardgrass, before any family fallback.
2. Remove the automatically appended word “seed” from weed common-name labels on the panels.
3. Increase the 9–12 Weed Seed Banks seed density and falling speed while retaining the 20-second round and production-based weighting.
4. Strengthen look-alike clue filtering so every word from common and scientific names—including generic title words such as “common”—is removed from hints before display.

## Technical details

- Route K–5 and older-student seed panels through the same curated lookup helper.
- Remove “common” from the clue scrubber exemption and sanitize complete title tokens case-insensitively.
- Verify with typecheck/build and inspect current preview build diagnostics.
