import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"

mock.module("server-only", () => ({}))

let connectCalls = 0
let failNextConnection = false
let lastDbName: string | undefined
let lastOptions: Record<string, unknown> | undefined

class MockMongoClient {
  constructor(_uri: string, options: Record<string, unknown>) {
    lastOptions = options
  }

  async connect() {
    connectCalls += 1
    if (failNextConnection) {
      failNextConnection = false
      throw new Error("temporary connection failure")
    }
    return this
  }

  db(name?: string) {
    lastDbName = name
    return { databaseName: name }
  }
}

mock.module("mongodb", () => ({ MongoClient: MockMongoClient }))

const { getMongoClient, getMongoDb } = await import("./mongodb")

describe("MongoDB client lifecycle", () => {
  beforeEach(() => {
    process.env.MONGODB_URI = "mongodb://localhost:27017/project-from-uri"
    delete process.env.MONGODB_DB
    delete process.env.DB_NAME
    globalThis.__mongodbClientPromise = undefined
    connectCalls = 0
    failNextConnection = false
    lastDbName = undefined
    lastOptions = undefined
  })

  afterEach(() => {
    globalThis.__mongodbClientPromise = undefined
  })

  test("reuses one client promise in production and development", async () => {
    for (const nodeEnv of ["development", "production"]) {
      Reflect.set(process.env, "NODE_ENV", nodeEnv)
      globalThis.__mongodbClientPromise = undefined
      connectCalls = 0

      const first = getMongoClient()
      const second = getMongoClient()

      expect(first).toBe(second)
      await Promise.all([first, second])
      expect(connectCalls).toBe(1)
    }

    expect(lastOptions).toMatchObject({
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
    })
  })

  test("clears a rejected connection so the next request can retry", async () => {
    failNextConnection = true
    await expect(getMongoClient()).rejects.toThrow("temporary connection failure")
    await getMongoClient()
    expect(connectCalls).toBe(2)
  })

  test("prefers MONGODB_DB, then DB_NAME", async () => {
    process.env.MONGODB_DB = "explicit-db"
    process.env.DB_NAME = "studio-db"
    await getMongoDb()
    expect(lastDbName).toBe("explicit-db")

    globalThis.__mongodbClientPromise = undefined
    delete process.env.MONGODB_DB
    await getMongoDb()
    expect(lastDbName).toBe("studio-db")
  })

  test("uses the database embedded in the URI when no override is configured", async () => {
    await getMongoDb()
    expect(lastDbName).toBeUndefined()
  })

  test("a missing URI fails clearly without poisoning future retries", async () => {
    delete process.env.MONGODB_URI
    await expect(getMongoClient()).rejects.toThrow(
      "Missing MONGODB_URI environment variable",
    )

    process.env.MONGODB_URI = "mongodb://localhost:27017/recovered"
    await getMongoClient()
    expect(connectCalls).toBe(1)
  })
})
