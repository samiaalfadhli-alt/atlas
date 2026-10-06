import "server-only"

import { type Filter } from "mongodb"

import { getCollections, seedDatabase } from "@/lib/db"
import { CATEGORIES, type Category, type Company } from "@/lib/types"

export async function ensureReady() {
  await seedDatabase().catch(() => {})
}

export async function getFeaturedCompanies(limit = 6): Promise<Company[]> {
  try {
    await ensureReady()
    const { companies } = await getCollections()
    const items = await companies
      .find({ status: "approved", featured: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .toArray()
    // Fallback to any approved if not enough featured.
    if (items.length < limit) {
      const extra = await companies
        .find({ status: "approved", _id: { $nin: items.map((c) => c._id) } })
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit - items.length)
        .toArray()
      items.push(...extra)
    }
    return items.map(normalize)
  } catch {
    return []
  }
}

export async function getCategoryStats(): Promise<{
  total: number
  byCategory: Record<Category, number>
}> {
  const byCategory = {} as Record<Category, number>
  for (const cat of CATEGORIES) byCategory[cat] = 0
  try {
    await ensureReady()
    const { companies } = await getCollections()
    const [total, rows] = await Promise.all([
      companies.countDocuments({ status: "approved" }),
      companies
        .aggregate<{ _id: string; count: number }>([
          { $match: { status: "approved" } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
        .toArray(),
    ])
    for (const row of rows) {
      const key = row._id as Category
      if (key in byCategory) byCategory[key] = row.count
    }
    return { total, byCategory }
  } catch {
    return { total: 0, byCategory }
  }
}

export async function getDistinctCities(): Promise<string[]> {
  try {
    await ensureReady()
    const { companies } = await getCollections()
    const cities = await companies.distinct("city", { status: "approved" })
    return cities.filter(Boolean).sort()
  } catch {
    return []
  }
}

export async function getCompanies(filters: {
  category?: Category
  city?: string
  q?: string
  service?: string
  sort?: "featured" | "rating" | "newest"
  page?: number
  limit?: number
}): Promise<{ items: Company[]; total: number; page: number; pages: number; limit: number }> {
  await ensureReady()
  const { companies } = await getCollections()
  const { category, city, q, service, sort = "featured", page = 1, limit = 12 } = filters

  const filter: Filter<Company> = { status: "approved" }
  if (category) filter.category = category
  if (city) filter.city = city
  if (service) filter.services = service
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

  const [items, total] = await Promise.all([
    companies
      .find(filter)
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    companies.countDocuments(filter),
  ])

  return {
    items: items.map(normalize),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  await ensureReady()
  const { companies } = await getCollections()
  const company = await companies.findOne({ slug, status: "approved" })
  return company ? normalize(company) : null
}

export async function getCompanyById(id: string): Promise<Company | null> {
  await ensureReady()
  const { companies } = await getCollections()
  const company = await companies.findOne({ _id: id })
  return company ? normalize(company) : null
}

export async function getReviews(companyId: string) {
  await ensureReady()
  const { reviews } = await getCollections()
  const items = await reviews
    .find({ companyId })
    .sort({ createdAt: -1 })
    .toArray()
  return items
}

export async function getCompanyByOwner(ownerId: string): Promise<Company | null> {
  await ensureReady()
  const { companies } = await getCollections()
  const company = await companies.findOne({ ownerId })
  return company ? normalize(company) : null
}

function normalize(c: Company): Company {
  return {
    ...c,
    portfolio: c.portfolio ?? [],
    services: c.services ?? [],
  }
}
