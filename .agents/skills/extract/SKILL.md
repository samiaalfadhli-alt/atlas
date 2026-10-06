---
name: extract
description: Consolidate confirmed reusable components, semantic design tokens, variants, and interaction patterns into the project's design system.
---

# Extract a Design System

Turn repeated, confirmed visual decisions into a coherent reusable system.

## Discover

1. Locate the existing token definitions, shared UI components, variants, and
   design documentation.
2. Identify repeated components, hardcoded visual values, inconsistent variants,
   and interaction patterns that are genuinely reusable.
3. Extract only patterns that already repeat or are clearly shared by the
   planned product. Do not create speculative abstractions.

## Define

- Separate primitive values from semantic roles.
- Define semantic colors, typography roles, spacing rhythm, radii, borders,
  elevation, motion, focus, and state tokens.
- Extend accessible shadcn primitives through typed wrappers and variants rather
  than bypassing them or preserving stock styling.
- Keep component APIs small, typed, accessible, and aligned with actual product
  use cases.

## Implement

1. Add or refine shared tokens in the existing token location.
2. Create reusable variants and wrappers only where they improve consistency.
3. Replace confirmed duplicated patterns with the shared implementation.
4. Preserve RTL/LTR behavior, keyboard interaction, focus visibility, reduced
   motion, and responsive behavior.
5. Remove obsolete duplicate implementations after migration.

## Guardrails

- Do not extract one-off compositions merely to make the system look complete.
- Do not create a token for every raw value; tokens require semantic meaning.
- Do not create components so generic that their purpose becomes unclear.
- Do not introduce a second competing design system.
- Do not document hypothetical variants that the product does not use.

## Deliverable

Report the tokens, variants, shared components, and repeated patterns that now
form the design system, plus any intentionally local styling that was not
extracted and why.
