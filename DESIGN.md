---
name: GaadiPass
description: The society's basement parking level, painted as a website.
colors:
  safety-yellow: "#ffc400"
  safety-yellow-deep: "#e0a800"
  concrete-900: "#1d1f21"
  concrete-800: "#24272a"
  concrete-700: "#2f3336"
  concrete-600: "#3b4044"
  concrete-500: "#565c61"
  lime-wash: "#e9ebe7"
  lime-wash-dim: "#c9ccc7"
  stencil-ink: "#121314"
  stencil-ink-soft: "#3a3d3f"
  text-on-concrete: "#eef0ec"
  text-dim: "#b4b9b5"
  danger: "#ff6b5b"
  ok: "#7ad37a"
typography:
  display:
    fontFamily: "Stencil, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 9vw, 5.2rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Stencil, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 3.4rem)"
    fontWeight: 900
    lineHeight: 0.98
  title:
    fontFamily: "Stencil, Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 3.4vw, 1.9rem)"
    fontWeight: 900
    lineHeight: 0.98
  body:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.07em"
rounded:
  none: "0px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "24px"
  s6: "32px"
  s7: "48px"
  s8: "64px"
  s9: "96px"
  wrap: "1120px"
components:
  button-primary:
    backgroundColor: "{colors.safety-yellow}"
    textColor: "{colors.stencil-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-on-concrete}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    height: "52px"
  field:
    backgroundColor: "{colors.concrete-900}"
    textColor: "{colors.text-on-concrete}"
    rounded: "{rounded.none}"
    padding: "12px 14px"
    height: "50px"
  pillar-plate:
    backgroundColor: "{colors.lime-wash}"
    textColor: "{colors.stencil-ink}"
    rounded: "{rounded.none}"
    padding: "24px"
  step-bay:
    backgroundColor: "{colors.concrete-900}"
    textColor: "{colors.text-dim}"
    height: "64px"
    padding: "12px"
  step-bay-current:
    backgroundColor: "{colors.safety-yellow}"
    textColor: "{colors.stencil-ink}"
  chip:
    textColor: "{colors.stencil-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "3px 10px"
    height: "28px"
  footer:
    backgroundColor: "{colors.concrete-900}"
    textColor: "{colors.text-dim}"
---

# Design System: GaadiPass

## Overview

**Creative North Star: "Basement Parking Wayfinding"**

Every page is one level of an Indian apartment basement: dark poured concrete underfoot, lime-washed pillar faces carrying black stencil lettering, yellow-and-black hazard bands, and painted floor arrows that lead you out. The visitor reads the site the way a driver reads a parking level: big stencilled codes first, then the arrow.

Density is low and bold. Headlines are short, stencilled and uppercase; reading text sits on concrete in Barlow. Depth is physical (a soft floor shadow under pillars and objects), never glass, gloss or gradient sheen. Corners are square everywhere, as painted concrete is.

**Key Characteristics:**
- Concrete ground with a faint two-layer aggregate texture, no gradients.
- Lime-wash pillar plates for anything that must read as a sign (headlines, price, summary, order number).
- Safety yellow reserved for what is live or actionable.
- Hazard bands as the only section divider.
- Square corners, stencil display type, one orchestrated scroll motion.

## Colors

A near-monochrome concrete-and-paint palette with a single high-voltage accent.

### Primary
- **Safety Yellow** (safety-yellow): the primary button, the floor arrow into Order, the scroll lane line, the ringing call glow, the current step bay, focus rings, text links and caret. Safety Yellow Deep is the darker shade of the same paint.

### Neutral
- **Basement Concrete** (concrete-800): page background, with the aggregate noise layered on top.
- **Lower Level Concrete** (concrete-900): fields, footer, step lane, jump list, admin viewer bar.
- **Kerb Slab** (concrete-700): FAQ slabs, directory rows, ghost button hover.
- **Pillar Seam** (concrete-600) and **Tyre Mark** (concrete-500): hairlines, field strokes, inactive markers, disabled buttons.
- **Lime-Wash** (lime-wash) and **Weathered Lime-Wash** (lime-wash-dim): pillar faces and painted bay lines; the dim one for dashed rules and list bullets.
- **Stencil Ink** (stencil-ink) / **Soft Ink** (stencil-ink-soft): text on lime-wash.
- **Concrete Text** (text-on-concrete) / **Dim Text** (text-dim, at least 4.5:1 on concrete-800): text on concrete.

### Status
- **Danger** (danger): field errors, form alert outline, cancelled chip. **OK** (ok): done-step tick, delivered chip.
- Payment brand colours (PhonePe #5f259f, GPay #1a73e8, Paytm #00baf2) are scoped to the order page app tiles only.

### Named Rules
**The Live Paint Rule.** Yellow marks only live things: the action, the path to it, the current state, focus. Never use it for decoration, headings or illustration fill beyond the call glow. The structural exception is the hazard band, which is yellow by nature.

**The Two Surfaces Rule.** Text sits either on concrete (light text) or on a lime-wash plate (ink text). There is no third surface colour.

## Typography

**Display Font:** Big Shoulders Stencil Display, self-hosted as "Stencil" (falls back to Barlow, system-ui)
**Body Font:** Barlow 400/500/600/700, self-hosted (falls back to system-ui)

**Character:** painted stencil codes over a road-sign workhorse. Display is always weight 900 and uppercase; body is never uppercase except labels.

### Hierarchy
- **Display** (900, clamp(2.6rem, 9vw, 5.2rem), 0.98): page h1; the hero h1 runs tighter (clamp(2.4rem, 10.4vw, 5rem), 0.92). Price numerals go larger (up to 8rem, 0.85).
- **Headline** (900, clamp(2rem, 6vw, 3.4rem), 0.98): section h2; policy h2 drops to clamp(1.55rem, 4.6vw, 2.05rem).
- **Title** (900, clamp(1.4rem, 3.4vw, 1.9rem)): h3 and sign titles; group titles and button labels use 1.35rem with 0.03–0.04em tracking.
- **Body** (400, 17px, 1.55, max 68ch); policy prose 1.0625rem / 1.7 / 70ch.
- **Label** (700, 0.8–0.95rem, 0.06–0.07em, uppercase): chips, table heads, fact terms, amount label, bay names.

### Named Rules
**The Stencil Is Paint Rule.** Stencil type is only ever 900 weight, uppercase and balanced; never set body copy, long sentences or form inputs in it.

**The Tabular Money Rule.** Prices, order numbers and dates use tabular numerals; the rupee sign is set in Barlow 700 at 0.72em beside stencil numerals.

## Layout

Mobile first. Content sits in a centred wrap of 1120px max with a 16px gutter each side. Spacing follows an 8pt scale (s1–s9); major sections take s8–s9 above, and hazard bands take s8 margin (s9 from 960px). Headings get more air above than below.

Breakpoints in use: 520px (compact nav, stacked bay labels), 640px (two-column grids, pack sizes), 760px (pay layout, admin rows), 960px (hero split 5fr/6fr, sticky 340px order summary, wider lane gap), 1040px (policy pages gain a sticky jump list beside 70ch prose).

Composition is deliberately unequal: home-page signs sit on a 6-column grid with spans of 3, 2 and 4, not a row of equal cards.

## Elevation & Depth

Flat surfaces lit from above: depth is a single soft floor shadow cast downward under pillars, scenes, slabs and the primary button. No glows except focus, no blur, no glass.

### Shadow Vocabulary
- **Floor shadow** (`0 18px 28px -14px rgba(0,0,0,.65)`): under every pillar plate, scene illustration, FAQ slab and the selected pack.
- **Button shadow** (`0 10px 18px -10px rgba(0,0,0,.7)`): primary button only.
- **Painted line** (`inset 0 0 0 2px` concrete-500 or lime-wash-dim): ghost buttons, pack faces, shipped chip. These are painted lines, not rounded borders.

### Named Rules
**The Floor Shadow Rule.** Shadows fall down onto the floor and never rise; one shadow per object.

## Shapes

Every corner is square (0px radius), buttons and fields included. Silhouettes come from paint: -45° hazard stripes (14px yellow / 14px ink), dashed lane lines (18px dash, 12px gap, 6px wide), clip-path arrowheads and chevrons, and title plates with a 14px hazard-painted foot.

## Components

### Buttons
- **Shape:** square (0px).
- **Primary:** safety-yellow paint, stencil-ink label in Stencil 900 uppercase 1.35rem, min-height 52px (56–60px for hero, big and go variants), padding 12px 24px.
- **Hover / Active:** lighter yellow on hover; presses down 2px on active (0.15s, cubic-bezier(.2,.8,.2,1)). Disabled turns concrete-500 with dim paint text.
- **Ghost:** transparent with a painted 2px concrete-500 inset line; hover fills concrete-700.
- **Text link button:** yellow Barlow 600, underlined, 44px minimum target.

### Floor Arrow CTA
The primary button sits at the end of a painted dashed yellow shaft with a triangular arrowhead pointing into it; on desktop the shaft stretches along the floor.

### Inputs / Fields
- **Style:** concrete-900 fill, 2px concrete-500 stroke, square, min-height 50–52px, Barlow 500 1.05rem; labels Barlow 600 above, hints in dim text.
- **Focus:** stroke turns yellow plus a 3px yellow halo at 35%; caret is yellow.
- **Error:** stroke and halo turn danger; message in danger 600 below.

### Pillar Plates
Lime-wash face, ink text, floor shadow, square. Plates carrying a page title get a 14px hazard band along the foot; the hero plate adds a faint oversized pillar code (Stencil 900 at 16% ink) in the corner.

### Hazard Bands
14px tall, -45° yellow/ink stripes, full wrap width. They are the only divider between sections.

### Step Bays (order flow)
Three parking bays in a concrete-900 strip bounded by 3px lime-wash lines top, bottom and between bays. Each bay shows a stencil number and an uppercase Barlow name. The current bay is wiped in with yellow floor paint left to right (clip-path, 0.55s, cubic-bezier(.16,1,.3,1)); done bays turn lime-wash with a green tick.

### Pack Selector
Five equal painted bays (concrete-900, painted inset line); the chosen bay becomes a lime-wash plate with a 3px ink line and floor shadow.

### Chips (admin status)
Square, Barlow 700 0.8rem uppercase, 28px tall. Submitted is yellow (needs action, so live), verified lime-wash, shipped concrete with a painted outline, delivered ok-green, cancelled a danger outline.

### Navigation
A lime-wash brand plate stencilled "GAADIPASS" with its last letters on a yellow patch; links in Barlow 600 on concrete turn yellow on hover, 44px targets; optional links hide under 520px. The footer is concrete-900 with dim text and a row of light links.

### Motion
- **The phone rings once.** On load the hero phone shakes (1.1s) and its call glow pulses (1.6s), once, after 0.5s.
- **The lane line.** A dashed yellow lane line draws down the home level in step with scroll, with an arrowhead while drawing. Without JS it is fully painted.
- **Reduced motion:** the ring is removed, the lane stays fully painted, smooth scroll is off, and all transitions collapse to near zero.

## Do's and Don'ts

### Do:
- **Do** keep yellow for the action, the path to it, the current step and focus (The Live Paint Rule).
- **Do** put headlines, prices and order numbers on lime-wash pillar plates in Stencil 900 uppercase.
- **Do** separate sections with the 14px hazard band.
- **Do** use the 8pt scale (4–96px) and the single floor shadow.
- **Do** keep touch targets at 44px or more and focus rings at 3px yellow with 3px offset.
- **Do** let motion happen once (the ring) or be tied to scroll (the lane), and respect reduced motion.

### Don't:
- **Don't** round corners on any element.
- **Don't** use gradients, glass, blur or glow as a surface treatment; the aggregate noise is the only texture.
- **Don't** set body text or inputs in the Stencil face.
- **Don't** paint headings, illustration fills or decorative shapes yellow.
- **Don't** lay out benefits as a row of equal cards; signs differ in kind and size.
- **Don't** add looping or ambient animation on customer pages.
