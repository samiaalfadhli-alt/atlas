import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Calendar, Eye, ArrowLeft } from "lucide-react"

import { getArticleBySlug } from "@/lib/platform-queries"
import { toArabicDigits, formatDate } from "@/lib/format"

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: "المقال غير موجود | أطلس المنزل" }
  return {
    title: `${article.title} | أطلس المنزل`,
    description: article.seoDescription || article.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">الرئيسية</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-foreground">المقالات</Link>
        <span>/</span>
        <span className="truncate text-foreground">{article.title}</span>
      </nav>

      <article className="space-y-6">
        {article.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="aspect-[16/8] w-full rounded-2xl object-cover"
          />
        )}

        <header className="space-y-3">
          <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{article.authorName}</span>
            {article.publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" /> {formatDate(article.publishedAt)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" /> {toArabicDigits(article.views)} مشاهدة
            </span>
          </div>
        </header>

        <div className="prose-atlas space-y-4 text-base leading-loose text-foreground/90">
          {article.body.split("\n").map((line, i) =>
            line.trim() ? <p key={i}>{line}</p> : <br key={i} />,
          )}
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          العودة إلى المقالات
        </Link>
      </article>
    </main>
  )
}
