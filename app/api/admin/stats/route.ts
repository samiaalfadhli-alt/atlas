import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireAdmin } from "@/lib/session"
import { CATEGORIES, type Category } from "@/lib/types"

export async function GET() {
  const session = await requireAdmin().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { companies, reviews, users } = await getCollections()
  const [total, approved, pending, rejected, reviewTotal, companyUsers, catRows] =
    await Promise.all([
      companies.countDocuments(),
      companies.countDocuments({ status: "approved" }),
      companies.countDocuments({ status: "pending" }),
      companies.countDocuments({ status: "rejected" }),
      reviews.countDocuments(),
      users.countDocuments({ role: "company" }),
      companies
        .aggregate<{ _id: string; count: number }>([
          { $match: { status: "approved" } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ])
        .toArray(),
    ])

  const byCategory = {} as Record<Category, number>
  for (const cat of CATEGORIES) byCategory[cat] = 0
  for (const row of catRows) {
    const key = row._id as Category
    if (key in byCategory) byCategory[key] = row.count
  }

  return NextResponse.json({
    total,
    approved,
    pending,
    rejected,
    reviewTotal,
    companyUsers,
    byCategory,
  })
}
