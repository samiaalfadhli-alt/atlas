import { NextResponse } from "next/server"
import { type Filter } from "mongodb"

import { getCollections, seedDatabase } from "@/lib/db"
import { CATEGORIES, type Category, type Company } from "@/lib/types"

const VALID_SORTS = ["featured", "rating", "newest"] as const
type SortKey = (typeof VALID_SORTS)[number]

export async function GET(request: Request) {
  await seedDatabase().catch(() => {})

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const city = searchParams.get("city") || undefined
  const q = searchParams.get("q")?.trim() || undefined
  const service = searchParams.get("service")?.trim() || undefined
  const sortParam = (searchParams.get("sort") || "featured") as SortKey
  const sort: SortKey = VALID_SORTS.includes(sortParam) ? sortParam : "featured"
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") || 12)))
  const featuredOnly = searchParams.get("featured") === "1"

  const filter: Filter<Company> = { status: "approved" }
  if (category && CATEGORIES.includes(category as Category)) {
    filter.category = category as Category
  }
  if (city) filter.city = city
  if (service) filter.services = service
  if (featuredOnly) filter.featured = true
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { nameEn: { $regex: q, $options: "i" } },
      { tagline: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ]
  }

  const sortSpec: Record<string, 1 | -1> =
    sort === "rating"
      ? { rating: -1, reviewCount: -1 }
      : sort === "newest"
        ? { createdAt: -1 }
        : { featured: -1, rating: -1, reviewCount: -1 }

  const { companies } = await getCollections()
  const [items, total] = await Promise.all([
    companies
      .find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    companies.countDocuments(filter),
  ])

  const safe: Company[] = items.map((c) => ({
    ...c,
    portfolio: c.portfolio ?? [],
    services: c.services ?? [],
  }))

  return NextResponse.json({
    items: safe,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  })
}
