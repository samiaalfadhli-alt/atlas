# RTL, Content, and Saudi Forms

## Layout and icons

- Prefer semantic grid/flex flow and logical spacing over `rtl:flex-row-reverse` patches.
- Keep focus order, reading order, and visual order aligned.
- Mirror back/forward arrows, chevrons, send-flow arrows, drawers, and breadcrumbs when their meaning changes with direction.
- Do not mirror logos, play/pause, clocks, checkmarks, maps, charts with fixed axes, or culturally fixed marks.
- Verify drawers, menus, tooltips, carousels, pagination, tables, charts, date pickers, and breadcrumbs in both directions.

## Arabic typography and copy

- Use explicit Arabic display/body roles and Latin/code roles. A code font is not an Arabic body font.
- Avoid letter spacing in Arabic body copy. Use comfortable line-height and readable measure.
- Write direct Saudi-natural Modern Standard Arabic. Prefer familiar verbs and concrete domain nouns.
- Keep technical tokens isolated rather than transliterating them into confusing Arabic text.
- Localize accessible names, placeholders, validation text, document metadata, and toast copy.
- Western digits remain `0-9` inside Arabic copy unless the user explicitly requests another numbering system.

## Saudi fields

- Phone display: preserve `+966` and digits LTR; store E.164. Do not invent validation beyond the selected provider/domain rules.
- Addresses: model city, district, street, building/additional number, postal code, and short address only when the product needs them. Keep each field typed and independently localizable.
- Identity and payment fields are sensitive. Minimize collection, mask display, keep values out of logs/client analytics, and validate on the server.
- OTP, phone, currency, search, and identity inputs need caret/selection testing in RTL. The input value may be LTR even when its label and surrounding form are RTL.
- Use autocomplete/inputmode attributes that match the field. Do not force numeric input types when leading zeroes or `+` matter.

## Honest operations

Use one of three explicit modes for forms and actions:

- `live`: show success only after durable/provider acknowledgement and an idempotency key.
- `demo`: label it clearly and never claim booked, paid, submitted, or received.
- `external-handoff`: report that the user was sent to the real destination; do not claim internal completion.

Keep business claims source-backed. Treat unsupported pricing, finance rates, authorization, history, inventory, and delivery promises as unverified or fictional demo content.
