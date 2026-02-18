# Experiment Flags

This file tracks temporary and ongoing test/preview flags used to expose gated UI for internal QA.

## Current Flags

### Global Test Mode

- Purpose: Enable internal test mode across flagged experiences.
- Query param:
  - `?testMode=1` -> enable for current browser session
  - `?testMode=0` -> disable for current browser session
- Session storage key: `eav_test_mode`

### Estimate Form Preview

- Purpose: Enable estimate form while public gate remains active.
- Query param:
  - `?estimateFormPreview=1` -> enable for current browser session
  - `?estimateFormPreview=0` -> disable for current browser session
- Session storage key: `eav_estimate_form_preview`
- Note: Global test mode also enables this preview automatically.

## Current UX Indicator

- A `Test Mode` badge appears to the right of the header logo when test mode is enabled.

## How It Works

- Flags are resolved client-side from URL query params.
- Values are persisted in `sessionStorage`.
- Flags are not persisted across browsers/devices and do not affect other visitors.

## Implementation Location

- Shared resolver: `lib/test-mode.ts`
- Header badge: `components/Header.tsx`
- Estimate form gating: `components/Hero.tsx`

## Naming Convention for New Flags

- Query param: short camelCase (example: `newHeroLayout`)
- Session key: `eav_<flag_name_snake_case>`
- Add all new flags to:
  - `lib/test-mode.ts`
  - this `EXPERIMENT_FLAGS.md`

## Safety Notes

- Do not use test flags for security-sensitive access control.
- Keep production defaults conservative (feature off unless explicitly enabled).
