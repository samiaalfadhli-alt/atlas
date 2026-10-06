# Verification Matrix

## Required viewports and modes

Check at minimum:

- Arabic RTL: 320, 375, 768, and 1440 px.
- English LTR: 390 and 1440 px.
- Keyboard-only navigation.
- 200% zoom/text scaling.
- Reduced motion.
- Riyal font supported and font unavailable fallback.

## Assertions

- Server response has the intended `lang` and `dir`; there is no hydration direction flash.
- Arabic and English switch actual content, metadata, accessible names, numbers, and direction.
- Arabic output uses Western digits.
- Riyal amount/sign order, fallback, spacing, accessible label, and copy/paste are correct.
- Mixed Arabic/English strings, phones, emails, URLs, IDs, percentages, negatives, decimals, and ranges remain readable.
- There is no horizontal overflow or clipped focus at target widths and zoom.
- DOM reading order and keyboard order remain logical; focus is visible and restored after dialogs/menus.
- Directional icons mirror correctly and non-directional icons do not.
- Loading, empty, validation, error, offline, permission-denied, success, not-found, and global-error states are localized.
- Forms preserve caret/selection and announce validation errors.
- Motion respects reduced-motion preferences and does not block reading or input.
- No unexpected hydration, console, page, asset, or network errors occur.

## Evidence

Prefer deterministic Playwright assertions and traces. Screenshots support visual review but do not replace interaction, direction, focus, overflow, and content assertions. Real native behavior requires a native harness; Expo web alone is not native proof.
