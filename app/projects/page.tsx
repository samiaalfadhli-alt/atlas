import Link from "next/link"
import { MapPin, ArrowLeft, Building2 } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { getPublishedProjects } from "@/lib/platform-queries"
import { toArabicDigits } from "@/lib/format"

// قائمة المشاريع تُقرأ من قاعدة البيانات. لا تتوفر MONGODB_URI أثناء بناء الإنتاج،
// لذا نُعرّض الصفحة ديناميكيًا عند الطلب بدل التوليد المسبق الثابت.
export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  "off-plan": "على المخطط",
  "under-construction": "قيد الإنشاء",
  ready: "جاهز",
  "sold-out": "مباع بالكامل",
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects(30)

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">الرئيسية</Link>
        <span>/</span>
        <span className="text-foreground">المشاريع</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">المشاريع</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مشاريع المطورين العقاريين — فلل، شقق، تاون هاوس ومجمعات سكنية في المملكة.
        </p>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute end-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                {p.developerName && <span className="text-xs font-semibold text-primary">{p.developerName}</span>}
                <h2 className="font-heading text-lg font-bold leading-tight">{p.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  {p.city && <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {p.city}</span>}
                  {p.units && <span className="inline-flex items-center gap-1"><Building2 className="size-3" /> {p.units}</span>}
                </div>
                {p.priceFrom ? (
                  <p className="mt-1 font-heading text-sm font-bold text-primary">
                    ابتداءً من {toArabicDigits(p.priceFrom)} ريال
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ArrowLeft className="size-7" />}
          title="لا توجد مشاريع منشورة بعد"
          description="ستظهر هنا مشاريع المطورين العقاريين قريباً."
        />
      )}
    </main>
  )
}
