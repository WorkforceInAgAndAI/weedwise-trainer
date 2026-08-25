# Instructor Sessions V2 Port Plan

This plan rebuilds the old `feature/authentication-removal` flow on top of current `main` without attempting a direct merge.

## Why rebuild instead of merge

- `main` is far ahead of the old branch (1161 commits ahead, 11 commits behind).
- The old branch mixes auth-flow changes with unrelated image/content changes.
- A direct merge would produce high-conflict, low-confidence results and hide regressions.

## Goal state

- No fake login/auth modal flow.
- Instructor opens dashboard and identifies with name + PIN.
- Dashboard lists only classes tied to that instructor identity.
- Instructor can create classes; each class has a generated student passkey.
- Session end flow archives/ends class cleanly.
- Student data remains recoverable briefly (soft delete window) before cleanup.

## Scope from old branch to port

Primary commits to port conceptually (rewrite, do not cherry-pick directly):

- `b15d739`: remove auth and move to class/session workflow
- `768122a`: per-class instructor PIN
- `598c2fd`: instructor dashboard student-progress visibility

Do not port as part of this feature:

- bulk image changes
- herbicide injury image path reshuffles
- unrelated practice-game visual changes
- docs/env cleanup unrelated to instructor workflow

## Implementation plan (small PRs)

## PR 1 - Auth flow removal shell

- Remove UI wiring for fake auth screens/hooks:
  - `src/components/game/AuthModal.tsx`
  - `src/components/game/InstructorAuth.tsx`
  - `src/hooks/useAuth.ts`
  - `src/hooks/useInstructorAuth.ts`
  - `src/pages/ResetPassword.tsx`
- Update routing/shell components:
  - `src/App.tsx`
  - `src/pages/Index.tsx`
  - `src/components/game/AppHeader.tsx`
  - `src/components/game/LandingPage.tsx`
- Keep behavior minimal and passing with temporary instructor entry gate.

Acceptance:

- App starts and instructor can reach dashboard without fake account/login.
- No dead routes/imports for removed auth components.

## PR 2 - Instructor identity + class ownership

- Add instructor identity model in app state (name + PIN).
- On dashboard load, query classes by instructor identity.
- If no classes, show empty dashboard and create-class CTA.
- On class create:
  - persist instructor name/PIN with class
  - generate student passkey
- Update:
  - `src/components/game/InstructorDashboard.tsx`
  - `src/components/game/ClassJoinFlow.tsx`
  - `src/contexts/StudentContext.tsx`
  - related data access in Supabase integration

Acceptance:

- Two instructors can operate simultaneously without seeing each other's classes.
- Class lookup/create works only under matching instructor identity.

## PR 3 - Session end safety + export reliability

- Add explicit end-session flow:
  - "End session" marks class ended
  - show export confirmation status before final close
- Add safety window:
  - retain ended classes and progress for 7 days
  - auto-cleanup with scheduled job/TTL policy
- Add instructor warning if export has not occurred.

Acceptance:

- Instructor can still recover CSV for recently ended sessions.
- Old ended sessions auto-delete after retention window.

## PR 4 - Hardening and scale checks

- Add edge-case handling:
  - duplicate instructor names with different PINs
  - wrong PIN retry UX
  - simultaneous class updates
- Verify behavior under target classroom volume (~100 students per class).
- Add targeted tests around:
  - class ownership boundaries
  - passkey generation uniqueness
  - cleanup retention logic

Acceptance:

- No cross-class data leakage.
- No observed write collisions under simulated concurrent student updates.

## Data and ops decisions (lock these now)

1. Retention policy: 7 days (chosen).
2. PIN handling: store hashed PIN (recommended), never plaintext.
3. Export policy: require explicit export step before session closure warning.
4. Recovery access: instructor can reopen recently ended class within retention window.

## Immediate execution checklist

1. Create feature branch from `main` (`feature/instructor-sessions-v2`) - done.
2. Implement PR 1 with minimal behavior changes first.
3. Smoke test dashboard open/create class/join flow.
4. Open PR and merge into `main`.
5. Repeat PR 2 through PR 4.

