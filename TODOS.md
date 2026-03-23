# TODOs

## Visual Regression Testing

**What:** Set up automated visual regression testing using Playwright screenshot comparisons.

**Why:** The codebase has no test framework. With 40+ files using Tailwind theme tokens, future CSS changes could silently break visual consistency. Screenshot-based diffing would catch regressions automatically.

**Context:** During the `feature/re-branding` PR, all hardcoded hex colors were refactored to Tailwind v4 `@theme` semantic tokens (e.g., `bg-[#232323]` → `bg-surface-card`). This makes future theming changes easier but introduces a single point of failure in `globals.css`. A visual regression test suite would screenshot each of the 5 feature pages + profile and diff against baselines.

**Effort:** Human: ~3 days / Claude Code: ~1 hour

**Depends on:** Deployment to devnet (need running app to screenshot)

**Update (2026-03-23):** Vitest + @testing-library/react bootstrapped by /design-review on `feature/design-system-refactor`. Visual regression testing could now build on this foundation.

## Design Review Deferred Items

### Empty states need warmer messaging
**Impact:** Medium | **Category:** Content Quality
**What:** "No Record Found" and "No Tokens Found" empty states across pages use plain text. Add icon + warmer message + primary action per DESIGN.md guidelines.
**Effort:** Human: ~2 hours / Claude Code: ~15 min

### Tooltip controlled/uncontrolled React warning
**Impact:** Polish | **Category:** Interaction States
**What:** `CommonTooltip` (`src/components/CommonTooltip.tsx`) conditionally passes `open` prop based on window width, causing React controlled/uncontrolled warning. Split into separate controlled (mobile) and uncontrolled (desktop) variants.
**Effort:** Human: ~1 hour / Claude Code: ~15 min

### Hydration mismatch on airdrop file input
**Impact:** Medium | **Category:** Performance
**What:** Server/client HTML mismatch on hidden file input `style` attribute in `UploadCsv.tsx`. React console error, no visual impact. May require SSR investigation.
**Effort:** Human: ~2 hours / Claude Code: ~30 min
