# Numbers, Riyal, Dates, and Bidi Values

## Shared formatters

Keep persisted and API values in machine formats. Apply locale formatting only at the display boundary.

```ts
export const SAUDI_ARABIC_LATIN_DIGITS = "ar-SA-u-nu-latn"

export function formatSaudiNumber(
  value: number,
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat(SAUDI_ARABIC_LATIN_DIGITS, {
    numberingSystem: "latn",
    ...options,
  }).format(value)
}

export function formatSaudiDate(
  value: Date | number,
  options: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    calendar: "gregory",
    numberingSystem: "latn",
    ...options,
  }).format(value)
}
```

- Centralize number, percent, date, time, range, and compact-number formatters.
- Set `font-variant-numeric: tabular-nums` for tables, counters, prices, and aligned operational data.
- Parse expected Arabic and Latin input forms deliberately at the schema boundary; do not mutate arbitrary strings.
- Label Gregorian or Hijri dates when the context could be ambiguous. Do not silently convert user-entered dates.
- Test zero, negatives, decimals, percentages, ranges, large values, timezone boundaries, and invalid input.

## Saudi Riyal

Use a shared component rather than raw `Intl` currency output because runtime/font support for U+20C1 varies.

```tsx
type RiyalAmountProps = {
  value: number
  locale?: "ar" | "en"
  fractionDigits?: number
}

export function RiyalAmount({
  value,
  locale = "ar",
  fractionDigits = 2,
}: RiyalAmountProps) {
  const amount = formatSaudiNumber(value, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })

  return (
    <span className="inline-flex items-baseline gap-1 tabular-nums" dir="ltr">
      <bdi>{amount}</bdi>
      <span
        className="font-riyal"
        aria-label={locale === "ar" ? "ريال سعودي" : "Saudi riyals"}
      >
        {"\u20C1"}
      </span>
    </span>
  )
}
```

Requirements:

- Use a licensed, locally hosted font known to contain U+20C1.
- Provide the official SAMA SVG as the visual fallback when permitted and available; do not redraw or stylize the mark.
- If font and SVG support are unavailable, render `ر.س.` for Arabic and `SAR` for English.
- Preserve amount/sign order and a non-breaking gap. Test copy/paste, font failure, zoom, screen readers, negatives, zero, and fractions.

## Known LTR values

Render these inside an isolating primitive with `dir="ltr"`: phone numbers, email addresses, URLs, order/reference IDs, hashes, versions, OTPs, card suffixes, and machine-formatted dates. Keep their accessible label natural in the surrounding language.
