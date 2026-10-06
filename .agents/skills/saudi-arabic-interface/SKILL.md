---
name: saudi-arabic-interface
description: Build and review Saudi Arabic-first bilingual web interfaces with correct RTL/LTR behavior, bidi isolation, Western digits, Saudi Riyal display, natural Arabic copy, Saudi dates/phones/addresses, and accessibility. Use for Arabic or Saudi UI, locale switching, currency or numeric presentation, RTL layout bugs, mixed Arabic/Latin content, ecommerce and operational forms, or any interface that must work in both ar-SA and en-SA.
---

# Saudi Arabic Interface

Treat Saudi localization as a product contract, not a final translation pass. Preserve the chosen visual direction from `frontend-design` or the existing design system; this skill owns locale, direction, formatting, content, and verification invariants.

## Workflow

1. Inspect the existing locale authority, root layout, fonts, tokens, form schemas, and touched route states before editing.
2. Decide the product contract explicitly:
   - default locale: `ar-SA` unless the user says otherwise;
   - English locale: `en-SA`;
   - Arabic digits: Western `0-9` via `ar-SA-u-nu-latn`;
   - business calendar: Gregorian unless the domain explicitly requires Hijri;
   - locale authority: server-readable cookie or profile, never localStorage-only first paint.
3. Set `lang` and `dir` on the server before first paint. Do not repair direction in an effect after hydration.
4. Implement shared formatters and bidi primitives before scattering formatting through components. Read [numbers-riyal-dates.md](references/numbers-riyal-dates.md) when the UI contains numbers, money, dates, percentages, ranges, IDs, or phone fields.
5. Use logical layout and mixed-direction isolation. Read [rtl-content-and-forms.md](references/rtl-content-and-forms.md) for navigation, icons, typography, forms, Saudi fields, and Arabic copy.
6. Localize every visible state: metadata, loading, empty, validation, error, permission denied, offline, success, toast, not found, and global error.
7. Run the matrix in [verification.md](references/verification.md). Browser evidence outranks source inspection or agent prose.

## Non-Negotiables

- Use CSS logical properties and Tailwind logical utilities (`start/end`, `ms/me`, `ps/pe`). Use physical left/right only when the meaning is genuinely physical.
- Keep DOM and keyboard order semantic. Do not fix RTL by visually reversing an already-correct DOM order.
- Isolate known LTR values with `<bdi dir="ltr">` or an equivalent primitive: phone numbers, emails, URLs, order IDs, versions, hashes, dates typed by users, and technical tokens.
- Use `dir="auto"` only for unknown free-form user content.
- Never replace digits with a global regex. Format display values at the boundary; keep stored/API values machine-readable.
- Display SAR through one shared Riyal component. Prefer U+20C1 with a locally hosted supporting font and official SAMA asset fallback; fall back to `ر.س.` in Arabic and `SAR` in English.
- Do not mirror logos, media controls, clocks, checkmarks, or domain symbols. Mirror directional navigation and flow icons by meaning.
- Use natural professional Saudi Arabic, not literal English word order. Keep Arabic body line-height comfortable and avoid artificial letter spacing.
- Do not fabricate prices, inventory, authorizations, delivery promises, metrics, testimonials, or operational success. Demo behavior must be visibly labelled.
- A language switch changes content, direction, metadata, formatting, and accessible names—not only the root `dir` attribute.

## Handoff

Report the chosen locale authority, formatter primitives, fallback decisions, and exact browser checks. If official Riyal assets/fonts or domain rules are missing, state the gap and use the safe textual fallback rather than inventing an asset or policy.
