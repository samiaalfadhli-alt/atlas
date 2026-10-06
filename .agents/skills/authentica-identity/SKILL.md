---
name: authentica-identity
description: >-
  Integrate Authentica.sa identity APIs for Saudi applications: OTP by
  SMS/WhatsApp/email, OTP verification, balance checks, face verification,
  voice verification, backend wrappers, and environment setup. Use when
  Authentica keys, X-Authorization headers, AUTHENTICA_API_KEY, Next.js .env
  files, or API keys that start with $ need handling.
---

# Authentica Identity Verification

## Overview

Authentica provides customer authentication APIs for OTP over SMS, WhatsApp, and email, plus biometric face and voice verification. The official docs are at `https://docs.authentica.sa/` and expose an OpenAPI spec at `https://docs.authentica.sa/openapi.yaml`.

Official source URLs researched:

- Docs: `https://docs.authentica.sa/`
- LLM index: `https://docs.authentica.sa/llms.txt`
- Full docs text: `https://docs.authentica.sa/llms-full.txt`
- OpenAPI: `https://docs.authentica.sa/openapi.yaml`
- Portal/API keys: `https://portal.authentica.sa/applications/`
- Support WhatsApp: `https://wa.me/966536553944`

## When to Use

Use this skill when the user asks to:

- Add Saudi OTP login/signup verification.
- Send OTP by SMS, WhatsApp, or email.
- Verify an OTP code entered by a user.
- Check Authentica account credit balance.
- Add face or voice biometric verification.
- Create `.env` keys and backend wrappers for Authentica.

Do not use this skill for payment processing; use `tap-payments` or `moyasar-payments` instead.

## API Basics

Base URL:

```text
https://api.authentica.sa/api/v2
```

Authentication:

```http
X-Authorization: <AUTHENTICA_API_KEY>
Content-Type: application/json
```

Recommended environment variables:

```bash
AUTHENTICA_API_BASE_URL=https://api.authentica.sa/api/v2
AUTHENTICA_API_KEY=
AUTHENTICA_DEFAULT_OTP_METHOD=sms
AUTHENTICA_DEFAULT_TEMPLATE_ID=1
```

Never expose `AUTHENTICA_API_KEY` in client-side code. All API calls should go through a backend route/server action.

Authentica API keys can start with `$` (for example bcrypt-shaped values such as `$2y$...`). In Next.js `.env*` files, literal dollar signs are expanded unless escaped. When writing the key into `.env.local`, preserve the exact value by escaping each dollar sign:

```bash
AUTHENTICA_API_KEY="\$2y\$10\$example"
```

Do not tell users to remove the leading `$`, wrap the value in unescaped quotes, or base64-encode it unless the application code explicitly supports a separate decoded variable.

## Endpoints

| Purpose | Method + path | Notes |
| --- | --- | --- |
| Balance | `GET /balance` | Returns current account balance in credits. |
| Send OTP | `POST /send-otp` | Sends OTP by `sms`, `whatsapp`, or `email`. |
| Verify OTP | `POST /verify-otp` | Validates the customer-entered OTP. |
| Face verification | `POST /verify-by-face` | Compares `registered_face_image` and `query_face_image` base64 images. |
| Voice verification | `POST /verify-by-voice` | Compares `registered_audio` and `query_audio` base64 audio. |

## OTP Flow

1. Validate and normalize user phone/email.
2. Backend calls `POST /send-otp`.
3. Store a short-lived local challenge record if your app needs rate limits, resend cooldowns, or UX state.
4. User enters OTP.
5. Backend calls `POST /verify-otp`.
6. Only mark the phone/email verified after Authentica returns a successful verification.

Send SMS/WhatsApp OTP:

```bash
curl --fail --show-error --request POST "$AUTHENTICA_API_BASE_URL/send-otp" \
  --header "X-Authorization: $AUTHENTICA_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "method": "sms",
    "phone": "+9665XXXXXXX",
    "template_id": 31
  }'
```

Send email OTP:

```json
{
  "method": "email",
  "email": "user@example.com",
  "template_id": 1
}
```

Current docs also show optional custom OTP and fallback fields in the workflow guide:

```json
{
  "method": "sms",
  "phone": "+9665XXXXXXXXX",
  "template_id": 31,
  "fallback_email": "email@test.test",
  "otp": "123456"
}
```

Use custom OTPs and fallback channels only when the app needs them and the Authentica dashboard/application settings support the selected template and channel. Authentica notes that templates with IDs `1` and `2` are used for fallback OTPs based on the language of the main template in the request.

Verify OTP:

```bash
curl --fail --show-error --request POST "$AUTHENTICA_API_BASE_URL/verify-otp" \
  --header "X-Authorization: $AUTHENTICA_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "phone": "+9665XXXXXXX",
    "otp": "123456"
  }'
```

Phone numbers should be international E.164 format; Authentica examples use `+966...` for Saudi numbers.

## TypeScript Backend Wrapper

```ts
const AUTHENTICA_API_BASE_URL =
  process.env.AUTHENTICA_API_BASE_URL ?? "https://api.authentica.sa/api/v2";

function authenticaHeaders() {
  const key = process.env.AUTHENTICA_API_KEY;
  if (!key) throw new Error("Missing AUTHENTICA_API_KEY");
  return {
    "Content-Type": "application/json",
    "X-Authorization": key,
  };
}

export async function sendAuthenticaOtp(input: {
  method: "sms" | "whatsapp" | "email";
  phone?: string;
  email?: string;
  template_id?: number;
  fallback_email?: string;
  otp?: string;
}) {
  const res = await fetch(`${AUTHENTICA_API_BASE_URL}/send-otp`, {
    method: "POST",
    headers: authenticaHeaders(),
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Authentica send-otp failed: ${res.status}`);
  return body;
}

export async function verifyAuthenticaOtp(input: {
  phone?: string;
  email?: string;
  otp: string;
}) {
  const res = await fetch(`${AUTHENTICA_API_BASE_URL}/verify-otp`, {
    method: "POST",
    headers: authenticaHeaders(),
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Authentica verify-otp failed: ${res.status}`);
  return body;
}
```

## Face and Voice Verification

Face request body:

```json
{
  "user_id": "user123",
  "registered_face_image": "<base64 image>",
  "query_face_image": "<base64 image>"
}
```

Voice request body:

```json
{
  "user_id": "user123",
  "registered_audio": "<base64 audio>",
  "query_audio": "<base64 audio>"
}
```

Keep biometric media backend-only where possible. Avoid logging base64 media, and document user consent and retention policies before production use.

## Common Pitfalls

1. Putting `AUTHENTICA_API_KEY` in browser code. Keep it server-side.
2. Sending local Saudi numbers like `05...` without normalization. Prefer `+9665...`.
3. Assuming SMS only. The official `method` enum is `sms`, `whatsapp`, or `email`.
4. Hardcoding a template ID, custom OTP, or fallback channel without checking Authentica dashboard application settings.
5. Treating a send-OTP success as identity verification. Verification requires `/verify-otp`.
6. Logging OTPs, API keys, or biometric base64 payloads.
7. Running face/voice verification without explicit consent and retention language.

## Verification Checklist

- [ ] `.env` contains `AUTHENTICA_API_KEY` only on the server.
- [ ] API base URL is `https://api.authentica.sa/api/v2` unless overridden intentionally.
- [ ] Phone numbers are E.164 normalized.
- [ ] OTP send and verify are separate backend calls.
- [ ] Invalid OTP and rate-limit states have clear UX.
- [ ] No API key, OTP code, or biometric payload is logged.
- [ ] Authentica dashboard templates, fallback settings, default channel, and custom OTP policy match the code.
