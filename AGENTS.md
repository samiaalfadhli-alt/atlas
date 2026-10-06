<!-- BEGIN:nextjs-agent-rules -->

# This Is Not The Next.js You Know

This template uses Next.js 16, whose APIs and conventions may differ from older training data. Consult the relevant guide in `node_modules/next/dist/docs/` only when behavior is version-sensitive, uncertain, configuration-related, or not resolved by the existing code and types. Do not read framework documentation for routine, well-understood edits.

<!-- END:nextjs-agent-rules -->

# Etlaq Next.js Sandbox Template

Arabic-first Next.js 16 template for Etlaq coding sandboxes. Use Bun for every package and script command. Build the actual product experience first; avoid landing-page-only output unless the user explicitly asks for one.

## Operating Mode

- Make focused, prompt progress: diagnose efficiently, implement the narrow correct fix, and verify the affected behavior before reporting completion.
- On the initial build, replace the starter page with the requested application and make its main page available at `/`. Secondary routes are optional, but must not be used instead of the root application.
- Do not stop at a plan unless asked. Make reasonable product and engineering assumptions. Do not document routine task assumptions; record only durable project-wide decisions that future work genuinely needs.
- Prefer concrete, working UI and data flows over placeholder scaffolds. If a prompt is underspecified, implement the smallest complete version that satisfies the requested core behavior and is usable end to end; do not omit required functionality merely to reduce scope.

## Runtime

- Local and sandbox runtime use Node 24, enforced by the image and `package.json` engines.

## Commands

```bash
bun dev
bun run typecheck
bun run lint
bun run lint:i18n
bun run build
bun start
bun run format
bunx --bun shadcn@latest add <component>
```

`bun run lint` runs Oxlint, ESLint, and `scripts/i18n-check.ts`.
Run `bun install` only when declared dependencies are genuinely missing or dependency metadata changed.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4
- shadcn/ui with Radix primitives, Lucide icons, and `components.json` set to `"rtl": true`
- Arabic RTL by default through `<html lang="ar" dir="rtl">` and `DirectionProvider`
- Bilingual runtime through `contexts/language-context.tsx`
- MongoDB helper in `lib/mongodb.ts`
- Etlaq Studio edit bridge mounted at `/__etlaq/edit-mode.js`

## Non-Negotiables

1. Read a file before editing it.
2. Use Bun only. Use `bunx --bun shadcn@latest ...` for shadcn.
3. Preserve the Etlaq preview origins in `next.config.ts`.
4. Preserve the Etlaq Studio bridge loader and root-layout mount: `components/etlaq-edit-bridge.tsx` and `app/layout.tsx`. Studio injects the ignored `public/__etlaq/edit-mode.js` runtime when edit mode starts.
5. Never commit `node_modules/`, `.next/`, `.bun/`, `tsconfig.tsbuildinfo`, generated build output, or Studio runtime files under `public/__etlaq/`.
6. Never hardcode or guess secrets. Use `.env.local`; `MONGODB_URI` and optional `MONGODB_DB` are read by `lib/mongodb.ts`. Provider API keys are server-only: never expose one through a `NEXT_PUBLIC_` variable or call a paid/authenticated provider directly from client code; proxy through a route handler that reads the key from server env.
7. If image tooling uses a Replicate token managed by the sandbox, treat it as tool-owned secret state: do not read, print, copy, modify, or commit it.
8. Keep generated UI free of agent/tooling language. Users should see product language, not implementation notes, prompt explanations, or internal scaffold names.

## Product And Data Rules

- Prefer strict, explicit types and use `unknown` with narrowing for untrusted values. Avoid introducing `any`; allow it only as a tightly scoped, locally documented exception imposed by an external or generated boundary. Type component props, data modules, route handlers, and MongoDB documents, but do not refactor unrelated existing types unless the task requires it.
- Make business logic explicit in typed data, routes, statuses, and copy. Avoid generic `Item`, `Card`, or `Service` names when the domain suggests concrete language.
- Identify the concrete roles required by the product, such as customer, operator, provider, staff, or admin. Implement the complete core workflow for each essential role, but do not add roles or role-specific surfaces that the product does not need.
- For claims or decisions involving current markets, pricing, laws, regulations, competitors, or third-party integrations, use current reliable sources. Clearly label anything not verified as an assumption and never present invented details as facts.
- Treat products and operational actions as real unless the user explicitly requests a static mockup or demo. Do not claim a durable action succeeded without durable/provider acknowledgement.
- Infer essential product capabilities from the requested product category, even when the user does not list every technical requirement. A request to build a CRM, customer portal, dashboard, marketplace, booking system, ecommerce application, learning platform, or other operational product is a request for a working system—not merely its visible screens.
- Add durable database persistence whenever the product creates, updates, organizes, searches, or reports on information that must survive refreshes, restarts, or later visits. Do not substitute hardcoded arrays, browser-only state, or fake success for required persistence unless the user explicitly asks for a prototype or static demo.
- Add authentication whenever the product contains private, user-specific, organizational, staff, or administrative information. Add server-side authorization and ownership/tenant checks whenever authenticated users must have different access. Authentication without authorization is not a complete protected product.
- For inherently private operational products such as CRMs, admin systems, employee portals, client portals, and account dashboards, database persistence, authentication, server-side authorization, and data isolation are mandatory baseline capabilities unless the user explicitly requests a non-functional mockup.
- Dashboards require authentication when they expose private, user-specific, organizational, administrative, or operational data; public informational dashboards do not require authentication solely because they are dashboards.
- Enforce tenant and resource ownership in every protected query and mutation. Never trust a client-supplied user, organization, role, price, permission, or ownership identifier without server-side verification.
- Validate untrusted input at the server boundary. Use secure session cookies, hash passwords with an established password-hashing library when password authentication is required, protect sensitive endpoints from abuse, and never expose secrets or sensitive records to the client.
- For password or custom session authentication, create and clear cookies with `lib/session-cookie.ts`. Etlaq previews run inside a cross-site iframe: requests whose URL hostname is `sandbox.etlaq.sa` or ends in `.sandbox.etlaq.sa` require the helper's `Secure`, `SameSite=None`, partitioned cookie. Normal first-party deployments remain `SameSite=Lax`. Do not replace this hostname-based behavior with an environment flag, permissive suffix matching, `Origin`, or `Sec-Fetch-Site` detection. Use the same cookie name and options when setting and clearing a session, and verify login followed by an authenticated route and `/api/auth/me`.
- Preserve data integrity with appropriate schemas, indexes or uniqueness constraints, timestamps, stable identifiers, and idempotency or conflict protection for operations that may be submitted more than once.
- When credentials for a required provider are unavailable, implement the secure integration boundary and a truthful configuration or error state. Never simulate successful authentication, payment, email, upload, or other provider-backed behavior.
- Implement each essential workflow end to end: UI, server boundary, validation, persistence/provider acknowledgement, authorization, and relevant loading, empty, success, and recovery states. A polished interface over fake or non-durable behavior is incomplete.
- Do not add unrelated enterprise scope merely because the product could support it. Billing, advanced roles, analytics, notifications, integrations, and other secondary capabilities remain requirement-driven unless they are indispensable to the requested core workflow.
- Keep customer-facing output free of scaffolding, agent, tool, and infrastructure language.

## Operational QA

- Smoke-test only the important workflows affected by the change. Prioritize the primary user path and any touched auth, payment, provider, admin, or durable data-writing behavior; do not exercise unrelated flows.
- Check loading, empty, error, disabled, success, and permission-denied states only when those states are relevant to the affected workflow and its risk.
- Hide infrastructure details from user-facing errors. Log or preserve technical detail in developer-visible code paths, but present clear recovery copy in the UI.
- If a dev server, route, test, build, webhook, or scheduled check fails, inspect the available evidence and distinguish a code failure from unavailable validation infrastructure. Repair a genuine code issue narrowly and retry the failed check at most once. If the check remains unavailable or fails again, stop retrying and return one structured `failed` or `unavailable` validation result with the remaining risk; do not create fallback scripts or run equivalent ad-hoc checks in a loop.

## Skill Routing

All project skills live in `.agents/skills/`. Do not add duplicate `.claude/skills`, `skills/`, `data/skills`, or other agent-specific skill folders.

- Next.js/performance and component architecture: `next-best-practices`, `next-cache-components`, `vercel-react-best-practices`, and `vercel-composition-patterns`.
- AI/chat: use `chat-sdk` for streaming responses and assistant behavior; build the interface with the existing shadcn components.
- Auth/accounts: choose the simplest robust server-side session approach that satisfies the product requirements. Configure persistent secrets deliberately, and use `authentica-identity` only for explicit Authentica or verification-provider work.
- MongoDB: reuse `lib/mongodb.ts` with `MONGODB_URI` and optional `MONGODB_DB`. Route specialized data modeling, connectivity, query optimization, natural-language querying, search/AI, or stream-processing work to the corresponding `mongodb-*` skill only when relevant.
- UI/design: read `DESIGN.md` and use the smallest relevant combination of design skills. For a new application or major redesign, use `frontend-design`, `hallmark`, `design-palettes`, `extract`, and one final owner (`polish` or `make-interfaces-feel-better`); add `saudi-arabic-interface` for Arabic, Saudi, or bilingual experiences, `adapt` when responsive behavior is substantial, and `image-gen` when bespoke imagery materially strengthens the product. For routine edits, reuse the established design system and use only the directly relevant skill. Use `colorize`, `bolder`, `quieter`, `normalize`, and `critique` only when the request or an observed design problem calls for that specific treatment. Use `ux-copy` for focused interface-copy work and `accessibility-review` or `web-design-guidelines` for an explicit final audit. Use `popular-web-designs` only as optional reference material, and use `shadcn` and the `gsap-*` skills for their named roles. Do not load overlapping or opposing skills without a clear purpose.
- Product specs: use `write-spec` only when the user explicitly requests a PRD, feature specification, requirements document, or product-planning artifact. Do not substitute a spec for requested implementation.
- SEO: use `seo-audit` only for explicit SEO, keyword, content-gap, or competitor-search requests.
- `gsap-*`: animation work; install GSAP on demand and, in React/Next, start with `gsap-react`.
- `ocr-and-documents`, `p5js`: document/OCR workflows and creative coding.
- `moyasar-payments`, `tap-payments`: provider-specific Saudi payment integrations.

## Project Memory And Notes

- Do not create or update documentation for routine implementation, styling, copy, or bug fixes.
- Read existing documentation only when it directly affects the request; never preload an entire documentation directory.
- Document only durable project-wide decisions, explicitly requested documentation, or verified research that future work genuinely needs.
- When a durable documented fact changes, update only its existing authoritative file. Never create duplicate notes or store secrets, private data, raw logs, temporary findings, or generated artifacts in documentation.

## Verification

- Use the platform's risk-based validation tool when available. It is the sole owner of check selection, timeouts, cancellation, caching, escalation, retries, and authoritative validation receipts; do not duplicate its checks with shell commands or skill-specific validation passes.
- Give the platform validator the relevant risk context: affected user behavior, UI and i18n changes, routing or build-time behavior, regression surface, and any auth, payment, webhook, file-handling, admin, secret, or database-write impact. These concerns inform one validation profile rather than triggering independent validation pipelines.
- When platform validation is unavailable, run one bounded fallback pass containing only the minimum checks relevant to the affected behavior. Docs-only edits need only `git diff --check`; production builds are reserved for build configuration, routing, metadata, cache/static behavior, deployment, or release readiness.
- Treat validation receipts as authoritative. Never claim a check passed without a matching successful receipt. If validation fails or is unavailable, report the exact blocker, affected capability, and remaining risk without repeated equivalent checks.

## Debugging

Common fixes:

- Buttons or hydration fail in preview: check for `Blocked cross-origin` and preserve Etlaq preview origins.
- `Module not found`: inspect the import path, alias configuration, file casing, generated-file expectations, and `package.json` first. Run `bun install` only when a declared dependency is genuinely absent; add a new dependency only when the requested implementation requires it.
- Hydration mismatch: check client/server boundaries and `"use client"`.
- Runtime DB error: verify `MONGODB_URI`.
