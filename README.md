# Etlaq Next.js Sandbox Template

Fresh Arabic-first Next.js 16 template with shadcn/ui, MongoDB, bilingual runtime support, Turbopack, and project agent skills in `.agents/skills`.

Code generation is owned externally by `etlaq-agent`; this template does not bake an AI agent runtime into the generated app.

## Runtime

- Node.js 24 is the supported runtime. The sandbox image must provide a real
  `node` executable as well as Bun because package lifecycle scripts and the
  Next.js CLI can invoke Node directly.
- Turbopack uses `/workspace` as its filesystem root inside Etlaq sandboxes so
  the app can resolve the baked dependency tree without copying it. Local
  checkouts remain rooted at the application directory.
- Both `*.preview.etlaq.sa` and `*.sandbox.etlaq.sa` are accepted development
  origins. The latter is used by Firecracker previews.

## Commands

```bash
bun install
bun dev
bun run build
bun run lint
bun run lint:i18n
bun run typecheck
```

## Adding shadcn components

```bash
bunx --bun shadcn@latest add button
```

Components are copied into `components/ui`.

Use shadcn as the base component layer. Extend it with local wrappers, variants, tokens, and app components.

## UI Expectations

- Arabic-first and RTL-safe by default.
- Always build mobile-responsive UI from 320px first before desktop polish.
- Use semantic Tailwind/shadcn tokens instead of raw colors in app UI.
- Keep Etlaq preview origins in `next.config.ts` for proxied development access.
- Keep the Etlaq Studio edit bridge mounted at `/__etlaq/edit-mode.js`.

## Environment

Configure these values through the sandbox environment when the app uses MongoDB:

- `MONGODB_URI`
- `MONGODB_DB`

## Prompt Layer

- `AGENTS.md` defines the agent workflow.
- `DESIGN.md` is the project design contract.
- Hallmark is the required design pass for pages/components.
- `make-interfaces-feel-better` is the required final polish pass.
- All skills live in `.agents/skills`.

The skills are agent inputs, not application runtime dependencies. They remain
inside the project tree for now because `etlaq-agent`, `AGENTS.md`,
`skills-lock.json`, and the template integrity verifier share that path as a
security contract. Moving them outside the app requires an atomic agent and
materializer contract change; deleting or symlinking the directory in only the
runtime image would break skill discovery and integrity verification.
