#!/usr/bin/env bun

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "contexts", "hooks", "lib"]
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "generated",
])
const FILE_EXTS = /\.(tsx?|jsx?)$/
const LOCALE_DIR = "lib/i18n/locales"
const T_CALL =
  /\bt\(\s*(['"`])((?:\\\1|(?!\1).)*?)\1(?:\s*,\s*(['"`])((?:\\\3|(?!\3).)*?)\3)?\s*\)/g
const SNAKE_KEY = /^[a-z][a-z0-9_]{1,}$/

type Issue = {
  file: string
  line: number
  level: "error" | "warn"
  msg: string
}

const issues: Issue[] = []

function loadLocale(name: string): Record<string, string> {
  try {
    return JSON.parse(readFileSync(join(ROOT, LOCALE_DIR, `${name}.json`), "utf8"))
  } catch (error) {
    console.error(
      `i18n-check: cannot read ${LOCALE_DIR}/${name}.json - ${
        (error as Error).message
      }`
    )
    process.exit(1)
  }
}

function walk(dir: string, out: string[] = []) {
  let entries: string[]

  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) {
      continue
    }

    const full = join(dir, entry)
    const stats = statSync(full)

    if (stats.isDirectory()) {
      walk(full, out)
    } else if (FILE_EXTS.test(entry)) {
      out.push(full)
    }
  }

  return out
}

function stripComments(source: string) {
  let output = ""
  let i = 0

  while (i < source.length) {
    const current = source[i]
    const next = source[i + 1]

    if (current === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") {
        output += " "
        i++
      }
    } else if (current === "/" && next === "*") {
      output += "  "
      i += 2

      while (
        i < source.length &&
        !(source[i] === "*" && source[i + 1] === "/")
      ) {
        output += source[i] === "\n" ? "\n" : " "
        i++
      }

      if (i < source.length) {
        output += "  "
        i += 2
      }
    } else {
      output += current
      i++
    }
  }

  return output
}

const ar = loadLocale("ar")
const en = loadLocale("en")
const arKeys = new Set(Object.keys(ar))
const enKeys = new Set(Object.keys(en))

for (const key of arKeys) {
  if (!enKeys.has(key)) {
    issues.push({
      file: `${LOCALE_DIR}/en.json`,
      line: 0,
      level: "error",
      msg: `missing key '${key}' from ar.json`,
    })
  }
}

for (const key of enKeys) {
  if (!arKeys.has(key)) {
    issues.push({
      file: `${LOCALE_DIR}/ar.json`,
      line: 0,
      level: "error",
      msg: `missing key '${key}' from en.json`,
    })
  }
}

const filePatterns = new Map<string, Set<"key" | "literal">>()
const sourceFiles = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)))

for (const file of sourceFiles) {
  const raw = readFileSync(file, "utf8")
  const text = stripComments(raw)
  const offsets = [0]

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") {
      offsets.push(i + 1)
    }
  }

  T_CALL.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = T_CALL.exec(text)) !== null) {
    const first = match[2]
    const second = match[4]
    const rel = relative(ROOT, file)
    let lo = 0
    let hi = offsets.length - 1

    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1

      if (offsets[mid] <= match.index) {
        lo = mid
      } else {
        hi = mid - 1
      }
    }

    const line = lo + 1
    const isKey = SNAKE_KEY.test(first)
    const pattern = isKey ? "key" : "literal"

    if (!filePatterns.has(rel)) {
      filePatterns.set(rel, new Set())
    }

    filePatterns.get(rel)?.add(pattern)

    if (first === "") {
      issues.push({
        file: rel,
        line,
        level: "error",
        msg: "t() called with empty first argument",
      })
      continue
    }

    if (isKey) {
      if (!arKeys.has(first)) {
        issues.push({
          file: rel,
          line,
          level: "error",
          msg: `t('${first}') missing from ${LOCALE_DIR}/ar.json`,
        })
      }

      if (!enKeys.has(first)) {
        issues.push({
          file: rel,
          line,
          level: "error",
          msg: `t('${first}') missing from ${LOCALE_DIR}/en.json`,
        })
      }
    } else if (second === undefined || second === "") {
      issues.push({
        file: rel,
        line,
        level: "error",
        msg: "literal t() calls need a non-empty English fallback",
      })
    }
  }
}

for (const [file, patterns] of filePatterns) {
  if (patterns.size > 1) {
    issues.push({
      file,
      line: 0,
      level: "warn",
      msg: "mixes key and literal-pair t() patterns; pick one per file",
    })
  }
}

const errors = issues.filter((issue) => issue.level === "error")
const warnings = issues.filter((issue) => issue.level === "warn")

for (const issue of [...errors, ...warnings]) {
  const tag = issue.level === "error" ? "error" : "warn "
  const location = issue.line > 0 ? `${issue.file}:${issue.line}` : issue.file

  console.log(`${tag} ${location}  ${issue.msg}`)
}

console.log(
  `\ni18n-check: ${sourceFiles.length} files scanned, ${arKeys.size} ar keys / ${enKeys.size} en keys, ${errors.length} error(s), ${warnings.length} warning(s)`
)

if (errors.length > 0) {
  process.exit(1)
}
