import "server-only"

import { type Filter } from "mongodb"

import { getCollections, ensureIndexes } from "@/lib/db"
import type {
  AdSenseSlot,
  Article,
  Banner,
  Campaign,
  ChangeRequest,
  EmailCampaign,
  EmailList,
  Integration,
  MediaItem,
  PlatformProject,
  PublishStatus,
  SocialPost,
  User,
} from "@/lib/types"

async function ready() {
  await ensureIndexes().catch(() => {})
}

const all = <T>(): T[] => []

/* ---------------- banners ---------------- */

export async function getActiveBannersForPlacement(
  placement: Banner["placement"],
): Promise<Banner[]> {
  try {
    await ready()
    const { banners } = await getCollections()
    const now = new Date().toISOString()
    const filter: Filter<Banner> = {
      status: "active",
      placement,
      $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }],
    }
    const items = await banners
      .find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .toArray()
    // استبعاد المنتهية صلاحيتها.
    return items.filter((b) => !b.endDate || b.endDate >= now)
  } catch {
    return []
  }
}

export async function getBannersByAdvertiser(advertiserId: string): Promise<Banner[]> {
  await ready()
  const { banners } = await getCollections()
  return banners
    .find({ advertiserId })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getBanners(filter: {
  status?: PublishStatus
  placement?: Banner["placement"]
}): Promise<Banner[]> {
  await ready()
  const { banners } = await getCollections()
  const f: Filter<Banner> = {}
  if (filter.status) f.status = filter.status
  if (filter.placement) f.placement = filter.placement
  return banners.find(f).sort({ createdAt: -1 }).toArray()
}

export async function getCompanyBanners(companyId: string): Promise<Banner[]> {
  await ready()
  const { banners } = await getCollections()
  return banners.find({ companyId }).sort({ priority: -1, createdAt: -1 }).toArray()
}

/* ---------------- campaigns ---------------- */

export async function getCampaigns(filter: {
  status?: PublishStatus
  advertiserId?: string
}): Promise<Campaign[]> {
  await ready()
  const { campaigns } = await getCollections()
  const f: Filter<Campaign> = {}
  if (filter.status) f.status = filter.status
  if (filter.advertiserId) f.advertiserId = filter.advertiserId
  return campaigns.find(f).sort({ createdAt: -1 }).toArray()
}

export async function getCampaignsByAdvertiser(advertiserId: string): Promise<Campaign[]> {
  await ready()
  const { campaigns } = await getCollections()
  return campaigns.find({ advertiserId }).sort({ createdAt: -1 }).toArray()
}

/* ---------------- articles ---------------- */

export async function getPublishedArticles(limit = 20): Promise<Article[]> {
  await ready()
  const { articles } = await getCollections()
  return articles
    .find({ status: "published" })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await ready()
  const { articles } = await getCollections()
  return articles.findOne({ slug, status: "published" })
}

export async function getAllArticles(filter: { status?: PublishStatus } = {}): Promise<Article[]> {
  await ready()
  const { articles } = await getCollections()
  const f: Filter<Article> = {}
  if (filter.status) f.status = filter.status
  return articles.find(f).sort({ createdAt: -1 }).toArray()
}

/* ---------------- media ---------------- */

export async function getMediaItems(context?: MediaItem["context"]): Promise<MediaItem[]> {
  await ready()
  const { media } = await getCollections()
  const f: Filter<MediaItem> = {}
  if (context) f.context = context
  return media.find(f).sort({ createdAt: -1 }).toArray()
}

/* ---------------- change requests ---------------- */

export async function getPendingChangeRequests(): Promise<ChangeRequest[]> {
  await ready()
  const { changeRequests } = await getCollections()
  return changeRequests
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getChangeRequestsByAdvertiser(
  advertiserId: string,
): Promise<ChangeRequest[]> {
  await ready()
  const { changeRequests } = await getCollections()
  return changeRequests
    .find({ advertiserId })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function countPendingApprovals(): Promise<{
  changes: number
  banners: number
  campaigns: number
  articles: number
  projects: number
  companies: number
  total: number
}> {
  await ready()
  const {
    changeRequests,
    banners,
    campaigns,
    articles,
    projects,
    companies,
  } = await getCollections()
  const [changes, b, c, a, p, cmp] = await Promise.all([
    changeRequests.countDocuments({ status: "pending" }),
    banners.countDocuments({ status: "pending-review" }),
    campaigns.countDocuments({ status: "pending-review" }),
    articles.countDocuments({ status: "pending-review" }),
    projects.countDocuments({ publishStatus: "pending-review" }),
    companies.countDocuments({ status: "pending" }),
  ])
  return {
    changes,
    banners: b,
    campaigns: c,
    articles: a,
    projects: p,
    companies: cmp,
    total: changes + b + c + a + p + cmp,
  }
}

/* ---------------- projects ---------------- */

export async function getPublishedProjects(limit = 20): Promise<PlatformProject[]> {
  await ready()
  const { projects } = await getCollections()
  return projects
    .find({ publishStatus: "published" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function getAllProjects(): Promise<PlatformProject[]> {
  await ready()
  const { projects } = await getCollections()
  return projects.find({}).sort({ createdAt: -1 }).toArray()
}

/* ---------------- email ---------------- */

export async function getEmailLists(): Promise<EmailList[]> {
  await ready()
  const { emailLists } = await getCollections()
  return emailLists.find({}).sort({ createdAt: -1 }).toArray()
}

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  await ready()
  const { emailCampaigns } = await getCollections()
  return emailCampaigns.find({}).sort({ createdAt: -1 }).toArray()
}

/* ---------------- social ---------------- */

export async function getSocialPosts(): Promise<SocialPost[]> {
  await ready()
  const { socialPosts } = await getCollections()
  return socialPosts.find({}).sort({ createdAt: -1 }).toArray()
}

/* ---------------- integrations ---------------- */

export async function getIntegrations(): Promise<Integration[]> {
  await ready()
  const { integrations } = await getCollections()
  return integrations.find({}).sort({ provider: 1 }).toArray()
}

export async function getIntegration(
  provider: Integration["provider"],
): Promise<Integration | null> {
  await ready()
  const { integrations } = await getCollections()
  return integrations.findOne({ provider })
}

/* ---------------- adsense slots ---------------- */

export async function getAdSenseSlots(): Promise<AdSenseSlot[]> {
  await ready()
  const { adsenseSlots } = await getCollections()
  return adsenseSlots.find({}).sort({ createdAt: 1 }).toArray()
}

/* ---------------- users / advertisers ---------------- */

export async function getUsersByRole(role: User["role"]): Promise<User[]> {
  await ready()
  const { users } = await getCollections()
  return users.find({ role }).sort({ createdAt: -1 }).toArray()
}

export async function getAllUsers(): Promise<User[]> {
  await ready()
  const { users } = await getCollections()
  return users.find({}).sort({ createdAt: -1 }).toArray()
}

/* ---------------- admin overview stats ---------------- */

export async function getOwnerOverviewStats(): Promise<{
  companies: number
  approvedCompanies: number
  pendingCompanies: number
  advertisers: number
  campaigns: number
  activeCampaigns: number
  activeBanners: number
  pendingBanners: number
  articles: number
  publishedArticles: number
  projects: number
  totalClicks: number
  totalImpressions: number
  totalBannerViews: number
  totalBannerClicks: number
  pendingApprovals: number
  users: number
  reviews: number
  mediaItems: number
}> {
  await ready()
  const {
    companies,
    users,
    campaigns,
    banners,
    articles,
    projects,
    reviews,
    media,
    changeRequests,
  } = await getCollections()

  const [
    companyCount,
    approvedCompanies,
    pendingCompanies,
    advertisers,
    campaignCount,
    activeCampaigns,
    activeBanners,
    pendingBanners,
    articleCount,
    publishedArticles,
    projectCount,
    reviewCount,
    mediaItems,
    pendingChanges,
  ] = await Promise.all([
    companies.countDocuments(),
    companies.countDocuments({ status: "approved" }),
    companies.countDocuments({ status: "pending" }),
    users.countDocuments({ role: "company" }),
    campaigns.countDocuments(),
    campaigns.countDocuments({ status: "active" }),
    banners.countDocuments({ status: "active" }),
    banners.countDocuments({ status: "pending-review" }),
    articles.countDocuments(),
    articles.countDocuments({ status: "published" }),
    projects.countDocuments({ publishStatus: "published" }),
    reviews.countDocuments(),
    media.countDocuments(),
    changeRequests.countDocuments({ status: "pending" }),
  ])

  const campaignAgg = await campaigns
    .aggregate<{ clicks: number; impressions: number }>([
      { $group: { _id: null, clicks: { $sum: "$clicks" }, impressions: { $sum: "$impressions" } } },
    ])
    .toArray()
  const bannerAgg = await banners
    .aggregate<{ views: number; clicks: number }>([
      { $group: { _id: null, views: { $sum: "$views" }, clicks: { $sum: "$clicks" } } },
    ])
    .toArray()

  return {
    companies: companyCount,
    approvedCompanies,
    pendingCompanies,
    advertisers,
    campaigns: campaignCount,
    activeCampaigns,
    activeBanners,
    pendingBanners,
    articles: articleCount,
    publishedArticles,
    projects: projectCount,
    totalClicks: campaignAgg[0]?.clicks ?? 0,
    totalImpressions: campaignAgg[0]?.impressions ?? 0,
    totalBannerViews: bannerAgg[0]?.views ?? 0,
    totalBannerClicks: bannerAgg[0]?.clicks ?? 0,
    pendingApprovals: pendingChanges + pendingBanners,
    users: advertisers,
    reviews: reviewCount,
    mediaItems,
  }
}

export { all }
