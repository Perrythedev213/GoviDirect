---
name: GoviDirect
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#41493e'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#835400'
  on-secondary: '#ffffff'
  secondary-container: '#fcab28'
  on-secondary-container: '#694300'
  tertiary: '#4d352b'
  on-tertiary: '#ffffff'
  tertiary-container: '#674b41'
  on-tertiary-container: '#e2bdb0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#ffb957'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#e4beb2'
  on-tertiary-fixed: '#2b160f'
  on-tertiary-fixed-variant: '#5b4137'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-sm: 0.75rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes a high-trust, resilient peer-to-peer agricultural network connecting rural Sri Lankan producers with urban consumers and commercial buyers. It blends agrarian honesty with streamlined fintech clarity.

### Personality & Emotional Response
- **Trustworthy & Resilient:** Communicates transparent pricing, direct-from-farm authenticity, and transactional reliability.
- **Vibrant & Fertile:** Evokes fresh harvest quality, rural vitality, and equitable trade.
- **Clear & Approachable:** Removes literacy and technological friction for rural farmers operating outdoors under bright sunlight, while offering sophisticated operational efficiency to commercial restaurateurs.

### Design Movement: Warm Tactile Modernism
A fusion of modern functional layout and tactile agrarian cues. Surfaces feature warm, clay-tinted organic paper tones rather than stark clinical whites. Cards utilize soft, ground-hugging ambient drop shadows reminiscent of physical trade invoices and field crates, paired with bold iconography, touch-friendly targets (minimum 48px), and high-contrast typographic hierarchy.

## Colors

The palette is tuned for legibility under bright outdoor glare while maintaining freshness and professional utility.

### Role Allocations
- **Primary (`#1B5E20` deep forest green, accented by `#2E7D32` emerald):** Primary actions, critical verification badges, active navigation states, and order confirmation flows.
- **Secondary (`#F9A825` harvest gold):** Bidding highlights, yield alerts, time-sensitive batch expirations, and rating metrics.
- **Tertiary (`#8D6E63` warm terracotta, with `#EFEBE9` and `#D7CCC8` containers):** Soil-type chips, delivery status trackers, rustic card backgrounds, and category filters.
- **Neutral (`#1E293B` slate to `#0F172A` deep charcoal):** High-contrast body typography, ensuring AA/AAA compliance against `#F8FAF8` off-white field backdrops.
- **Surface Canvas (`#F8FAF8` tinted leaf-white, `#FFFFFF` pure card fill):** Reduces eye strain during field audits and long invoice generation sessions.

## Typography

Plus Jakarta Sans brings a welcoming yet structured geometric profile, maintaining distinct letter apertures for Sinhala, Tamil, and English multilingual cross-compatibility.

- **Weight Distinctions:** Bold (`700`) is reserved for currency values, harvest weights, and batch titles. Semi-bold (`600`) handles micro-labels and directional actions. Regular (`400`) handles logistical descriptions and invoice line items.
- **Optical Readability:** Display sizes decrease on mobile viewports to prevent orphan numerals in wholesale pricing.
- **Multilingual Accommodation:** Line heights remain generous (1.4 to 1.5x) to prevent diacritic clipping in trilingual interfaces.

## Layout & Spacing

A mobile-first 4-column fluid grid system expanding to 8 columns on tablets and 12 columns on desktop web dashboards.

### Responsive Breakpoints & Reflow
- **Mobile (< 600px):** 4 columns, `gutter-sm` (12px), `margin` (16px). Single-stack order flows, sticky bottom transaction bars, quick-access thumb zones for voice input.
- **Tablet (600px - 1023px):** 8 columns, `gutter` (16px), `margin-md` (24px). Split master-detail layout for order fulfillment and inventory tracking.
- **Desktop (>= 1024px):** 12 columns, max container width 1280px, `gutter-lg` (24px), `margin-lg` (32px). Multi-pane live mandi bidding boards, truck dispatch telemetry, and bulk pricing analytics.

### Rhythm
Spacing values follow a strict 4px/8px modular cadence. Touch targets default to 48px height with a minimum `space-sm` separation to prevent mis-taps during active transit or warehouse handling.

## Elevation & Depth

Visual hierarchy is expressed through organic ambient elevation rather than stark drop shadows, emulating paper-thin harvest receipts stacked on natural clay surfaces.

### Depth Scales
- **Surface Flat (Level 0):** Background canvas (`#F8FAF8`) for static layout scaffolding.
- **Surface Low (Level 1):** Standard product cards and inventory tiles. Shadow: `0px 2px 4px rgba(27, 94, 32, 0.04), 0px 1px 2px rgba(30, 41, 59, 0.06)`, framed by a 1px solid `#EFEBE9` border.
- **Surface Mid (Level 2):** Filter chips in active states, interactive dropdown menus, and cart summaries. Shadow: `0px 4px 12px rgba(27, 94, 32, 0.08), 0px 2px 4px rgba(30, 41, 59, 0.04)`.
- **Surface High (Level 3):** Modals, negotiation bottoms-sheets, multilingual voice input overlays. Shadow: `0px 12px 32px rgba(15, 23, 42, 0.12), 0px 4px 8px rgba(15, 23, 42, 0.04)`.

### Border Cues
All raised surfaces pair with soft border outlines (`#EFEBE9` or `#D7CCC8`) to ensure distinct surface separation in extreme outdoor brightness where soft shadows wash out.

## Shapes

The design system employs a balanced, approachable shape language (Level 2: Rounded).

- **Base Radius (`0.5rem` / 8px):** Applied to form controls, micro badges, table cells, and price tags.
- **Large Radius (`1rem` / 16px):** Applied to marketplace product cards, delivery tracking panels, and order status banners.
- **Extra Large Radius (`1.5rem` / 24px):** Used on bottom sheets, floating voice-search pods, and promotional hero banners.
- **Pill Shape (`9999px`):** Strictly reserved for chips, active status tags ("In Transit", "Verified Farmer"), and primary floating circular action buttons.

## Components

### Buttons
- **Primary:** Solid `#1B5E20` fill, `#FFFFFF` bold text, pill or 8px radius, minimum 48px height. Active states shift to `#2E7D32` with a subtle inward scale (0.98x).
- **Secondary:** Transparent background with a 1.5px border of `#1B5E20` and text in `#1B5E20`.
- **Harvest Accent (Negotiate/Bid):** `#F9A825` fill with `#0F172A` high-contrast typography for critical trading actions.
- **Voice Input Action:** Floating action button (56px) featuring microphone glyph, pulsating circular ripple indicator using primary emerald tint.

### Chips & Badges
- **Status Badges:** Small caps `label-sm`, pill shape, 4px vertical padding, 10px horizontal padding.
  - *Organic / Verified:* Emerald background (`rgba(46, 125, 50, 0.12)`) with `#1B5E20` text.
  - *Pending / Bidding Open:* Harvest gold background (`rgba(249, 168, 37, 0.16)`) with `#8F5D00` text.
  - *Soil / Region Origin:* Terracotta background (`#EFEBE9`) with `#5D4037` text.
- **Filter Chips:** 8px rounded corners with `1px` border of `#D7CCC8`. Selected state fills with `#1B5E20` and white text.

### Cards (Produce & Order)
- White background (`#FFFFFF`), `1rem` radius, Level 1 shadow with `#EFEBE9` border.
- Divided into three visual anchors:
  1. Produce imagery or grade icon with corner tag (e.g., "Grade A • Jaffna Red Onions").
  2. Pricing block with dynamic unit metrics (`Rs. 320 / kg`) in `headline-sm` bold.
  3. Producer micro-profile: Farmer avatar, verified green checkmark, delivery turnaround time.

### Input Fields & Multilingual Voice Elements
- Form controls feature an off-white background (`#F8FAF8`), 8px radius, 1.5px border of `#D7CCC8`, transitioning to `#1B5E20` on focus.
- Integrated voice microphone icon anchored in the trailing position of search inputs, enabling localized audio queries (Sinhala / Tamil speech-to-text).
- Numeric keypads tailored for harvest weights (kg/tonnes) with large touch pads and zero-ambiguity digit scaling.

### Lists & Transaction Feeds
- Separated by hairline dividers (`#EFEBE9`).
- Compact table layouts for bulk buyers; expanded stacked view with tap-to-expand logistics breakdowns for field-level viewing.