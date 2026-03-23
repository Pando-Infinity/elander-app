# Design System — E-Lander

## Product Context
- **What this is:** Solana utility dApp providing airdrop, NFT generation, NFT collection management, bulk token transfers, and holder snapshots
- **Who it's for:** Community/ops managers at Solana projects (DAOs, NFT collections, DeFi protocols) who need no-code tools for bulk on-chain operations
- **Space/industry:** Web3/Solana tooling — peers include Metaplex Sugar, Streamflow, Helius tools
- **Project type:** Web app (dark-only dashboard with data-dense utility interfaces)

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — function-first, data-dense, monospace-driven
- **Decoration level:** Intentional — warm orange glows and gradients on navigation/active states add personality to an otherwise stark interface
- **Mood:** Serious infrastructure tool with a warm pulse. Professional enough for ops managers handling real money, distinctive enough to feel like a product with identity — not a generic admin panel
- **Design principles:**
  1. **Dark-first** — `#0a0a0a` base, all backgrounds are dark grays. No light mode.
  2. **Single accent** — `#F44319` orange-red drives all interactive states. No secondary brand color.
  3. **Depth through opacity** — White at varying opacities (`white/5` to `white/80`) creates hierarchy without introducing new colors.
  4. **Glow effects** — The brand color creates warm glows (`#fdc2ab`, `#fec95f`) on navigation and key UI elements for depth.
  5. **Compact information density** — Small type sizes for metadata, standard for content. Data-rich interfaces, not whitespace-heavy.
  6. **Monospace aesthetic** — Geist Mono typeface reinforces the technical/blockchain identity.
  7. **Rounded corners** — `rounded` (4px) for small elements, `rounded-lg` (8px) for cards, `rounded-xl` (12px) for main containers.
  8. **Border subtlety** — Borders at `white/10` to `white/20` define structure without heaviness.

## Typography
- **Display/Hero:** Geist Mono (`text-xl font-bold`) — monospace at display size is unusual and immediately recognizable. Reinforces technical identity.
- **Body:** Geist Mono (`text-sm font-medium`) — all content is short labels, numbers, and addresses. Monospace makes these align naturally.
- **UI/Labels:** Geist Mono (`text-xs font-semibold`) — buttons, form labels, table data. Compact and legible at small sizes.
- **Data/Tables:** Geist Mono (`text-[10px]`–`text-[11px] font-semibold`) — metadata, USD values, secondary numbers. Tabular-nums built in.
- **Code:** Geist Mono (same as body — no distinction needed)
- **Loading:** Next.js `next/font/google` with `Geist_Mono`, variable `--font-geist-sans` (note: variable is intentionally named `--font-geist-sans` in the codebase despite being Geist Mono — do not rename)
- **Scale:**

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-[8px]` | 8px | bold | Tiny labels, hints |
| `text-[10px]` | 10px | bold/semibold | Section headers, metadata, badges |
| `text-[11px]` | 11px | medium | USD values, secondary numbers |
| `text-xs` | 12px | semibold | Buttons, form labels, table data |
| `text-sm` | 14px | semibold/medium | Body text, nav items, balances |
| `text-base` | 16px | semibold | Section titles (desktop) |
| `text-lg` | 18px | bold | Page titles (mobile) |
| `text-xl` | 20px | bold | Collection names, hero values |

- **Special:** `.text-gradient` — orange-to-gold gradient text for active navigation items: `linear-gradient(90deg, var(--color-accent), var(--color-accent-gold))`

## Color
- **Approach:** Restrained — single accent + dark gray depth hierarchy + white opacity for text. Deliberately monochromatic-plus-one.
- **Primary accent:** `#F44319` — warm orange-red. CTAs, active states, links, highlights. Used at opacity variants from `/5` (subtle bg) to `/80` (hover).
- **Accent gold:** `#fec95f` — appears only in gradient endpoints (text-gradient, navigation glow). Never used standalone.
- **Surfaces (13-level dark depth hierarchy):**

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0a0a0a` | Page/body background (CSS `--background`) |
| `surface-deep` | `#101010` | Deepest card backgrounds |
| `surface-card-alt` | `#141414` | Profile section cards |
| `surface-nav` | `#151515` | Mobile nav bar, modals |
| `surface-panel` | `#1B1B1B` | Inner panels, token rows |
| `surface-dropdown` | `#1E1E1E` | Dropdown menus |
| `surface-row` | `#1F1F1F` | Asset list rows |
| `surface-sidebar` | `#222222` | Desktop navigation sidebar |
| `surface-card` | `#232323` | Main content cards |
| `surface-header` | `#242424` | Card headers (Wrapper) |
| `surface-input` | `#2A2A2A` | Form inputs, tab bars |
| `surface-tooltip` | `#2E2E2E` | Tooltips, info blocks |
| `surface-selected` | `#343434` | Selected/expanded states |
| `surface-divider` | `#3A3A3A` | Horizontal dividers |

- **Text hierarchy:** White at opacity levels — `white` (primary), `white/80` (secondary), `white/60` (labels), `white/50` (inactive), `white/40` (tertiary), `white/30` (hints), `white/20` (disabled). Plus `#CECECE` (dialog titles) and `#A7A7A7` (muted content).
- **Semantic:**

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#31E200` | Success states |
| `success-alt` | `#50E796` | Confirmed, positive badges |
| `info` | `#84CAFF` | Informational |
| `warning` | `#FFD800` | Warning, authority mismatch |
| `error` | `#F34E4E` | Error (inputs/banners) |
| `error-toast` | `#F75858` | Error (toast notifications) |
| `error-critical` | `#D01515` | Critical error |

- **Dark mode:** Dark-only. No light mode. No toggle needed.
- **Accessibility note:** `#F44319` on `#0a0a0a` (body background) passes WCAG AA (~4.6:1). On `surface-deep` (`#101010`), contrast is ~4.4:1 — still AA. Opacity variants (e.g., `#F44319/70` on dark backgrounds) may not meet AA — use full-opacity accent for text.

## Spacing
- **Base unit:** 4px
- **Density:** Compact — data-rich interfaces need tight spacing
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(12px) lg(16px) xl(20px) 2xl(24px) 3xl(32px) 4xl(48px)
- **Common patterns:**
  - Card padding: `p-4` (16px) mobile, `p-5` (20px) desktop
  - Section gaps: `gap-y-3` (12px) within cards, `gap-y-5` (20px) between cards
  - Horizontal gaps: `gap-x-2` (8px) inline, `gap-x-[42px]` (42px) content-to-sidebar

## Layout
- **Approach:** Grid-disciplined — fixed sidebar + scrollable content + optional right panel
- **Desktop:** Fixed left sidebar (240px) + main content (fluid) + optional right sidebar (406px, used by NFT Gen, Collection Mgr, Bulk Transfer, Snapshot)
- **Mobile:** Full-width content + fixed bottom nav (4 items max, "More" submenu for extras)
- **Max content width:** Fluid (fills available space between sidebars)
- **Border radius:**

| Scale | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Small elements (badges, pills, buttons) |
| `rounded-lg` | 8px | Cards, inputs, secondary containers |
| `rounded-xl` | 12px | Main content cards, primary containers |
| `rounded-full` | 9999px | Avatars, radio buttons |

- **Card pattern:** Header (border-bottom `0.5px white/20`) + content body. Used consistently across all feature pages.

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter(`ease-out`) exit(`ease-in`) move(`ease-in-out`)
- **Duration:** micro(not used) short(`200ms`) medium(`300ms`) long(`1000ms` — page enter only)
- **Animations:**
  - `slideDown` — page entrance: `translateY(-10px) → 0` over 1s ease-out
  - `transition-colors` — hover state changes (instant feel)
  - `transition-all duration-200` / `duration-300` — expand/collapse, opacity changes
  - Expand/collapse: `max-h-0 opacity-0` → `max-h-20 opacity-100` with `duration-300 ease-in-out`
- **No:** scroll-driven animations, choreography, staggered entrances, parallax, or decorative motion
- **Duration mapping:** `short(200ms)` → hover color/opacity changes. `medium(300ms)` → expand/collapse panels, modal transitions. `long(1000ms)` → page entrance only (`slideDown`).
- **Note on expand/collapse:** `max-h` value must match actual content height — `max-h-20` is a reference, not a fixed limit. Adjust per component.

## Gradients

Gradients are a key part of E-Lander's visual identity. All derive from the primary accent `#F44319`.

Gradient values are fixed — extracted from the live implementation. Use verbatim; do not re-derive.

| Name | CSS | Usage |
|------|-----|-------|
| Button CTA | `linear-gradient(to right, #F44319, rgba(244,67,25,0.7))` | Primary action buttons |
| Nav active | `linear-gradient(275.7deg, rgba(244,67,25,0) -53.55%, rgba(244,67,25,0.1) 73.4%, rgba(244,67,25,0.7) 112.36%)` | Active sidebar item |
| Nav hover | `linear-gradient(90deg, rgba(244,67,25,0.2) 0%, rgba(244,67,25,0) 36.53%)` | Sidebar item hover |
| Card selected | `radial-gradient(60.75% 112.14% at 47.63% 0%, rgba(244,67,25,0.4) 0%, rgba(244,67,25,0) 100%)` | Selected card top glow |
| Utility hover | `radial-gradient(73.08% 62.57% at 50.15% 100%, rgba(244,67,25,0.3) 0%, rgba(244,67,25,0) 100%)` | Card hover bottom glow |
| Text gradient | `linear-gradient(90deg, #F44319, #fec95f)` | Active nav text (orange→gold) |

## Glow Effects

The warm glow system gives E-Lander physical warmth on a dark interface.

| Name | CSS | Usage |
|------|-----|-------|
| Navigation active | `box-shadow: 0px 4px 20px 0px #fdc2ab33 inset, 2px 0px 30px 0px #f44319d4, 1px 0px 12px 0px #fec95f40` | Active sidebar item |
| Mobile nav | `box-shadow: 0px -40px 60px 0px rgba(244,67,25,0.2)` | Bottom nav glow |
| Active tab | `box-shadow: 4px 4px 24px 0px #F4431940` | Selected tab pill |
| Card hover | `box-shadow: 4px 4px 40px 0px #F443194D` | Utility card hover |

## Implementation Notes

### Tailwind v4 Theme Tokens
All surface colors and semantic colors are defined as CSS custom properties in `src/app/globals.css` via `@theme inline`. All `--color-*` tokens automatically generate `bg-*`, `text-*`, and `border-*` utilities (e.g., `--color-error` → `bg-error`, `text-error`, `border-error`). Use token classes — never hardcode hex values for mapped colors.

### Interactive States
- **Focus:** Input focus ring via `focus:border-accent/40`. No outline ring — border color change only.
- **Disabled:** `cursor-not-allowed` + `bg-white/10 text-white/30`. Reduce visual weight, don't hide.
- **Hover (buttons):** `hover:bg-accent/80` (primary), `hover:bg-white/20` (secondary).
- **Hover (cards):** `hover:shadow-[4px_4px_40px_0px_#F443194D] hover:border-accent/20`.
- **Selected (table rows):** `bg-surface-selected` with `border-accent/50`.

### CSS Variable Reference
```css
@theme inline {
  --color-accent: #F44319;
  --color-accent-gold: #fec95f;
  --color-surface-deep: #101010;
  --color-surface-card-alt: #141414;
  --color-surface-nav: #151515;
  --color-surface-panel: #1B1B1B;
  --color-surface-dropdown: #1E1E1E;
  --color-surface-row: #1F1F1F;
  --color-surface-sidebar: #222222;
  --color-surface-card: #232323;
  --color-surface-header: #242424;
  --color-surface-input: #2A2A2A;
  --color-surface-tooltip: #2E2E2E;
  --color-surface-selected: #343434;
  --color-surface-divider: #3A3A3A;
  --color-success: #31E200;
  --color-success-alt: #50E796;
  --color-info: #84CAFF;
  --color-warning: #FFD800;
  --color-error: #F34E4E;
  --color-error-toast: #F75858;
  --color-error-critical: #D01515;
  --color-text-muted: #A7A7A7;
  --color-text-dialog: #CECECE;
}
```

### Icon System
SVG-based React components in `src/components/icons.tsx`. All use `currentColor` for dynamic theming. Standard sizes: `w-6 h-6` (nav), `w-4 h-4` (inline), `w-3 h-3` (micro), `w-8 h-8` (home cards).

## Surface Token Usage Note

Adjacent surface tokens differ by as few as 2-3 hex values (`surface-card #232323` vs `surface-header #242424`). These differences may be indistinguishable on poorly calibrated monitors. Always pair surface tokens with borders (`white/10` to `white/20`) or shadow to reinforce visual distinction — color difference alone is insufficient at adjacent levels.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | Initial design system created | Formalized from BRANDING.md by /design-consultation. Captures rationale behind existing visual identity. |
| 2026-03-21 | Monospace-only typography (Geist Mono) | Reinforces blockchain/technical identity. Content is primarily short labels, numbers, and wallet addresses — monospace is natural fit. |
| 2026-03-21 | 13-level surface hierarchy | Creates subtle depth perception on dark interfaces. Consistency maintained via Tailwind `@theme` tokens. |
| 2026-03-21 | Warm glow effects on navigation | Distinctive visual signature. Adds physical warmth to an industrial aesthetic without being decorative. |
| 2026-03-21 | No light mode | Dark-only is category convention for Web3 tools. Reduces maintenance burden. Revisit only if user research indicates demand. |
