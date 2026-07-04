---
name: Professional Financial Reporting System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
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
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  sidebar-width: 240px
  sidebar-collapsed-width: 64px
---

## Brand & Style

The design system is engineered for high-stakes financial environments where Chartered Accountants require precision, speed, and cognitive clarity. The brand personality is **authoritative, analytical, and invisible**, prioritizing data integrity over aesthetic flourish. 

The visual style follows a **High-Density Corporate** approach. It eliminates all decorative elements to maximize information density. The interface acts as a high-performance tool, utilizing a "Data-First" hierarchy that ensures the most critical financial metrics are immediately legible. Every pixel must serve a functional purpose, facilitating long-form auditing and complex reporting tasks without visual fatigue.

## Colors

The palette is rooted in **Deep Navy and Slate Grays** to establish a sense of stability and institutional trust. 

- **Primary (#0F172A):** Used for structural navigation and primary headings to anchor the layout.
- **Secondary (#2563EB):** Reserved for primary actions, active states, and focus indicators.
- **Neutral Scale:** A rigorous range of Slate grays is used to differentiate between background layers, table headers, and borders.
- **Functional Colors:** Success, Warning, and Error colors are used with high-contrast text ratios to ensure compliance and immediate error recognition during data entry. These are applied to badges, status icons, and validation states.

## Typography

This design system utilizes **Inter** for its exceptional legibility and comprehensive OpenType features, which are critical for financial data. 

To achieve high density, the base body size is set to **14px**. We leverage **Tabular Numbers (tnum)** for all financial figures to ensure that columns of data align perfectly, allowing accountants to scan vertical lists of numbers with ease. The type scale is intentionally tight to maximize the amount of information visible on a standard 14" laptop screen without requiring excessive scrolling.

## Layout & Spacing

The layout employs a **Fixed Sidebar + Fluid Content Area** model. The sidebar can be collapsed to an icon-only view to prioritize the workspace for large data tables. 

A **4px baseline grid** governs all spacing. This allows for the "Dense" sizing required by professional tools. 
- **Tables:** Use a 12px gutter to maximize column count.
- **Margins:** 24px outer page margins, scaling down to 16px on smaller viewports.
- **Breakpoints:**
  - Mobile: <768px (Single column, sidebar hidden in a hamburger menu).
  - Tablet/Small Laptop: 768px - 1280px (Collapsed sidebar by default).
  - Desktop: >1280px (Standard expanded view).

## Elevation & Depth

To maintain high contrast and clarity, the design system avoids soft ambient shadows. Instead, it uses **Tonal Layering and Low-Contrast Outlines**.

- **Level 0 (Canvas):** Background color (#F8FAFC).
- **Level 1 (Cards/Containers):** White surface with a 1px border (#E2E8F0).
- **Level 2 (Dropdowns/Modals):** White surface with a subtle, tight shadow (Blur: 4px, Y: 2px, Opacity: 0.1) and a 1px border.
- **Sticky Headers:** Use a solid background with a slightly darker 1px bottom border to indicate they are fixed during scroll.

This "Flat-Plus" approach ensures that elements are clearly separated without introducing visual "fuzziness" that shadows can create in data-heavy environments.

## Shapes

The design system uses a **Soft (4px)** roundedness level. This provides a professional, modern feel while maintaining the rigid structure expected in an accounting tool. 

- **Inputs & Buttons:** 4px radius.
- **Cards & Modals:** 6px radius.
- **Badges/Chips:** 2px or fully square for a more "utilitarian" feel if necessary, though 4px is the system default. 

Sharp corners are avoided to prevent the UI from feeling "harsh," but the radius is never large enough to waste white space or feel consumer-oriented.

## Components

### Tables (The Core Component)
- **Header:** Sticky positioning, background color #F1F5F9, 12px vertical padding.
- **Rows:** 1px bottom border only; no side borders. Use zebra striping (alternate row background #F8FAFC) for wide tables.
- **Cells:** Numeric data must be right-aligned with tabular font settings. Text data is left-aligned.

### Buttons
- **Primary:** Deep Navy background, white text. Compact height (32px or 36px).
- **Secondary/Ghost:** 1px border in Slate-300 or no border. Used for "Cancel" or "Export" actions.

### Form Fields
- **Inputs:** 1px Slate-300 border, turns Blue-600 on focus. Label is 12px Medium weight, positioned directly above the input with 4px spacing.
- **Validation:** Error messages appear immediately below the input in 12px Red-800.

### Status Badges
- **Style:** Small, subtle background tint with high-contrast text. For example, "Paid" status uses a light green background with dark green text. No icons unless they denote a specific alert level.

### Breadcrumbs
- **Style:** 12px Gray-500 text with "/" separators. Used on all sub-pages for clear hierarchical navigation.