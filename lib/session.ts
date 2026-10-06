import "server-only"

import { cookies } from "next/headers"

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth"
import { isStaffRole, type SessionUser } from "@/lib/types"

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new UnauthenticatedError()
  }
  return session
}

/** Super Admin / صاحب الموقع — صلاحية كاملة. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== "admin") {
    throw new ForbiddenError()
  }
  return session
}

/** طاقم الإدارة (admin / content-manager / ads-manager) — يصلح للوحة صاحب الموقع. */
export async function requireStaff(): Promise<SessionUser> {
  const session = await requireSession()
  if (!isStaffRole(session.role)) {
    throw new ForbiddenError()
  }
  return session
}

/** أي فرد من طاقم الإدارة له صلاحية على نوع معيّن من العمليات. */
export async function requireStaffWithRole(
  ...roles: SessionUser["role"][]
): Promise<SessionUser> {
  const session = await requireSession()
  if (!isStaffRole(session.role) || !roles.includes(session.role)) {
    throw new ForbiddenError()
  }
  return session
}

/** المعلن (صاحب شركة) — لوحة المعلن. */
export async function requireAdvertiser(): Promise<SessionUser> {
  const session = await requireSession()
  if (session.role !== "company") {
    throw new ForbiddenError()
  }
  return session
}

/** أي مستخدم مسجّل دخوله. */
export async function requireUser(): Promise<SessionUser> {
  return requireSession()
}

// Kept for backward compatibility with existing admin routes.
export async function requireAdmin(): Promise<SessionUser> {
  return requireSuperAdmin()
}

// Kept for backward compatibility with existing company dashboard routes.
export async function requireCompany(): Promise<SessionUser> {
  return requireAdvertiser()
}

export function isStaffSession(session: SessionUser | null): boolean {
  return !!session && isStaffRole(session.role)
}

export class UnauthenticatedError extends Error {
  status = 401
}

export class ForbiddenError extends Error {
  status = 403
}
