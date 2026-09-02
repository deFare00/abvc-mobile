---
name: Clinical Vigilance
colors:
  surface: '#f8f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f8f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e7e8eb'
  surface-container-highest: '#e1e2e5'
  on-surface: '#191c1e'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737784'
  outline-variant: '#c2c6d5'
  surface-tint: '#175bbd'
  primary: '#003c87'
  on-primary: '#ffffff'
  primary-container: '#0052b4'
  on-primary-container: '#b6ccff'
  inverse-primary: '#aec6ff'
  secondary: '#755a17'
  on-secondary: '#ffffff'
  secondary-container: '#fed889'
  on-secondary-container: '#785d1a'
  tertiary: '#850001'
  on-tertiary: '#ffffff'
  tertiary-container: '#b10002'
  on-tertiary-container: '#ffbcb1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004396'
  secondary-fixed: '#ffdf9d'
  secondary-fixed-dim: '#e6c275'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5b4300'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#930001'
  background: '#f8f9fc'
  on-background: '#191c1e'
  surface-variant: '#e1e2e5'
  surface-bg: '#F8FAFC'
  border-subtle: '#E2E8F0'
  asean-blue: '#003396'
  asean-gold: '#C1A74F'
  asean-red: '#E60012'
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Public Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Public Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Public Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter-desktop: 24px
  margin-desktop: 40px
  gutter-mobile: 12px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for high-stakes healthcare surveillance and institutional biological threat monitoring. The brand personality is **authoritative, precise, and vigilant**, functioning as a critical instrument for researchers and public health officials. 

The visual style is **Corporate / Modern**, characterized by structured information density and a "scientific" clarity. It prioritizes rapid cognitive processing through a rigorous hierarchy, utilizing an institutional color palette that signals stability and high-trust. The interface avoids decorative flourishes, favoring a systematic approach to data visualization and information architecture to ensure that surveillance insights are immediate and actionable.

## Colors
The palette is derived directly from the institutional identity to foster immediate recognition and trust.

- **Primary (Blue):** A deep, authoritative blue used for primary navigation, core actions, and brand anchoring. It represents stability and professional surveillance.
- **Secondary (Gold):** A refined metallic gold used for secondary accents, high-level certifications, and subtle highlights. It elevates the aesthetic to an institutional grade.
- **Tertiary (Red):** Reserved strictly for critical biological alerts, high-risk outliers, and system-level warnings. It is high-contrast and evokes immediate attention.
- **Neutral:** A range of professional slates and grays used for typography and structural borders.
- **Surface:** A crisp, cool-toned off-white background system designed to minimize eye strain during extended data analysis sessions.

## Typography
The design system utilizes **Public Sans** across all levels to maintain institutional consistency. Public Sans provides the necessary neutrality for technical content while ensuring maximum legibility across high-density data tables.

- **Headlines:** Feature tight letter-spacing and heavy weights to command authority and clearly define content sections.
- **Body Text:** Optimized for long-form report reading with generous line heights.
- **Labels:** Used for metadata, table headers, and form captions; these utilize slightly increased letter-spacing to improve scannability at small sizes.
- **Mobile Scaling:** Headlines are aggressively scaled down on mobile devices to preserve horizontal space for data-heavy surveillance widgets.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on a rigorous 4px baseline rhythm.

- **Desktop:** 12-column grid with a 24px gutter. Layouts should prioritize information density, using sidebars for navigation and filtering to keep the primary viewport focused on surveillance data.
- **Mobile:** 4-column grid with 16px margins. Content reflows into a single vertical stack, with data tables utilizing horizontal overflow patterns.
- **Spacing Logic:** Use "Tight" spacing (8px-12px) for grouping related data points (e.g., a metric and its label). Use "Systematic" spacing (24px-32px) to separate distinct functional modules or surveillance cards.

## Elevation & Depth
Hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** to maintain a flat, professional "dashboard" feel that doesn't distract from data.

- **Level 0 (Background):** The base canvas uses the cool-toned surface color to distinguish the workspace from individual components.
- **Level 1 (Containers):** Cards and content blocks use a pure white background with a 1px border (#E2E8F0). This creates a crisp, scientific separation without the use of heavy shadows.
- **Level 2 (Overlays):** Modals and dropdowns utilize a very soft, diffused shadow (0px 8px 24px) with a subtle primary-tint (5% opacity) to indicate temporary depth and focus.
- **Focus States:** Elements receive a 2px Primary Blue ring to ensure accessibility and clear user orientation.

## Shapes
The shape language is **Rounded** (0.5rem/8px base). This provides a modern, refined feel that softens the technical nature of the data without appearing overly casual or "bubbly."

- **Standard UI Elements:** 8px radius for buttons, input fields, and alerts to create a cohesive interactive language.
- **Data Containers:** 16px radius (`rounded-lg`) for large surveillance cards and modal windows to anchor the layout.
- **Status Indicators:** Pill-shaped (fully rounded) indicators are reserved for status badges (e.g., "Critical", "Stable") to clearly differentiate them from square-proportioned interactive buttons.

## Components
- **Buttons:** Primary buttons use the Primary Blue with White text. Secondary buttons use the Secondary Gold as a text/border color for a professional, institutional alternative.
- **Surveillance Cards:** The core component of the system. They feature a white background, 16px corner radius, and a subtle 1px border. Title areas should have a distinct light-gray header background.
- **Input Fields:** 1px border (#E2E8F0) with an 8px radius. Active states transition to a 2px Primary Blue border.
- **Status Badges:** Utilize 10% opacity fills of the color associated with the status (Red for High-Risk, Gold for Warning, Blue for Information) with high-contrast bold text.
- **Data Tables:** High-density rows with 1px horizontal-only dividers. Header rows use the Secondary Gold as a top-border accent to denote institutional reporting.
- **Alerts:** Critical system alerts use a thick 4px left-border in Tertiary Red to ensure they are the most prominent item on the screen.