const MAX_MESSAGE_LENGTH = 8_000
const MAX_STACK_LENGTH = 12_000
const DEDUPE_WINDOW_MS = 5_000
const recentErrors = new Map<string, number>()

type BrowserErrorKind =
  | "console_error"
  | "runtime_error"
  | "unhandled_rejection"

function serializeValue(value: unknown): string {
  if (value instanceof Error) {
    return [value.name, value.message, value.stack].filter(Boolean).join(": ")
  }

  if (typeof value === "string") {
    return value
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function reportBrowserError(
  kind: BrowserErrorKind,
  message: string,
  stack?: string,
) {
  const normalizedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!normalizedMessage || window.parent === window) {
    return
  }

  const fingerprint = `${kind}:${normalizedMessage}`
  const now = Date.now()
  const previous = recentErrors.get(fingerprint)
  if (previous && now - previous < DEDUPE_WINDOW_MS) {
    return
  }
  recentErrors.set(fingerprint, now)

  window.parent.postMessage(
    {
      type: "etlaq.preview.browser_error",
      version: 1,
      entry: {
        timestamp: new Date(now).toISOString(),
        level: "error",
        source: `browser:${kind}`,
        message: normalizedMessage,
        data: {
          kind,
          route: window.location.pathname,
          stack: stack?.slice(0, MAX_STACK_LENGTH),
        },
      },
    },
    "*",
  )
}

window.addEventListener("error", (event) => {
  reportBrowserError(
    "runtime_error",
    event.message || "Unhandled browser error",
    event.error instanceof Error ? event.error.stack : undefined,
  )
})

window.addEventListener("unhandledrejection", (event) => {
  const reason = serializeValue(event.reason)
  reportBrowserError(
    "unhandled_rejection",
    reason || "Unhandled promise rejection",
    event.reason instanceof Error ? event.reason.stack : undefined,
  )
})

const originalConsoleError = console.error.bind(console)
console.error = (...args: unknown[]) => {
  originalConsoleError(...args)
  const message = args.map(serializeValue).filter(Boolean).join(" ")
  reportBrowserError(
    "console_error",
    message || "Browser console error",
    args.find((value): value is Error => value instanceof Error)?.stack,
  )
}
