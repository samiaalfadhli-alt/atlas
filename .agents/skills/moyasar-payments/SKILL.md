---
name: moyasar-payments
description: Use when integrating Moyasar.com payments, invoices, refunds, webhooks, hosted/form checkout, Apple Pay, STC Pay, or Saudi SAR/mada payment flows. Covers official docs, API auth, env vars, backend verification, webhook handling, and test cards.
version: "1.0.0"
---

# Moyasar Payments

## Overview

Moyasar is a Saudi payment provider with REST APIs, hosted/payment-form checkout, invoices, refunds, webhooks, and mobile SDKs. Official docs are available as Docusaurus pages and LLM text files.

Official source URLs researched:

- Docs home: `https://docs.moyasar.com/`
- Full docs text: `https://docs.moyasar.com/llms-full.txt`
- API intro: `https://docs.moyasar.com/api/api-introduction`
- Authentication: `https://docs.moyasar.com/api/authentication`
- API keys: `https://docs.moyasar.com/getting-started/create-account-and-api-keys`
- Test/live modes: `https://docs.moyasar.com/getting-started/test-vs-live-environments`
- Form config: `https://docs.moyasar.com/guides/references/form-configuration`
- Card basic integration: `https://docs.moyasar.com/guides/card-payments/basic-integration`
- Test cards: `https://docs.moyasar.com/guides/card-payments/test-cards`
- Payment operations: `https://docs.moyasar.com/guides/payment-operations`
- Webhooks: `https://docs.moyasar.com/api/other/webhooks/webhook-reference`
- GitHub: `https://github.com/moyasar`

## When to Use

Use this skill when the user asks to:

- Add Saudi payment checkout using Moyasar.
- Create payments, invoices, refunds, captures, or voids.
- Add Moyasar Form to a web checkout.
- Handle Moyasar callbacks/webhooks.
- Add mada, Visa, Mastercard, STC Pay, Apple Pay, or Samsung Pay flows.
- Verify payments server-side before fulfilling orders.

Do not use this skill for Tap Payments; use `tap-payments` instead.

## API Basics

Base URL:

```text
https://api.moyasar.com/v1
```

Authentication is HTTP Basic Auth:

- Username: API key.
- Password: empty string.
- Publishable keys: `pk_test_*` / `pk_live_*`; browser/mobile only, restricted mainly to payment creation.
- Secret keys: `sk_test_*` / `sk_live_*`; backend only, full account operations.
- Test/live mode is determined by key prefix.

Recommended environment variables:

```bash
MOYASAR_BASE_URL=https://api.moyasar.com/v1
MOYASAR_PUBLISHABLE_KEY=pk_test_...
MOYASAR_SECRET_KEY=sk_test_...
MOYASAR_WEBHOOK_SECRET=
MOYASAR_DEFAULT_CURRENCY=SAR
MOYASAR_CALLBACK_URL=
```

Never expose `MOYASAR_SECRET_KEY` to the browser. Use only `MOYASAR_PUBLISHABLE_KEY` in frontend form/mobile SDK code.

## Payment Form Checkout

Moyasar Form is the fastest web checkout path. The docs show configuration fields like:

```js
Moyasar.init({
  element: ".mysr-form",
  amount: 1000, // 10.00 SAR in halalas
  currency: "SAR",
  description: "Order #123",
  publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
  callback_url: "https://example.com/payments/moyasar/callback",
  supported_networks: ["visa", "mastercard", "mada", "unionpay"],
  methods: ["creditcard"],
});
```

Package/CDN options verified during research:

- npm: `moyasar-payment-form`
- Official docs currently show the npm package `moyasar-payment-form` for modern Form integrations.
- Older CDN paths such as `https://cdn.moyasar.com/mpf/1.15.0/moyasar.js` may still respond, but prefer the current docs and package examples over hardcoded historical CDN versions.

Prefer the current official docs/page when choosing exact script tags and versions.

## Server-Side Payment Verification

A browser callback is not proof of payment. Always fetch the payment by ID server-side and verify status, amount, currency, and internal order metadata.

```ts
const MOYASAR_BASE_URL = process.env.MOYASAR_BASE_URL ?? "https://api.moyasar.com/v1";

function moyasarAuthHeader() {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) throw new Error("Missing MOYASAR_SECRET_KEY");
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export async function fetchMoyasarPayment(id: string) {
  const res = await fetch(`${MOYASAR_BASE_URL}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: moyasarAuthHeader() },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Moyasar fetch payment failed: ${res.status}`);
  return body;
}
```

Fulfill only when the canonical API response shows a paid state matching your order.

## Endpoints

Payments:

| Purpose | Method + path |
| --- | --- |
| Create payment | `POST /payments` |
| Fetch payment | `GET /payments/{id}` |
| List payments | `GET /payments` |
| Update payment | `PUT /payments/{id}` |
| Refund payment | `POST /payments/{id}/refund` |
| Capture authorized payment | `POST /payments/{id}/capture` |
| Void authorized payment | `POST /payments/{id}/void` |

Invoices:

| Purpose | Method + path |
| --- | --- |
| Create invoice | `POST /invoices` |
| Bulk create invoices | `POST /invoices/bulk` |
| List invoices | `GET /invoices` |
| Fetch invoice | `GET /invoices/{id}` |
| Update invoice | `PUT /invoices/{id}` |
| Cancel invoice | `PUT /invoices/{id}/cancel` |

Webhooks:

| Purpose | Method + path |
| --- | --- |
| Available events | `GET /webhooks/available_events` |
| Create webhook | `POST /webhooks` |
| List webhooks | `GET /webhooks` |
| Fetch webhook | `GET /webhooks/{id}` |
| Delete webhook | `DELETE /webhooks/{id}` |

## Create Payment Notes

Important fields:

- `given_id`: optional UUID v4 for idempotency. Reuse the same `given_id` on retry for the same attempted payment only.
- `amount`: integer in the smallest currency unit. For SAR: `10 SAR = 1000` halalas.
- `currency`: ISO-4217; Saudi integrations usually use `SAR`.
- `callback_url`: required for credit card/token flows.
- `source`: type-specific object for `creditcard`, `token`, `applepay`, `samsungpay`, or `stcpay`.
- `metadata`: key-value object returned in responses/webhooks; include internal order/customer IDs.

Payment statuses can include `initiated`, `paid`, `failed`, `authorized`, `captured`, `voided`, `refunded`, and related operation states. If a payment is `initiated`, route the customer through the returned challenge/transaction URL if present.

## Webhooks

Create webhook body shape from docs:

```json
{
  "http_method": "post",
  "url": "https://example.com/api/webhooks/moyasar",
  "shared_secret": "change-me",
  "events": ["payment_paid", "payment_faild"]
}
```

Available events documented include:

- `payment_paid`
- `payment_faild`
- `payment_voided`
- `payment_authorized`
- `payment_captured`
- `payment_refunded`
- `payment_abandoned`
- `payment_verified`

Webhook payloads include fields such as `id`, `type`, `created_at`, `secret_token`, `account_name`, `live`, and `data`.

Handler rules:

1. Return 2xx quickly; Moyasar retries failed webhooks immediately, then after 1 min, 10 min, 30 min, 1 hr, and 2 hr before dropping.
2. Verify `secret_token`/shared secret if configured. Do not assume Stripe-style HMAC headers unless current docs show them.
3. Fetch the payment/invoice server-side before fulfillment.
4. Make the handler idempotent.

Note: Moyasar's current webhook dashboard/reference event is spelled `payment_faild`. Do not silently "correct" it to `payment_failed` unless the live available-events endpoint for the merchant account shows the corrected spelling.

## Test Cards and Saudi Notes

Official test cards page: `https://docs.moyasar.com/guides/card-payments/test-cards`.

Known paid test cards from docs:

- Mada: `4201320111111010`
- Visa: `4111114005765430`, `4111111111111111`
- Mastercard: `5421080101000000`
- Amex: `340000000900000`
- UnionPay: `6200000000000005`

Card fields:

- Name: at least two words.
- Expiry: future month/year.
- CVC: any 3 digits; 4 for Amex.

STC Pay sandbox OTPs:

- `123456` or `000000`: success
- `111111`: insufficient funds
- `222222`: daily limit exceeded
- `333333`: transaction limit exceeded
- `444444`: timeout

Saudi-specific defaults:

- Currency: `SAR`.
- Amounts are halalas.
- Card networks include `mada`, `visa`, `mastercard`, `amex`, `unionpay`.
- STC Pay mobile accepts Saudi formats such as `05xxxxxxxx`, `+9665xxxxxxxx`, or `009665xxxxxxxx`.
- Mada authorized payments must be captured within 14 days according to docs.
- Apple Pay testing requires a physical device; simulator is not supported.

## SDKs

Official SDK list: `https://docs.moyasar.com/getting-started/sdk-and-libraries`.

Researched packages/repos:

- Node: `moyasar` npm package, repo `https://github.com/moyasar/moyasar-node`
- Python: `moyasar` PyPI package, repo `https://github.com/moyasar/moyasar-python`
- Ruby: `moyasar` gem, repo `https://github.com/moyasar/moyasar-ruby`
- PHP/Laravel: `moyasar/moyasar`, repo `https://github.com/moyasar/moyasar-php`
- .NET: `https://github.com/moyasar/moyasar-dotnet`
- Android: `com.github.Moyasar:moyasar-android-sdk:1.0.14`
- iOS: `MoyasarSdk` / SPM repo `https://github.com/moyasar/moyasar-ios-sdk`
- Flutter: `moyasar: ^3.0.0`
- React Native: `react-native-moyasar-sdk`

## Common Pitfalls

1. Sending raw card data through your backend. Moyasar docs warn this is prohibited; use the payment form or SDKs.
2. Using `sk_*` in browser code. Only `pk_*` belongs client-side.
3. Forgetting Basic Auth requires an empty password: `-u sk_test_xxx:`.
4. Treating the callback URL as payment proof. Always fetch payment by ID server-side.
5. Off-by-100 amount bugs. SAR values are in halalas.
6. Retrying create payment without `given_id`, causing duplicate charges.
7. Ignoring `initiated`/3DS challenge states.
8. Assuming webhooks use Stripe-style signature headers. Use Moyasar `shared_secret`/`secret_token` unless docs change.
9. Using random cards in test mode. Moyasar test mode accepts documented test cards.

## Verification Checklist

- [ ] Secret key is backend-only.
- [ ] Publishable key is used for Form/mobile checkout.
- [ ] Amounts are integer minor units.
- [ ] `callback_url` is HTTPS in live mode.
- [ ] Payment callback fetches canonical payment before fulfillment.
- [ ] Webhook handler is idempotent and returns 2xx quickly.
- [ ] Test cards and sandbox keys are used before live keys.
- [ ] Live launch uses `pk_live_*`/`sk_live_*`, production HTTPS, and webhook monitoring.
