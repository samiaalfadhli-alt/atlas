---
name: tap-payments
description: Use when integrating Tap Payments (tap.company) checkout, charges, tokens, customers, refunds, authorize/capture, webhooks/post callbacks, Apple Pay, mada, or Saudi SAR payment flows. Covers official docs, API auth, env vars, backend verification, and implementation guardrails.
version: "1.0.0"
---

# Tap Payments

## Overview

Tap Payments provides payment APIs for cards, local GCC payment methods, hosted/redirect flows, tokenization, refunds, customers, and authorization/capture. Official documentation is hosted under `developers.tap.company`.

Official source URLs to use:

- Docs home: `https://developers.tap.company/`
- API reference: `https://developers.tap.company/reference`
- API base: `https://api.tap.company/v2`
- Dashboard: `https://dashboard.tap.company/`
- Main site: `https://tap.company/`
- GitHub SDKs: `https://github.com/Tap-Payments`

Important reference pages:

- Create charge: `https://developers.tap.company/reference/create-a-charge`
- Retrieve charge: `https://developers.tap.company/reference/retrieve-a-charge`
- Create token: `https://developers.tap.company/reference/create-a-token`
- Create customer: `https://developers.tap.company/reference/create-a-customer`
- Create refund: `https://developers.tap.company/reference/create-a-refund`
- Create authorize: `https://developers.tap.company/reference/create-an-authorize`
- Capture authorize: `https://developers.tap.company/reference/capture-an-authorize`
- Test cards: `https://developers.tap.company/reference/testing-cards`

## When to Use

Use this skill when the user asks to:

- Add Tap checkout to a Saudi/GCC app.
- Create a Tap charge and redirect the customer through 3DS/hosted payment.
- Tokenize card details using Tap client-side tools and charge from the backend.
- Add refund, authorize/capture, or void flows.
- Add Tap post callback/webhook handling.
- Configure mada, Apple Pay, SAR, or KSA-specific payment behavior.

Do not use this skill for Moyasar; use `moyasar-payments` instead.

## API Basics

Base URL:

```text
https://api.tap.company/v2
```

Authentication:

```http
Authorization: Bearer $TAP_SECRET_KEY
Content-Type: application/json
```

Typical key types:

- `sk_test_*`: test secret key, backend only.
- `pk_test_*`: test public key, browser/mobile tokenization only.
- `sk_live_*`: live secret key, backend only.
- `pk_live_*`: live public key, browser/mobile only.

Recommended environment variables:

```bash
TAP_API_BASE_URL=https://api.tap.company/v2
TAP_SECRET_KEY=sk_test_...
TAP_PUBLIC_KEY=pk_test_...
TAP_DEFAULT_CURRENCY=SAR
TAP_DEFAULT_COUNTRY=SA
TAP_REDIRECT_URL=
TAP_POST_URL=
TAP_WEBHOOK_SECRET=
```

Never expose `TAP_SECRET_KEY` client-side.

## Standard Charge Flow

1. Client collects card/payment details with Tap-hosted UI, Tap SDK, or tokenization using the public key.
2. Backend creates a charge with `POST /charges/`.
3. If Tap returns a `transaction.url`, redirect the customer there for 3DS/hosted checkout.
4. Tap redirects browser to `redirect.url` after customer interaction.
5. Tap calls `post.url` server-side when configured.
6. Backend fetches the canonical charge using `GET /charges/{charge_id}`.
7. Fulfill the order only if the charge status and amount/currency match your order.

Do not treat `redirect.url` as proof of payment. It is a browser return signal only.

## Endpoints

| Purpose | Method + path |
| --- | --- |
| Create charge | `POST /charges/` |
| Retrieve charge | `GET /charges/{charge_id}` |
| Create token | `POST /tokens` |
| Retrieve token | `GET /tokens/{token_id}` |
| Create customer | `POST /customers` |
| Retrieve customer | `GET /customers/{customer_id}` |
| Create refund | `POST /refunds` |
| Retrieve refund | `GET /refunds/{refund_id}` |
| Authorize | `POST /authorize` |
| Capture authorize | `POST /authorize/{authorize_id}/capture` |
| Void authorize | `POST /authorize/{authorize_id}/void` |

## Create Charge Shape

Tap charge requests commonly include:

```json
{
  "amount": 100.0,
  "currency": "SAR",
  "customer_initiated": true,
  "threeDSecure": true,
  "save_card": false,
  "description": "Order #123",
  "statement_descriptor": "STORE",
  "metadata": {
    "order_id": "ord_123"
  },
  "reference": {
    "transaction": "txn_123",
    "order": "ord_123",
    "idempotent": "ord_123_attempt_1"
  },
  "customer": {
    "first_name": "Abdullah",
    "email": "customer@example.com",
    "phone": {
      "country_code": "966",
      "number": "5XXXXXXX"
    }
  },
  "source": {
    "id": "tok_xxx"
  },
  "redirect": {
    "url": "https://example.com/payments/tap/return"
  },
  "post": {
    "url": "https://example.com/api/webhooks/tap"
  }
}
```

Amount is a decimal in the currency unit, not a minor-unit integer. Source IDs vary by integration path. Examples include token IDs such as `tok_xxx`, saved source/card IDs, `src_all` for all methods on Tap-hosted payment, `src_card` for card-only Tap-hosted payment, and local payment method source IDs from the current Payment Methods guide. Verify current docs before hardcoding payment methods.

For duplicate protection, Tap documents `reference.idempotent`: reuse the same value for retries of the same order/request within 24 hours so Tap returns the original response instead of creating another charge/authorize/refund.

## TypeScript Backend Wrapper

```ts
const TAP_API_BASE_URL = process.env.TAP_API_BASE_URL ?? "https://api.tap.company/v2";

function tapHeaders() {
  const key = process.env.TAP_SECRET_KEY;
  if (!key) throw new Error("Missing TAP_SECRET_KEY");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function createTapCharge(input: unknown) {
  const res = await fetch(`${TAP_API_BASE_URL}/charges/`, {
    method: "POST",
    headers: tapHeaders(),
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Tap create charge failed: ${res.status}`);
  return body;
}

export async function retrieveTapCharge(id: string) {
  const res = await fetch(`${TAP_API_BASE_URL}/charges/${encodeURIComponent(id)}`, {
    headers: tapHeaders(),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Tap retrieve charge failed: ${res.status}`);
  return body;
}
```

## Status Handling

Handle asynchronous and failure states. Common Tap charge/payment states include:

- `INITIATED`
- `IN_PROGRESS`
- `ABANDONED`
- `CANCELLED`
- `FAILED`
- `DECLINED`
- `CAPTURED`
- `AUTHORIZED`
- `VOID`
- `REFUNDED`
- `PARTIALLY_REFUNDED`

Only fulfill after canonical server retrieval confirms a successful captured/paid state for the expected amount and currency.

## Authorize/Capture

Use authorize/capture when payment must be reserved first and captured later after inventory/manual approval.

- Create authorization: `POST /authorize`
- Capture: `POST /authorize/{authorize_id}/capture`
- Void: `POST /authorize/{authorize_id}/void`

Store both your internal order ID and Tap authorization/charge IDs.

## Webhooks and Post URL

Tap supports server-side notification via the `post.url` field on charge creation and webhook-style events in dashboard/docs.

Handler rules:

1. Accept POST callbacks on an HTTPS endpoint.
2. Parse the Tap charge/payment ID.
3. Retrieve the canonical charge from Tap API.
4. Verify status, amount, currency, and internal order reference.
5. Fulfill idempotently; callbacks can repeat.
6. Return 2xx quickly.
7. Validate Tap's documented `hashstring` header when present; calculate it from the posted charge/authorize/invoice fields as described in Tap's webhook docs, then compare it before fulfillment.

For local development, use ngrok/cloudflared and configure `post.url` to the public tunnel.

## Saudi/KSA Notes

- Default country: `SA`.
- Default currency: `SAR`.
- Local domestic card network: `mada`.
- 3DS is commonly required for card payments.
- Saudi phone numbers should be normalized; for Tap customer objects, use `country_code: "966"` and the local number without `+966`.
- Apple Pay in Saudi requires Apple merchant setup, web domain verification, correct `countryCode: SA`, `currencyCode: SAR`, and Tap account/dashboard configuration.
- Confirm the merchant account has Saudi/mada/Apple Pay enabled before exposing those methods in UI.

## Test/Sandbox Notes

Use test keys from Tap dashboard. Tap uses the same API base URL with test/live behavior controlled by key type.

- Test card docs: `https://developers.tap.company/reference/testing-cards`
- Do not use real cards in test mode.
- Verify Tap-specific cards for mada, KNET, Benefit, 3DS success/failure, and declines from official docs before coding assumptions.
- Current test card reference examples include Mada `4464040000000007` and `5588480000000003`, Visa `4508750015741019`, Mastercard `5123450000000008`, and STC Pay test phone numbers under country code `966`.

Common generic sandbox cards such as `4111111111111111` or `5555555555554444` may not cover Tap-specific outcomes. Prefer Tap's official test-card matrix.

## Common Pitfalls

1. Exposing `TAP_SECRET_KEY` to the browser.
2. Trusting `redirect.url` instead of server-side `GET /charges/{id}`.
3. Not handling 3DS/in-progress states.
4. Not making `post.url`/webhook processing idempotent.
5. Hardcoding non-SAR currencies for Saudi merchants.
6. Assuming mada or Apple Pay is enabled for the merchant without dashboard/account activation.
7. Confusing public key tokenization with backend charge creation.
8. Ignoring amount/currency/order-reference verification before fulfillment.
9. Treating Tap `amount` like Moyasar halalas. Tap charge amounts are decimal currency units.

## Verification Checklist

- [ ] `TAP_SECRET_KEY` is server-only.
- [ ] `TAP_PUBLIC_KEY` is the only key used client-side.
- [ ] Backend creates charges and stores Tap IDs with internal order IDs.
- [ ] Charge retries reuse `reference.idempotent` for the same order attempt.
- [ ] Browser redirect and post callback both trigger server-side charge retrieval.
- [ ] Fulfillment validates `hashstring` when present, is idempotent, and is based on canonical charge status.
- [ ] KSA/SAR/mada/Apple Pay settings are confirmed in the Tap dashboard.
- [ ] Test-card flows cover success, 3DS, failure, and cancellation.
- [ ] Live launch switches to live keys and production HTTPS URLs.
