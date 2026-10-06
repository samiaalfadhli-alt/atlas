import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toArabicDigits } from "@/lib/format"
import {
  PUBLISH_STATUS_LABELS,
  type PublishStatus,
} from "@/lib/types"

export function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function AdminStat({
  icon,
  label,
  value,
  tone = "default",
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  tone?: "default" | "primary" | "gold" | "amber" | "destructive"
  hint?: string
}) {
  const toneClass = {
    default: "bg-secondary text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold-foreground",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    destructive: "bg-destructive/10 text-destructive",
  }[tone]

  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", toneClass)}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="font-heading text-xl font-bold leading-none tabular-nums">
            {typeof value === "number" ? toArabicDigits(value) : value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

const STATUS_TONE: Record<
  PublishStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  "pending-review": "outline",
  approved: "default",
  active: "default",
  paused: "secondary",
  rejected: "destructive",
  expired: "outline",
  published: "default",
}

export function StatusBadge({
  status,
  className,
}: {
  status: PublishStatus
  className?: string
}) {
  const meta = PUBLISH_STATUS_LABELS[status]
  return (
    <Badge
      variant={STATUS_TONE[status]}
      className={cn(
        "gap-1 whitespace-nowrap",
        status === "pending-review" && "border-gold/50 text-gold-foreground",
        status === "paused" && "border-amber-500/40 text-amber-700 dark:text-amber-400",
        status === "expired" && "text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "active" || status === "approved" || status === "published"
            ? "bg-primary"
            : status === "pending-review"
              ? "bg-gold"
              : status === "rejected"
                ? "bg-destructive"
                : status === "paused"
                  ? "bg-amber-500"
                  : "bg-muted-foreground",
        )}
      />
      {meta.ar}
    </Badge>
  )
}

export function DisconnectedNotice({
  provider,
  description,
}: {
  provider: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-border bg-secondary/30 px-5 py-6 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <span className="size-3 rounded-full bg-muted-foreground/40" />
      </span>
      <div>
        <p className="font-heading text-sm font-bold text-foreground">
          {provider} — غير متصل
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <p className="text-xs text-muted-foreground/80">
        تُعرض هنا بيانات حقيقية فقط بعد ربط الخدمة عبر التكامل الرسمي. لا توجد أرقام تجريبية أو وهمية.
      </p>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
