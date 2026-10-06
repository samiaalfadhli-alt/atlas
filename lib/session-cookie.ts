const ETLAQ_SANDBOX_HOST = "sandbox.etlaq.sa"
const ETLAQ_SANDBOX_SUFFIX = `.${ETLAQ_SANDBOX_HOST}`

type RequestWithUrl = Pick<Request, "url">

export type SessionCookieOptions = {
  httpOnly: true
  path: "/"
  maxAge: number
  secure: boolean
  sameSite: "lax" | "none"
  partitioned?: true
}

function normalizeHostname(hostname: string) {
  return hostname.trim().toLowerCase().replace(/\.$/, "")
}

export function isEtlaqSandboxHostname(hostname: string) {
  const normalized = normalizeHostname(hostname)

  return (
    normalized === ETLAQ_SANDBOX_HOST ||
    normalized.endsWith(ETLAQ_SANDBOX_SUFFIX)
  )
}

export function isEtlaqSandboxRequest(request: RequestWithUrl) {
  return isEtlaqSandboxHostname(new URL(request.url).hostname)
}

export function sessionCookieOptions(
  request: RequestWithUrl,
  maxAge: number,
): SessionCookieOptions {
  const sandboxPreview = isEtlaqSandboxRequest(request)
  const common = {
    httpOnly: true,
    path: "/",
    maxAge,
    secure: sandboxPreview || process.env.NODE_ENV === "production",
  } as const

  if (sandboxPreview) {
    return {
      ...common,
      sameSite: "none",
      partitioned: true,
    }
  }

  return {
    ...common,
    sameSite: "lax",
  }
}
