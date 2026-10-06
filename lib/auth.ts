import "server-only"

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

import type { SessionUser, UserRole } from "@/lib/types"

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function getSecret(): string {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.MONGODB_URI?.trim() ||
    ""

  if (!secret) {
    throw new Error("Missing session secret: set SESSION_SECRET or MONGODB_URI")
  }

  return secret
}

const SCRYPT_KEY_LEN = 64
const SCRYPT_SALT_LEN = 16

export function hashPassword(password: string): string {
  const salt = randomBytes(SCRYPT_SALT_LEN)
  const derived = scryptSync(password, salt, SCRYPT_KEY_LEN, {
    N: 16384,
    r: 8,
    p: 1,
  })
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$")
  if (parts.length !== 3 || parts[0] !== "scrypt") return false

  const salt = Buffer.from(parts[1], "hex")
  const expected = Buffer.from(parts[2], "hex")
  const derived = scryptSync(password, salt, expected.length, {
    N: 16384,
    r: 8,
    p: 1,
  })

  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex")
}

export function createSessionToken(user: {
  id: string
  email: string
  name: string
  role: UserRole
  companyId?: string
}): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    exp: expiresAt,
  })
  const encoded = Buffer.from(payload, "utf8").toString("base64url")
  return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string): SessionUser | null {
  if (!token) return null
  const [encoded, signature] = token.split(".")
  if (!encoded || !signature) return null

  const expected = sign(encoded)
  if (signature.length !== expected.length) return null
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null

  let payload: {
    id: string
    email: string
    name: string
    role: UserRole
    companyId?: string
    exp: number
  }

  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"))
  } catch {
    return null
  }

  if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null

  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    companyId: payload.companyId,
  }
}

export const SESSION_COOKIE_NAME = "atlas_session"
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE
