import Link from "next/link"

import { BarChart3, Building2, Eye, FileText, GalleryVerticalEnd, Image as ImageIcon, MapPin, Megaphone, Mail, MousePointerClick, Share2, Users } from "lucide-react"

import { AdminPageHeader, AdminStat, DisconnectedNotice } from "@/components/admin-primitives"
import { getOwnerOverviewStats, getIntegrations } from "@/lib/platform-queries"
import { getCollections } from "@/lib/db"

export default async function ReportsPage() {
  const [stats, integrations] = await Promise.all([
    getOwnerOverviewStats(),
    getIntegrations(),
  ])
  const { emailSubscribers, emailCampaigns, socialPosts } = await getCollections()
  const [subscribers, campaignsCount, socialCount] = await Promise.all([
    emailSubscribers.countDocuments(),
    emailCampaigns.countDocuments(),
    socialPosts.countDocuments(),
  ])

  const extMap = new Map(integrations.map((i) => [i.provider, i.status]))
  const isDisconnected = (p: string) => extMap.get(p as never) !== "connected"

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مركز التحليلات الموحّد"
        subtitle="تجميع بيانات الموقع والإعلانات والمحتوى والبريد والتواصل — والتكاملات الخارجية عند ربطها."
      />

      {/* بيانات داخلية حقيقية */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">بيانات المنصة (حقيقية)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStat icon={<Building2 className="size-5" />} label="الشركات المعتمدة" value={stats.approvedCompanies} tone="primary" />
          <AdminStat icon={<Users className="size-5" />} label="المعلنون" value={stats.advertisers} />
          <AdminStat icon={<Megaphone className="size-5" />} label="الحملات النشطة" value={stats.activeCampaigns} />
          <AdminStat icon={<GalleryVerticalEnd className="size-5" />} label="بنرات نشطة" value={stats.activeBanners} tone="gold" />
          <AdminStat icon={<Eye className="size-5" />} label="مشاهدات الإعلانات" value={stats.totalImpressions + stats.totalBannerViews} />
          <AdminStat icon={<MousePointerClick className="size-5" />} label="نقرات الإعلانات" value={stats.totalClicks + stats.totalBannerClicks} tone="primary" />
          <AdminStat icon={<FileText className="size-5" />} label="مقالات منشورة" value={stats.publishedArticles} />
          <AdminStat icon={<MapPin className="size-5" />} label="مشاريع منشورة" value={stats.projects} />
          <AdminStat icon={<ImageIcon className="size-5" />} label="ملفات الوسائط" value={stats.mediaItems} />
          <AdminStat icon={<Mail className="size-5" />} label="مشتركون بريديون" value={subscribers} />
          <AdminStat icon={<Mail className="size-5" />} label="حملات بريدية" value={campaignsCount} />
          <AdminStat icon={<Share2 className="size-5" />} label="منشورات اجتماعية" value={socialCount} />
        </div>
      </div>

      {/* التكاملات الخارجية */}
      <div>
        <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">التكاملات الخارجية</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <IntegrationCard name="Google Analytics" disconnected={isDisconnected("google-analytics")} href="/admin/analytics" />
          <IntegrationCard name="Google Ads" disconnected={isDisconnected("google-ads")} href="/admin/google-ads" />
          <IntegrationCard name="Google AdSense" disconnected={isDisconnected("google-adsense")} href="/admin/adsense" />
        </div>
      </div>

      <DisconnectedNotice
        provider="التكاملات الخارجية"
        description="تُعرض هنا بيانات حقيقية فقط بعد ربط كل خدمة عبر تكاملها الرسمي. حتى الربط، الحالة «غير متصل» ولا توجد أرقام وهمية."
      />
    </div>
  )
}

function IntegrationCard({ name, disconnected, href }: { name: string; disconnected: boolean; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <BarChart3 className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{disconnected ? "غير متصل" : "متصل"}</p>
        </div>
      </div>
      <span className={`size-2.5 rounded-full ${disconnected ? "bg-muted-foreground/40" : "bg-primary"}`} />
    </Link>
  )
}
