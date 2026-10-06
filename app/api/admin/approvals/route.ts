import { NextResponse } from "next/server"

import { getCollections } from "@/lib/db"
import { requireStaff } from "@/lib/session"
import { countPendingApprovals } from "@/lib/platform-queries"

export async function GET() {
  const session = await requireStaff().catch((error) => error)
  if (session instanceof Error) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
  }

  const { changeRequests, banners, campaigns, articles, projects, companies } =
    await getCollections()

  const [changes, pendingBanners, pendingCampaigns, pendingArticles, pendingProjects, pendingCompanies, counts] =
    await Promise.all([
      changeRequests.find({ status: "pending" }).sort({ createdAt: -1 }).toArray(),
      banners.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      campaigns.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      articles.find({ status: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      projects.find({ publishStatus: "pending-review" }).sort({ createdAt: -1 }).toArray(),
      companies.find({ status: "pending" }).sort({ createdAt: -1 }).toArray(),
      countPendingApprovals(),
    ])

  return NextResponse.json({
    counts,
    changes,
    banners: pendingBanners,
    campaigns: pendingCampaigns,
    articles: pendingArticles,
    projects: pendingProjects,
    companies: pendingCompanies,
  })
}
