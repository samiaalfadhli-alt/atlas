import Link from "next/link"
import { Calendar, ArrowLeft } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { getPublishedArticles } from "@/lib/platform-queries"
import { formatDate } from "@/lib/format"

// قائمة المقالات تُقرأ من قاعدة البيانات. لا تتوفر MONGODB_URI أثناء بناء الإنتاج،
// لذا نُعرّض الصفحة ديناميكيًا عند الطلب بدل التوليد المسبق الثابت.
export const dynamic = "force-dynamic"

export default async function ArticlesPage() {
  const articles = await getPublishedArticles(24)

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">الرئيسية</Link>
        <span>/</span>
        <span className="text-foreground">المقالات</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">المقالات والمحتوى</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          مقالات وأخبار ونصائح حول البناء والتصميم والعقارات في المملكة.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a._id}
              href={`/articles/${a.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {a.coverImage && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.coverImage} alt={a.title} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                {a.category && (
                  <span className="text-xs font-semibold text-primary">{a.category}</span>
                )}
                <h2 className="font-heading text-lg font-bold leading-tight">{a.title}</h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                  <span>{a.authorName}</span>
                  {a.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" /> {formatDate(a.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ArrowLeft className="size-7" />}
          title="لا توجد مقالات منشورة بعد"
          description="ستظهر هنا مقالات وأخبار المنزل والعقارات قريباً."
        />
      )}
    </main>
  )
}
