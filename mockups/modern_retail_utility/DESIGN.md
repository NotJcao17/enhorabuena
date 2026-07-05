---
name: Enhorabuena Domesticity
colors:
  surface: '#f8f9fa'
  surface-dim: '#dad9df'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f9'
  surface-container: '#eeedf3'
  surface-container-high: '#e8e7ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c20'
  on-surface-variant: '#434750'
  inverse-surface: '#2f3035'
  inverse-on-surface: '#f1f0f6'
  outline: '#737781'
  outline-variant: '#e2e2e8'
  surface-tint: '#395e99'
  primary: '#001f46'
  on-primary: '#ffffff'
  primary-container: '#00346d'
  on-primary-container: '#7b9ede'
  inverse-primary: '#aac7ff'
  secondary: '#015fac'
  on-secondary: '#ffffff'
  secondary-container: '#6cabfd'
  on-secondary-container: '#003e74'
  tertiary: '#371700'
  on-tertiary: '#ffffff'
  tertiary-container: '#562900'
  on-tertiary-container: '#d38e5d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#1e4680'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004884'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#6c3a0f'
  background: '#f9f9fe'
  on-background: '#1a1c20'
  surface-variant: '#e2e2e7'
  success-stock: '#00346d'
typography:
  headline-xl:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-sale:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 16px
  margin-desktop: 48px
  gutter: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

## Brand & Style
The brand identity is rooted in **Corporate Modernism** with a focus on domestic organization and efficiency. It targets homeowners who value cleanliness and order, evoking a sense of calm, reliability, and premium accessibility.

The visual style is characterized by a "Fidelity" approach—using a high-contrast primary blue against a very clean, nearly-white canvas. It balances the utility of a catalog with the polished feel of a lifestyle magazine through generous use of high-quality imagery and a structured, systematic grid.

## Colors
The palette is dominated by **Deep Navy (#00346d)** which communicates authority and stability. 

- **Primary:** Used for branding, primary actions, and critical status indicators (like stock availability).
- **Secondary:** Employed for interactive elements and highlights.
- **Backgrounds:** A crisp off-white (#f8f9fa) background provides a soft canvas that prevents eye strain compared to pure white, while pure white (#ffffff) is reserved for cards and containers to create a subtle lift.
- **Functional Colors:** A vibrant Red (#ba1a1a) is used specifically for "Oferta" (Sale) badges and cart notifications to drive urgency.

## Typography
The system uses a pairing of **Work Sans** for display roles and **Inter** for functional roles. 

- **Work Sans** provides a sturdy, professional character for headlines and pricing, where its geometric nature aids readability for numbers.
- **Inter** is utilized for body text and labels to maintain high legibility at smaller scales.
- **Visual Hierarchy:** Heavy weights (600-700) are used aggressively for branding and price points to ensure immediate information scent.

## Layout & Spacing
The layout follows a **Fixed-Width Container** approach for desktop (max-width 1280px) and a **Fluid Grid** for mobile.

- **Grid:** A 2-column grid is used for product listings on mobile to maximize screen real estate while maintaining image clarity.
- **Margins:** A standard 16px lateral margin is enforced on mobile devices.
- **Vertical Rhythm:** Sections are separated by 32px (xl) blocks, while internal component spacing (like card padding) stays within 12-16px.
- **Navigation:** A sticky top bar (64px height) ensures critical navigation remains accessible.

## Elevation & Depth
Depth is conveyed through a combination of **Tonal Layering** and **Ambient Shadows**.

- **Surfaces:** The background uses a "Dim" surface (#f8f9fa), while interactive cards and the header use a "Bright/Lowest" surface (#ffffff).
- **Shadows:** The "Product Card" shadow is extremely subtle: `0px 4px 12px rgba(26, 26, 46, 0.05)`. This creates a soft lift that suggests "tap-ability" without looking heavy.
- **Interactions:** On hover or active states, the elevation increases slightly via a 4px vertical translation and a more pronounced shadow blur.
- **Dividers:** Low-contrast outlines (#e2e2e8) are used to define boundaries in navigation and input fields, maintaining a flat, modern aesthetic.

## Shapes
The shape language is **Rounded**, leaning towards a friendly but structured appearance.

- **Cards & Hero Banners:** Use `rounded-xl` (1.5rem / 12px-24px depending on scale) to soften the edges of photography.
- **Buttons & Chips:** Use `rounded-full` (Pill-shaped) for category filters and primary CTAs to make them feel distinct from the rectangular product grid.
- **Input Fields:** Use `rounded-lg` (0.5rem / 8px) to provide a more technical, utility-focused feel.

## Components

### Buttons
- **Primary:** Pill-shaped, white text on primary blue.
- **Secondary/Outline:** Bordered with primary blue, transparent background, bold text. Used for "Cargar más."
- **Ghost/Text:** Transparent background with primary blue text for "Ver todos" links.

### Product Cards
- Vertical stack with fixed-aspect ratio image (approx 1:1 or 4:3).
- Bordered with `outline-variant` and a soft shadow.
- Content includes a category label (all-caps), title (line-clamp-2), and price group.

### Chips (Categories)
- Pill-shaped. Active state uses `primary-container` (light blue) with navy text. Inactive states use `surface-container-highest` (light grey).

### Input Fields
- Integrated search bar with 1px border and leading icon. 
- High focus-state visibility using primary color borders.

### Navigation Tabs
- Full-width segmented controls with a 2px bottom border indicator for the active state. High-contrast text for selected items.