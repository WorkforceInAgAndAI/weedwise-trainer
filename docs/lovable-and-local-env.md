# Lovable, local `.env`, and why keys sometimes “break”

## What this repo expects

- **Local dev (Cursor, `bun run dev`):** Create a **`.env`** file (or `.env.local`) next to `package.json`. Copy from **`.env.example`** and fill in real values. These files are **gitignored** on purpose.
- **Lovable-hosted preview / Lovable builds:** Environment variables are set **inside the Lovable project** (Integrations / Secrets / Environment — exact UI varies). Lovable does **not** rely on a committed `.env` file in GitHub.

## Why things broke before (typical story)

1. **`.env` was committed**, then later added to **`.gitignore`** and removed from Git history.
2. Teammates or Lovable still pointed at an **old** Supabase anon key, or the key was **rotated** in the Supabase dashboard after a security concern.
3. **Symptom:** app loads but data/auth fails, or “invalid API key”. **Fix:** In Supabase → Project Settings → API, copy the current **anon public** key and **URL**, then paste into **local `.env`** and into **Lovable’s** env/secret store. You do **not** need to commit `.env`.

## Files you should know about

| File        | Committed? | Purpose |
|------------|------------|---------|
| `.env.example` | Yes | Template only; no secrets. |
| `.env`, `.env.local`, `.env.*` (except example) | No | Real secrets; local or per-hosting env. |

## Before demo / before AWS

- Demo can run on **Lovable** or **local**; no AWS required.
- **CI/CD** (lint + build on PR) can be added **after** the demo; it does not replace Lovable secrets.
- When you move to **AWS Amplify** (or similar), add the **same** `VITE_*` variables in the host’s console; still keep `.env` out of Git.

## `VITE_INSTRUCTOR_PIN`

- Required for the instructor dashboard gate in builds that include this feature.
- Set the same value in Lovable (when you use this branch there) and in Amplify later.
- If it’s missing, `import.meta.env.VITE_INSTRUCTOR_PIN` is `undefined` and PIN checks may behave unexpectedly — set it everywhere you deploy.
