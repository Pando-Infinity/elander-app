# TODOs

## Visual Regression Testing

**What:** Set up automated visual regression testing using Playwright screenshot comparisons.

**Why:** The codebase has no test framework. With 40+ files using Tailwind theme tokens, future CSS changes could silently break visual consistency. Screenshot-based diffing would catch regressions automatically.

**Context:** During the `feature/re-branding` PR, all hardcoded hex colors were refactored to Tailwind v4 `@theme` semantic tokens (e.g., `bg-[#232323]` → `bg-surface-card`). This makes future theming changes easier but introduces a single point of failure in `globals.css`. A visual regression test suite would screenshot each of the 5 feature pages + profile and diff against baselines.

**Effort:** Human: ~3 days / Claude Code: ~1 hour

**Depends on:** Deployment to devnet (need running app to screenshot)
