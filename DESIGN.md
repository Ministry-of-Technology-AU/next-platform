---
name: Ministry of Technology Brandbook
colors:
  surface: '#141312'
  surface-dim: '#141312'
  surface-bright: '#3b3937'
  surface-container-lowest: '#0f0e0d'
  surface-container-low: '#1d1b1a'
  surface-container: '#211f1e'
  surface-container-high: '#2b2a28'
  surface-container-highest: '#363433'
  on-surface: '#e6e1df'
  on-surface-variant: '#ddc0bb'
  inverse-surface: '#e6e1df'
  inverse-on-surface: '#32302e'
  outline: '#a58b86'
  outline-variant: '#57423e'
  surface-tint: '#ffb4a7'
  primary: '#ffb4a7'
  on-primary: '#630d05'
  primary-container: '#87281b'
  on-primary-container: '#ffa090'
  inverse-primary: '#a33c2d'
  secondary: '#f0bf68'
  on-secondary: '#422d00'
  secondary-container: '#795501'
  on-secondary-container: '#ffcd74'
  tertiary: '#a7c8ff'
  on-tertiary: '#003060'
  tertiary-container: '#00498c'
  on-tertiary-container: '#8ebaff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a7'
  on-primary-fixed: '#400100'
  on-primary-fixed-variant: '#832519'
  secondary-fixed: '#ffdea9'
  secondary-fixed-dim: '#f0bf68'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001b3b'
  on-tertiary-fixed-variant: '#004788'
  background: '#141312'
  on-background: '#e6e1df'
  surface-variant: '#363433'
typography:
  display-lg:
    fontFamily: Nunito
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Nunito
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: '0'
  body-base:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-bold:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: '0'
  label-caps:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 8px
  margin-desktop: 32px
  max-width: 1280px
---

## Brand & Style

This design system establishes an atmosphere of **enduring authority and civic responsibility**, blending the stability of historic government institutions with high-tech administrative capability. The brand personality is grounded, intellectual, and highly dependable.

The visual style is a sophisticated mix of **Corporate Modern** and **Tactile Heritage**. In its dark mode configuration, the system shifts from a "paper-like" feel to a "command center" aesthetic, evoking the trust of established institutions operating with modern efficiency. By utilizing a palette reminiscent of historic masonry and gold-embossed charters, the UI maintains its prestigious identity while optimizing for high-fidelity administrative focus.

Key visual pillars:
- **Heritage Foundation:** Use of deep terracotta and ochre gold to signify prestige and permanence against a deep, scholarly dark backdrop.
- **Administrative Precision:** Clear hierarchy, centered headings for formal symmetry, and structured data grids.
- **Tactile Responsiveness:** Subtle micro-interactions and sliding transitions that give digital actions a physical weight.

## Colors

The palette balances rich, heritage-inspired hues with modern utility colors, optimized for a professional **dark mode** environment.

- **Primary (Deep Terracotta):** Used for main brand accents, primary actions, and critical focus states. It represents official authority and remains the anchor of the visual identity.
- **Secondary (Warm Ochre Gold):** Reserved for excellence markers, active engagement highlights, and prestigious achievement badges. It provides a warm, high-contrast glow against dark surfaces.
- **Tertiary (Official Cobalt):** Used for informative links and system notifications, providing a clear functional contrast to the heritage reds.
- **Neutral (Stone & Charcoal):** Pure black is avoided. Instead, we use deep charcoal tones for the primary background canvas to reduce visual fatigue and maintain the "Tactile Heritage" feel.
- **Functional States:** **Sage Pine Green** (#519872) is used for success and validated entries, maintaining a muted, professional tone.

## Typography

The typography system pairs a rounded, welcoming heading typeface with a clean, high-legibility body typeface designed for dense administrative data.

- **Headings (Nunito):** Used to provide a friendly yet authoritative face. By default, major headings (H1-H3) should be **centered** to create a symmetric, formal layout.
- **Body (Nunito Sans):** Selected for its exceptional x-height, ensuring clarity in long-form reports and complex data grids. Body text should be **left-aligned** for optimal readability.
- **Scaling:** On mobile devices, `display-lg` should scale down to `30px` to maintain visual balance within the smaller viewport.

## Layout & Spacing

This design system utilizes a **fixed-fluid hybrid grid** centered on a maximum canvas width of 1280px. This prevents visual stretching on ultra-wide displays while maintaining a structured administrative feel.

- **Layout Model:** A 12-column grid system is used for desktop layouts. Content is bound within a central container with responsive horizontal padding.
- **Breakpoints:**
    - **Mobile (< 640px):** 8px margins (`margin-mobile`), 16px gutters. Minimalist padding to maximize touch targets.
    - **Tablet (640px - 1024px):** 16px to 24px margins, 24px gutters.
    - **Desktop (> 1024px):** 32px margins (`margin-desktop`), 32px gaps for an open, airy canvas.
- **Rhythm:** A 4px baseline unit governs all spacing. Vertical rhythm between sections should be strictly maintained using standardized separators with 24px-32px of vertical clearance.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows** that emulate physical stacks of paper and official folders, adapted for a dark environment.

- **Surface Tiers:** The background uses the deep charcoal base. Cards and containers use a slightly brighter or more vibrant dark surface to create "lift" and distinguish between content hierarchies.
- **Shadow Character:** In dark mode, we rely more on tonal shifts (using brighter surface containers) than heavy shadows. However, a diffused, low-opacity ambient shadow is used to separate primary modules from the canvas clearly.
- **Borders:** Every container must have a subtle, low-contrast outline in a muted stone gray to define the boundaries of administrative data without creating visual noise.
- **Interaction Depth:** Hover states on interactive elements should use a slight vertical lift (upward translation) or a tonal shift (brightening) rather than an increase in shadow spread, maintaining a formal institutional aesthetic.

## Shapes

The shape language is **Rounded** and structured. We use significant consistent rounding to balance the serious nature of government data with a modern, accessible interface.

- **Base Radius (0.5rem):** Used for standard inputs, small buttons, and checkboxes.
- **Large Radius (1rem):** Used for secondary buttons and navigation elements.
- **Extra Large (1.5rem):** The standard for cards and main dashboard widgets, reinforcing the "modular" bento-box feel.
- **Pill-shaped:** Reserved exclusively for status tags (chips) and the global search trigger to make them instantly distinguishable from actionable buttons.

## Components

### Buttons
- **Primary:** Deep Terracotta background with white text. Feature a "sliding fill" hover animation where a darker burgundy fills the button from the bottom. Rounded at 0.5rem.
- **Secondary:** Warm Ochre Gold with dark text. Uses a 1rem radius to distinguish it as a specialized action.
- **Outline:** Thin light-gray border with a transparent background, lifting slightly on hover.

### Cards
- **Structure:** 1.5rem rounded corners, stone-grey border, and a subtle tonal shift for depth.
- **Header:** Should feature a bold Nunito heading with a standard 1.5rem (24px) padding.

### Inputs & Forms
- **Fields:** 0.5rem rounded corners with a "Stone Gray" border.
- **Focus State:** Transitions to a thick, 3px outer ring in a semi-transparent primary red to ensure accessibility without using high-vibrancy blues.
- **Toggles:** Custom wide pill switches that transition from a muted moon aesthetic (off) to a terracotta sun aesthetic (on).

### Navigation
- **App Sidebar:** Uses a refined deep charcoal background. Features a delayed collapse-on-idle timer (2.5s) to maximize space for data-heavy workflows.
- **Search:** A global "Command+K" search trigger should be visible in the top bar at all times, styled as a pill-shaped input.

### Specialized Components
- **Bento Grid:** Used for dashboard stats to create varied visual interest using multi-column and multi-row spans.
- **Separators:** Use a hairline width in Stone Gray with generous vertical margins to divide major content domains.