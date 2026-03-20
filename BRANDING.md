# E-Lander Branding Guidelines

Complete visual identity and design system reference for the E-Lander Solana utility dApp.

---

## 1. Brand Identity

**Product Name:** E-Lander
**Tagline:** Solana utility dApp
**Logo Files:**
- `public/images/logo/logo.png` — Icon mark
- `public/images/logo/logo-text.png` — Full logo with "E-Lander" wordmark

---

## 2. Color Palette

### Primary

| Swatch | Hex | Usage |
|--------|-----|-------|
| 🟥 | `#F44319` | Primary brand accent — CTAs, active states, links, highlights |

Primary opacity variants used throughout:
- `#F44319/5` — Subtle tinted backgrounds
- `#F44319/10` — Light accent backgrounds
- `#F44319/15` — Badge/tag backgrounds
- `#F44319/20` — Borders, selected states
- `#F44319/40` — Focused borders
- `#F44319/50` — Active card borders
- `#F44319/70` — Gradient endpoints
- `#F44319/80` — Hover states

### Backgrounds (Dark Theme)

| Swatch | Hex | Usage |
|--------|-----|-------|
| ⬛ | `#0a0a0a` | Root page background (CSS `--background`) |
| ⬛ | `#101010` | Deepest card backgrounds |
| ⬛ | `#141414` | Profile section cards |
| ⬛ | `#151515` | Mobile nav bar, modals/dialogs |
| ⬛ | `#1B1B1B` | Inner panels, token row backgrounds |
| ⬛ | `#1E1E1E` | Dropdown menus, submenus |
| ⬛ | `#1F1F1F` | Asset list rows |
| ⬛ | `#222222` | Desktop navigation sidebar |
| ⬛ | `#232323` | Main content cards |
| ⬛ | `#242424` | Card headers (Wrapper component) |
| ⬛ | `#2A2A2A` | Form inputs, secondary containers |
| ⬛ | `#2E2E2E` | Tooltips |
| ⬛ | `#343434` | Selected/expanded states |
| ⬛ | `#3A3A3A` | Horizontal dividers |

### Text

| Swatch | Hex / Class | Usage |
|--------|-------------|-------|
| ⬜ | `text-white` | Primary text |
| 🔘 | `text-white/80` | Secondary emphasis text |
| 🔘 | `text-white/60` | Labels, secondary values |
| 🔘 | `text-white/50` | Inactive nav text, helper text |
| 🔘 | `text-white/40` | Tertiary text, metadata labels |
| 🔘 | `text-white/30` | Hint text, truncated addresses |
| 🔘 | `text-white/20` | Disabled text |
| 🟧 | `#F44319` | Active navigation, links, badges |
| 🔘 | `#CECECE` | Dialog/modal titles |
| 🔘 | `#A7A7A7` | Muted secondary content |
| 🔘 | `#ededed` | Dark-mode foreground (CSS `--foreground`, dark) |
| 🔘 | `#171717` | Light-mode foreground (CSS `--foreground`, light) |

### Borders

| Class | Usage |
|-------|-------|
| `border-white/5` — `border-white/10` | Subtle card borders |
| `border-white/20` | Standard card/input borders |
| `border-[#F44319]/40` | Focus state on inputs |
| `border-[#F44319]/50` | Selected/active card borders |
| `border-[#3A3A3A]` | Section dividers |
| `border-[#524B4B]` | Modal borders (warm brown tone) |

### Status Colors

| Swatch | Hex | Usage |
|--------|-----|-------|
| 🟢 | `#31E200` | Success |
| 🟢 | `#50E796` / `green-400` | Confirmed, positive badge |
| 🔵 | `#84CAFF` / `blue-400` | Informational |
| 🟡 | `#FFD800` / `yellow-400` | Warning, authority mismatch |
| 🔴 | `#F34E4E` | Error, danger (inputs/banners) |
| 🔴 | `#F75858` | Error (toast notifications) |
| 🔴 | `#D01515` | Critical error |

---

## 3. Typography

### Font Family

**Geist Mono** — Primary and only typeface

```typescript
// src/app/layout.tsx
import { Geist_Mono } from "next/font/google";
const geist = Geist_Mono({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
```

Applied via: `body { font-family: sans-serif; }` with `--font-sans: var(--font-geist-sans)` in Tailwind theme.

### Type Scale

| Class | Weight | Usage |
|-------|--------|-------|
| `text-[8px]` | `font-bold` | Tiny labels, hints |
| `text-[10px]` | `font-bold` / `font-semibold` | Section headers, metadata, badges |
| `text-[11px]` | `font-medium` | USD values, secondary numbers |
| `text-xs` | `font-semibold` | Button text, form labels, table data |
| `text-sm` | `font-semibold` / `font-medium` | Body text, nav items, balances |
| `text-base` | `font-semibold` | Section titles (desktop) |
| `text-lg` | `font-bold` | Page titles (mobile) |
| `text-xl` | `font-bold` | Collection names, hero values |

### Special Text Styles

**Text Gradient** — Active navigation items (orange-to-gold gradient text):
```css
.text-gradient {
  background: linear-gradient(90deg, #f44319, #fec95f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
```html
<div class="text-gradient">Active Item</div>
```

**Monospace addresses/hashes:**
```html
<span class="font-mono text-white/30">FfkXFs...E2kF</span>
```

---

## 4. Gradients

### Button Gradient (Primary CTA)
```css
background: linear-gradient(to right, #F44319, rgba(244, 67, 25, 0.7));
```
```html
<button class="bg-gradient-to-r from-[#F44319] to-[#F44319]/70">
```

### Navigation Active Item
```css
background: linear-gradient(275.7deg,
  rgba(244,67,25,0) -53.55%,
  rgba(244,67,25,0.1) 73.4%,
  rgba(244,67,25,0.7) 112.36%
);
```

### Navigation Item Hover
```css
background: linear-gradient(90deg,
  rgba(244,67,25,0.2) 0%,
  rgba(244,67,25,0) 36.53%
);
```

### Selected Card State (Radial)
```css
background: radial-gradient(60.75% 112.14% at 47.63% 0%,
  rgba(244,67,25,0.4) 0%,
  rgba(244,67,25,0) 100%
);
```

### Utility Card Hover
```css
background: radial-gradient(73.08% 62.57% at 50.15% 100%,
  rgba(244,67,25,0.3) 0%,
  rgba(244,67,25,0) 100%
);
```

---

## 5. Shadows & Glows

### Navigation Active Glow
```css
.navigation-shadow {
  box-shadow:
    0px 4px 20px 0px #fdc2ab33 inset,    /* warm peach inner glow */
    2px 0px 30px 0px #f44319d4,           /* orange outer glow */
    1px 0px 12px 0px #fec95f40;           /* subtle gold accent */
}
```

### Mobile Nav Bottom Glow
```css
box-shadow: 0px -40px 60px 0px rgba(244, 67, 25, 0.2);
```
```html
<div class="shadow-[0px_-40px_60px_0px_#F4431933]">
```

### Active Tab Glow
```html
<button class="shadow-[4px_4px_24px_0px_#F4431940]">Active Tab</button>
```

### Utility Card Hover Glow
```html
<div class="hover:shadow-[4px_4px_40px_0px_#F443194D] hover:border-[#F44319]/20">
```

---

## 6. Component Patterns

### Buttons

**Primary (Solid)**
```html
<button class="bg-[#F44319] text-white hover:bg-[#F44319]/80
  px-4 py-2 rounded text-xs font-semibold">
  Action
</button>
```

**Primary (Gradient — for major CTAs)**
```html
<button class="bg-gradient-to-r from-[#F44319] to-[#F44319]/70
  text-white hover:opacity-90 w-full py-3 rounded-lg text-sm font-bold">
  Create Collection
</button>
```

**Secondary**
```html
<button class="bg-white/10 text-white hover:bg-white/20
  px-3 py-1.5 rounded text-xs font-semibold">
  Cancel
</button>
```

**Danger**
```html
<button class="bg-red-500/10 text-red-400 hover:bg-red-500/20
  px-2 py-1 rounded text-[10px] font-semibold">
  Remove
</button>
```

**Disabled State**
```html
<button class="bg-white/10 text-white/30 cursor-not-allowed"
  disabled>
  Processing...
</button>
```

**Toggle/Pill Button (Active/Inactive)**
```html
<!-- Active -->
<button class="bg-[#F44319]/20 text-[#F44319] border border-[#F44319]/40
  px-3 py-1 rounded text-[10px] font-semibold">
  Selected
</button>
<!-- Inactive -->
<button class="bg-white/5 text-white/40 border border-white/10
  px-3 py-1 rounded text-[10px] font-semibold">
  Unselected
</button>
```

**Mode Toggle (Load & Manage / Create New)**
```html
<!-- Active mode -->
<button class="bg-[#F44319] text-white px-4 py-1.5 rounded-lg text-xs font-semibold">
  Active Mode
</button>
<!-- Inactive mode -->
<button class="bg-white/5 text-white/40 hover:text-white/60
  border border-white/10 px-4 py-1.5 rounded-lg text-xs font-semibold">
  Inactive Mode
</button>
```

### Inputs

```html
<input class="px-3 py-2 rounded text-xs
  bg-[#2A2A2A] border border-white/20 text-white
  outline-none focus:border-[#F44319]/40" />
```

**With error state:**
```html
<div class="bg-[#F34E4E]/10 border border-[#F34E4E]/30 rounded-lg">
```

### Cards / Containers

**Main content card:**
```html
<div class="rounded-xl overflow-hidden bg-[#232323] border border-white/20">
  <!-- Header -->
  <div class="px-4 py-3 border-b-[0.5px] border-white/20">
    <p class="font-bold text-white">Title</p>
  </div>
  <!-- Content -->
  <div class="p-4 sm:p-5">...</div>
</div>
```

**Inner detail card:**
```html
<div class="rounded-lg bg-white/[0.03] border border-white/10 p-4">
```

**Info/code block:**
```html
<div class="rounded-lg bg-black/30 border border-white/10 overflow-hidden">
  <div class="px-3 py-2 bg-white/5 border-b border-white/10">
    <span class="text-[10px] font-semibold text-white/60">filename.json</span>
  </div>
  <pre class="px-3 py-2 text-[10px] font-mono text-white/60">...</pre>
</div>
```

### Warning / Alert Banners

```html
<!-- Warning -->
<div class="rounded bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
  <p class="text-[10px] text-yellow-400 font-semibold">Warning message</p>
</div>

<!-- Error -->
<div class="rounded bg-red-500/10 border border-red-500/20 p-3">
  <p class="text-[10px] text-red-400">Error message</p>
</div>
```

### Status Badges

```html
<!-- Enabled/Success -->
<span class="px-2 py-0.5 rounded text-[10px] font-semibold
  bg-green-500/15 text-green-400 border border-green-500/20">
  Enabled
</span>

<!-- Accent badge -->
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold
  bg-[#F44319]/20 text-[#F44319]">
  Badge
</span>

<!-- Neutral -->
<span class="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-white/50">
  trait: value
</span>
```

### Tab Bar (Pill Style)

```html
<div class="flex items-center gap-x-2 bg-[#2A2A2A] rounded-lg p-1">
  <!-- Active tab -->
  <button class="px-3 py-1 text-xs font-semibold rounded
    text-[#F44319] bg-[#F44319]/20 border border-[#F44319]/20
    shadow-[4px_4px_24px_0px_#F4431940]">
    Active
  </button>
  <!-- Inactive tab -->
  <button class="px-3 py-1 text-xs font-semibold rounded
    text-white/40 hover:text-white/60">
    Inactive
  </button>
</div>
```

### Radio Button

```html
<!-- Checked -->
<div class="w-5 h-5 rounded-full border-[3px] border-[#F44319]
  flex items-center justify-center">
  <div class="w-2 h-2 rounded-full bg-[#F44319]" />
</div>
<!-- Unchecked -->
<div class="w-5 h-5 rounded-full border-[3px] border-[#333333]" />
```

### Copy Button

```html
<!-- Idle: clipboard icon -->
<button class="text-white/25 hover:text-white/50 transition-colors">
  <svg class="w-3 h-3">...</svg>
</button>
<!-- Copied: green check -->
<svg class="w-3 h-3 text-green-400">
  <path d="M3 8l3 3 7-7" />
</svg>
```

---

## 7. Layout Patterns

### Page Structure

```
┌─────────────────────────────────────┐
│  Desktop Nav (240px)  │  Content    │
│  ┌─────────────────┐  │  ┌────────┐ │
│  │ Logo             │  │  │ Main   │ │
│  │ Nav items        │  │  │ Panel  │ │
│  │ ───────          │  │  │        │ │
│  │ Profile          │  │  │        │ │
│  │ Buy NFT widget   │  │  ├────────┤ │
│  │ Social link      │  │  │Sidebar │ │
│  └─────────────────┘  │  └────────┘ │
│  Mobile: Bottom bar    │             │
└─────────────────────────────────────┘
```

**Desktop:** Fixed left sidebar (240px) + scrollable main content + optional right sidebar (406px)
**Mobile:** Full-width content + fixed bottom nav bar (4 items max, "More" submenu for extras)

### Content Card + Sidebar Pattern

Used by: NFT Generator, Collection Manager, Bulk Transfer

```html
<div class="flex flex-col sm:flex-row gap-x-[42px] items-start sm:justify-between">
  <!-- Main panel -->
  <div class="w-full rounded-xl bg-[#232323] border border-white/20">
    ...
  </div>
  <!-- Desktop sidebar -->
  <div class="hidden sm:min-w-[406px] sm:w-[406px] sm:flex flex-col gap-y-5">
    ...
  </div>
</div>
```

### Wrapper Component (Profile Cards)

Angled header tab design with diagonal clip-path:

```html
<div class="rounded-lg bg-[#141414] border border-white/20 min-h-[310px]">
  <div class="bg-[#242424] rounded-t-lg">
    <div class="bg-[#D9D9D9]/5 rounded-tl-lg relative py-2.5 pl-4 pr-7">
      Label
      <div class="w-6 h-full absolute right-0 top-0 bg-[#242424]"
        style="clip-path: polygon(100% 0, 0% 100%, 100% 100%)" />
    </div>
  </div>
  <div class="p-4">Content</div>
</div>
```

---

## 8. Animations

### Slide Down (page enter)
```css
@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
.animate-slideDown { animation: slideDown 1s ease-out; }
```

### Transition Defaults
- Color transitions: `transition-colors`
- All transitions: `transition-all duration-200` or `duration-300`
- Expand/collapse: `transition-all duration-300 ease-in-out` with `max-h-0 opacity-0` → `max-h-20 opacity-100`

---

## 9. Scrollbar

Globally minimal scrollbar (hidden by default on most elements):

```css
::-webkit-scrollbar { width: 2px; display: none; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
```

---

## 10. Icons

SVG-based React components in `src/components/icons.tsx`. All use `currentColor` for dynamic theming.

Key icons: `HomeIcon`, `HomeLineIcon`, `DiamondIcon`, `EssentialIcon`, `SocialIcon`, `ImageIcon`, `TransferIcon`, `AirdropIcon`, `ProfileIcon`, `ArrowIcon`, `SearchIcon`, `AlertCircleIcon`, `CheckIcon`, `CloseIcon`, `ExternalLinkIcon`, `TelegramIcon`, `XIcon`.

Standard size: `w-6 h-6` (navigation), `w-4 h-4` (inline), `w-3 h-3` (micro buttons), `w-8 h-8` (home page cards).

---

## 11. PWA / App Configuration

- **App Name:** E-Lander
- **Theme Color:** `#000000`
- **Background Color:** `#000000`
- **Display:** Standalone
- **Orientation:** Portrait
- **App Icons:** `public/app-icons/` — 48px through 512px (192px and 512px are maskable)

---

## 12. Background Assets

| File | Usage |
|------|-------|
| `public/images/background/img-bg-desktop.jpg` | Desktop page background |
| `public/images/background/img-bg-mobile.avif` | Mobile background (AVIF) |
| `public/images/background/img-bg-button.png` | Button texture overlay |
| `public/images/background/img-bg-profile-statistic.png` | Profile stats card bg |

---

## 13. Design Principles

1. **Dark-first** — `#0a0a0a` base, all backgrounds are dark grays. No light mode.
2. **Single accent** — `#F44319` orange-red drives all interactive states. No secondary brand color.
3. **Depth through opacity** — White at varying opacities (`white/5` to `white/80`) creates hierarchy without introducing new colors.
4. **Glow effects** — The brand color creates warm glows (`#fdc2ab`, `#fec95f`) on navigation and key UI elements for depth.
5. **Compact information density** — Small type sizes (`8px`–`10px` for metadata, `12px`–`14px` for content) allow data-rich interfaces.
6. **Monospace aesthetic** — Geist Mono typeface reinforces the technical/blockchain identity.
7. **Rounded corners** — `rounded` for small elements, `rounded-lg` for cards, `rounded-xl` for main containers.
8. **Border subtlety** — Borders at `white/10` to `white/20` define structure without heaviness.
