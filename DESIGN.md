# DESIGN.md

Per-project art direction and design-system contract. For a new application or
major redesign, populate `## Generated Direction` before implementing bespoke
UI. Every visual decision—tokens, typography, composition, components, imagery,
motion, copy, responsive behavior, and states—must trace back to this direction.

The target is an exceptional, production-grade product, not a stock shadcn
layout with different colors. shadcn/ui provides accessible primitives; it must
be extended through semantic tokens, variants, wrappers, and intentional
composition so it does not determine the product's visual identity.

For routine changes, preserve and reuse the existing direction. Update this file
only when the product's art direction or design system meaningfully changes.

## Required Design Workflow

For a new application or major redesign:

1. Use `frontend-design` to establish a distinctive, product-appropriate visual
   concept and avoid generic AI-generated patterns.
2. Use `hallmark` to determine the strongest structural and compositional
   direction for the product category.
3. Use `design-palettes` to develop the semantic palette and verify that color
   roles, contrast, and dark/light behavior are coherent.
4. Use `saudi-arabic-interface` for Arabic, Saudi, or bilingual products.
5. Use `extract` to consolidate confirmed reusable tokens, variants, components,
   and interaction patterns into the design system.
6. Use `adapt` when the experience has substantial responsive behavior.
7. Use `image-gen` when bespoke imagery materially strengthens the product.
   Generate alternatives, inspect them, and use only the strongest suitable
   result.
8. Use `polish` or `make-interfaces-feel-better` for the final refinement pass.
   Do not run overlapping polish passes without a specific reason.
9. Use `web-design-guidelines` for the final interface-quality and accessibility
   review.

Use `colorize`, `bolder`, `quieter`, `normalize`, `critique`, the `gsap-*`
skills, and other specialty skills only when the chosen direction or an
observed problem requires them. Using more skills is not inherently better;
every loaded skill must have a clear responsibility and produce a concrete
decision or improvement.

## Generated Direction

<!--
Replace this comment with concise, project-specific decisions. Do not write
generic design language or leave required fields blank.

### 1. Product and User
- Product name and category:
- Primary audience:
- Core user job:
- Essential roles and workflows:
- First-viewport promise:
- Primary action or conversion:
- Emotional target:

### 2. Art Direction
- Core visual concept:
- Signature visual motif:
- Hallmark mode and structural direction:
- Reference patterns and what is being borrowed:
- At least three anti-generic decisions:
- Intended density and layout posture:
- Copy posture:

### 3. Design System
- Primitive palette:
- Semantic light-mode colors: canvas, surfaces, text, borders, accent, states:
- Semantic dark-mode colors: canvas, surfaces, text, borders, accent, states:
- Verified foreground/background contrast pairs:
- Display, body, Arabic, and mono fonts:
- Type roles, scale, weights, line heights, and line-length rules:
- Spacing and section-rhythm scale:
- Grid, containers, and breakpoints:
- Radius, border, surface, elevation, and shadow system:
- Iconography and data-visualization language:

### 4. Composition and Components
- Primary page compositions and focal points:
- Navigation model:
- shadcn primitives to extend:
- Shared wrappers and variants to create:
- Buttons, forms, cards, lists/tables, dialogs/sheets:
- Content hierarchy and realistic-content requirements:
- Loading, skeleton, empty, error, success, disabled, and recovery states:

### 5. Responsive, RTL, and Interaction
- Desktop composition:
- Tablet composition:
- Mobile composition from 320px:
- What remains prominent, collapses, moves, or becomes a sheet:
- Arabic RTL and English LTR direction/mirroring rules:
- Hit-area, keyboard, focus, and affordance rules:
- Motion language, durations, easing, and sequencing:
- Reduced-motion behavior:
- Client-component boundaries for interaction:

### 6. Imagery and Assets
- Art direction for generated imagery:
- Hero and supporting asset requirements:
- Prompt requirements: subject, composition, lighting, palette, perspective,
  texture, negative space, and responsive crop:
- Candidate-selection criteria:
- Alt-text and optimization rules:
- Do-not-generate list:

### 7. Implementation and Review
- globals.css token updates:
- layout and font updates:
- shared components and variants:
- pages/routes affected:
- desktop and mobile screenshots to inspect:
- three likely visual risks:
- final verification plan:
-->

_Not yet generated. Complete the required design workflow before building a new
bespoke interface._

## Quality Standard

- Establish one memorable visual concept and at least three explicit
  anti-generic decisions. Avoid interchangeable SaaS heroes, equal-weight card
  grids, arbitrary gradients, decorative glass effects, and generic stock
  imagery unless the direction genuinely calls for them.
- Build one semantic token system for both light and dark modes. Do not scatter
  hardcoded visual values through feature components.
- Use color to communicate hierarchy, action, and state. Important text and
  controls must meet WCAG AA contrast; meaning must never depend on color alone.
- Make the primary value proposition and action identifiable within two seconds.
  Use whitespace, scale, alignment, typography, and contrast to create a clear
  eye path.
- Give Arabic and English equivalent visual authority. Validate real Arabic
  content rather than treating RTL as a mirrored afterthought.
- Use realistic domain content before judging composition. Placeholder copy and
  repeated dummy cards are not sufficient evidence of design quality.
- Design the relevant loading, empty, error, success, disabled, overflow, and
  recovery states—not only the ideal populated screen.
- Motion must explain change, preserve context, or reinforce hierarchy. Do not
  animate every element.
- Bespoke imagery must be art-directed. Generate multiple candidates when
  practical, inspect quality and crop suitability, and reject malformed,
  generic, inconsistent, or text-heavy results.
- Never generate critical text, logos, UI screenshots, or factual information
  inside raster images.

## Visual Review Gate

Before declaring a new application or major redesign complete:

1. Render the primary experience on desktop and at 320px mobile.
2. Review representative Arabic RTL and English LTR screens.
3. Inspect hierarchy, contrast, typography, wrapping, imagery, spacing,
   alignment, responsive priorities, interaction affordances, and relevant
   product states.
4. Identify and fix the three most visible design weaknesses.
5. Repeat the focused review until no major composition, hierarchy, contrast,
   overflow, or asset-quality issue remains.
6. Confirm keyboard navigation, visible focus, reduced motion, no console/runtime
   errors, and no broken or missing assets.

## Completion Checklist

- [ ] `## Generated Direction` contains concrete project decisions.
- [ ] The required core design skills were used for distinct responsibilities.
- [ ] The resulting semantic tokens are implemented in `app/globals.css`.
- [ ] Fonts and document direction in `app/layout.tsx` match the direction.
- [ ] shadcn primitives were visually extended rather than shipped with stock
      composition and styling.
- [ ] Reusable tokens, variants, and components form one coherent design system.
- [ ] Generated imagery was inspected and supports responsive crops.
- [ ] Relevant product states are designed and implemented.
- [ ] Desktop/mobile and Arabic/English visual reviews were completed.
- [ ] The three most visible design weaknesses found during review were fixed.
- [ ] Final contrast, accessibility, runtime, and asset checks passed.
