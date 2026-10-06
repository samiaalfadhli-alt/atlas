import { afterEach, describe, expect, test } from "bun:test"

import {
  isEtlaqSandboxHostname,
  sessionCookieOptions,
} from "./session-cookie"

const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  Object.assign(process.env, { NODE_ENV: originalNodeEnv })
})

describe("Etlaq sandbox session cookies", () => {
  test("recognizes only the Etlaq sandbox host boundary", () => {
    expect(isEtlaqSandboxHostname("3000-demo.sandbox.etlaq.sa")).toBe(true)
    expect(isEtlaqSandboxHostname("SANDBOX.ETLAQ.SA.")).toBe(true)
    expect(isEtlaqSandboxHostname("sandbox.etlaq.sa.attacker.example")).toBe(
      false,
    )
    expect(isEtlaqSandboxHostname("notetlaq.sa")).toBe(false)
  })

  test("uses a secure partitioned cookie in an embedded sandbox preview", () => {
    Object.assign(process.env, { NODE_ENV: "development" })

    expect(
      sessionCookieOptions(
        new Request("https://3000-demo.sandbox.etlaq.sa/api/auth/login"),
        3600,
      ),
    ).toEqual({
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      secure: true,
      sameSite: "none",
      partitioned: true,
    })
  })

  test("preserves normal first-party cookie behavior outside previews", () => {
    Object.assign(process.env, { NODE_ENV: "development" })

    expect(
      sessionCookieOptions(
        new Request("http://localhost:3000/api/auth/login"),
        3600,
      ),
    ).toEqual({
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      secure: false,
      sameSite: "lax",
    })
  })

  test("keeps first-party production cookies secure without partitioning", () => {
    Object.assign(process.env, { NODE_ENV: "production" })

    expect(
      sessionCookieOptions(
        new Request("https://app.example.com/api/auth/login"),
        3600,
      ),
    ).toEqual({
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      secure: true,
      sameSite: "lax",
    })
  })
})
