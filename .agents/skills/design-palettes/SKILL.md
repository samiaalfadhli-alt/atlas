---
name: design-palettes
description: Select an accessible, product-appropriate color system from a curated palette library. Use when creating a new application's visual identity, redesigning an interface, or when the user explicitly asks for palette or color direction. Treat this as reference data under frontend-design, not as a competing design authority.
---

# Design Palettes

Use the curated product palettes in `references/palettes.csv` to establish a coherent semantic color system.

## Workflow

1. Identify the product type, audience, emotional tone, locale, and light/dark requirements.
2. Search the CSV for the closest product categories instead of loading or presenting the entire dataset.
3. Compare no more than three relevant candidates.
4. Choose one direction and map its roles to the project's semantic design tokens.
5. Verify readable foreground/background, action, focus, border, destructive, and muted-state contrast in the actual interface.
6. Preserve an existing established palette unless the user requests a redesign or the current colors create a concrete usability problem.

## Guardrails

- Keep `frontend-design` as the primary authority for the overall visual direction.
- Use palette values as a starting system, not as mandatory hardcoded colors.
- Prefer semantic tokens over scattering hex values through components.
- Do not combine unrelated palettes or introduce many accents.
- Ensure status meaning is not communicated by color alone.
- Adapt the chosen palette for dark mode rather than mechanically inverting it.
- Do not expose the reference dataset or palette-selection process to nontechnical users unless requested.

## Reference

Search by product type or intent, for example:

```sh
rg -i "saas|education|healthcare|e-commerce|gaming" references/palettes.csv
```

The palette dataset is extracted from UI/UX Pro Max by NextLevelBuilder and retained under its MIT license. See `LICENSE.txt`.

