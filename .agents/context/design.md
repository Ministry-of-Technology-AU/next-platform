---
name: Next Platform
colors:
  surface: '#f7f4f2'
  surface-dim: '#e9e1dd'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf8f6'
  surface-container: '#f7f4f2'
  surface-container-high: '#f2f1ee'
  surface-container-highest: '#e6e3e1'
  on-surface: '#1c1917'
  on-surface-variant: '#57504c'
  inverse-surface: '#171717'
  inverse-on-surface: '#f7f4f2'
  outline: '#bfbcba'
  outline-variant: '#e0e0e0'
  surface-tint: '#87281b'
  primary: '#87281b'
  on-primary: '#fff8f0'
  primary-container: '#9b4e43'
  on-primary-container: '#ffffff'
  inverse-primary: '#c89188'
  secondary: '#ffcd74'
  on-secondary: '#3a3a3a'
  secondary-container: '#ffe7a9'
  on-secondary-container: '#3a3a3a'
  tertiary: '#0267c1'
  on-tertiary: '#ffffff'
  tertiary-container: '#5197d6'
  on-tertiary-container: '#ffffff'
  error: '#c0392b'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  background: '#f7f4f2'
  on-background: '#1c1917'
  surface-variant: '#f2f1ee'
  crimson-deep: '#60150a'
  bg-light-cream: '#f7f4f2'
  bg-light-surface: '#f2f1ee'
  bg-dark-charcoal: '#171717'
  bg-dark-surface: '#0f0f11'
  text-muted: '#767371'
  text-dark-soft: '#fff8f0'
typography:
  headline-xl:
    fontFamily: Nunito
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Nunito
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Nunito
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.475rem
  DEFAULT: 0.725rem
  md: 0.725rem
  lg: 0.725rem
  xl: 1.225rem
  full: 9999px
spacing:
  container-padding: 1.5rem
  gutter: 1.5rem
  focus-ring: 3px
  transition-speed: 0.4s
---

# Design System: Next Platform

## 1. Visual Theme & Atmosphere
The Next Platform utilizes a "Modern Academic" atmosphere, balancing sophisticated scholarly tradition with cutting-edge digital utility. It leans heavily into a crisp, spacious layout punctuated by rich crimson brand elements and high-quality micro-interactions. The interface uses subtle depth through soft, expansive shadows (`shadow-lg`) and custom CSS animations (like aurora backgrounds and animated inner-shadow buttons).

The experience is designed to feel tactile, premium, and deliberate. Transitions between light and dark modes are handled via a smooth 0.9s ease curve, ensuring the shift feels fluid rather than abrupt. Dark mode shifts the environment to Rich Charcoal with Deep Space Black containers to create a sense of recessed depth, maintaining a high-contrast yet comfortable reading experience.

## 2. Color Palette & Roles

### Primary Foundation
* **Background (Light):** Cream White (`#f7f4f2`) - Provides a warm, paper-like feel that reduces eye strain compared to pure white.
* **Surface/Card (Light):** Extra Light Gray (`#f2f1ee`) - Used for cards and containers to create subtle tonal layering against the background.
* **Background (Dark):** Rich Charcoal (`#171717`) - The primary canvas in dark mode.
* **Surface/Card (Dark):** Deep Space Black (`#0f0f11`) - Used for cards to create recessed depth in dark mode.

### Accent & Interactive (Ashoka Colors)
* **Crimson Red (`#87281b`):** The primary brand color. Reserved strictly for primary call-to-action buttons, active navigation states, and prominent highlights.
* **Deep Crimson (`#60150a`):** Used exclusively for hover states, button active depth, and strong gradients.
* **Golden Yellow (`#ffcd74`):** Secondary accent color used sparingly for warnings or secondary interactive highlights.

### Typography & Text Hierarchy
* **Primary Text (Light):** Off-Black (`#1c1917`) - Ensures maximum readability without the harshness of pure black `#000`.
* **Secondary Text (Light):** Muted Gray (`#767371`) - Used for descriptions, timestamps, and subtle UI borders.
* **Primary Text (Dark):** Soft White (`#fff8f0`) - Provides high contrast against charcoal backgrounds.

### Functional States
* **Success / Green:** `#519872` (Light) to `#2b6948` (Dark)
* **Info / Blue:** `#0267c1` (Light) to `#154a7b` (Dark)
* **Error / Destructive:** `#c0392b`

## 3. Typography Rules

### Hierarchy & Weights
The system utilizes a dual-font approach:
* **Headings (`Nunito`):** All headlines (`h1` through `h6`) are bold (`font-bold`, 700 weight) and center-aligned by default. They establish a clear, authoritative editorial structure. `h1` starts at `text-4xl`, scaling down proportionally.
* **Body & Labels (`Nunito Sans`):** Body text is left-aligned, optimized for long-form legibility and information-dense environments like forms or data grids. It uses a regular weight (400) with a relaxed `1.5` to `1.75` line height.

### Spacing Principles
* Letter spacing is slightly tightened on extra-large headings (`-0.02em`) for a more cohesive headline block.
* Label text incorporates a slight tracking increase (`0.01em`) to maintain legibility at smaller sizes.

## 4. Component Stylings

### Buttons
* **Shape:** Subtly rounded corners (`rounded-md`, ~0.725rem default) matching the global `--radius` variable.
* **Padding:** Standardized at `px-4 py-2`.
* **Primary Interaction (`.button-animated`):** Primary buttons use a solid Crimson Red background with an inner shadow trick. On hover, the text turns white and an inner shadow fills the button from the bottom with Deep Crimson (`#60150a`). Active states slightly scale down (`scale(0.95)`).
* **Focus:** Accessible 3px thick focus rings (`outline-ring/50`) applied globally.

### Cards & Containers
* **Shape:** Generously rounded (`rounded-xl`, ~1.225rem) to soften the UI.
* **Elevation:** Light mode cards drop onto the background with a soft, expansive shadow (`shadow-lg`). They feature a subtle 1px border (`border-border`).
* **Padding:** Spacious internal padding, typically `p-6` or `1.5rem`.

### Scrollbars
* Custom thin scrollbars are applied globally across all browsers.
* **Thumb:** Pill-shaped, using Muted Gray (`#9ca3af` light, `#4b5563` dark) that slightly darkens on hover.
* **Track:** Fully transparent.

### Inputs & Forms
* **Styling:** Standard `rounded-md` radius with a 1px muted border (`border-border`). The background remains transparent to adapt to the container's surface color.
* **Interactions:** Number inputs hide their default spin buttons for a cleaner look. Focus states share the global accessible ring styling.

## 5. Layout Principles

### Grid & Structure
* The layout is strictly responsive, following a mobile-first approach.
* **Max Width:** Containers are typically capped at `max-w-7xl` to prevent unreadable line lengths on ultra-wide displays.
* **Fluid Grids:** Heavy use of CSS grids that collapse. E.g., `grid-cols-1` on mobile, `sm:grid-cols-2` on tablet, and `lg:grid-cols-4` for desktop data display.

### Whitespace Strategy
* **Rhythm:** The core spacing unit is `1.5rem` (24px). This dictates the internal padding of cards and the margins between major layout sections (`gap-6`, `mb-8`).
* **Page Padding:** Outer page padding scales from `px-2 py-2` on mobile to `px-8 py-8` on large screens.

### Responsive Behavior & Touch
* The system is fully responsive. Mobile layouts stack vertically (e.g., Recently Visited stacks above the Platform Carousel), while desktop layouts use side-by-side flex/grid distributions (e.g., 25% / 75% splits).
* Touch targets (buttons, inputs) are kept large to adhere to accessibility standards.

## 6. Design System Notes for Stitch Generation

### Language to Use
When prompting Stitch, use terms like: "modern academic," "spacious fluid grid," "clean utilitarian," "subtle drop shadows," "tactile micro-interactions," and "crimson accents." Avoid asking for heavy gradients or stark black/white contrasts.

### Color References
* Primary Accent: `Crimson Red (#87281b)`
* Light Mode Background: `Cream White (#f7f4f2)`
* Light Mode Card: `Extra Light Gray (#f2f1ee)`
* Dark Mode Background: `Rich Charcoal (#171717)`
* Dark Mode Card: `Deep Space Black (#0f0f11)`

### Component Prompts
* **Cards:** "A rounded-xl card with a shadow-lg and a 1px subtle border on an Extra Light Gray background, generous p-6 padding."
* **Grids:** "A 4-column responsive grid with a 1.5rem gap, stacking to 1 column on mobile."
* **Typography:** "Center-aligned bold Nunito for the section heading, left-aligned regular Nunito Sans for the body text inside the cards."