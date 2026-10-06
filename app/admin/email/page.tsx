import { Mail, Users, Send, Eye, MousePointerClick } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { AdminPageHeader, AdminStat, DisconnectedNotice } from "@/components/admin-primitives"
import {
  EmailListForm,
  EmailSubscriberAdder,
  EmailCampaignForm,
} from "@/components/email-center"
import { getEmailLists, getEmailCampaigns } from "@/lib/platform-queries"
import { getCollections } from "@/lib/db"
import { toArabicDigits, timeAgo } from "@/lib/format"
import { EMAIL_SEGMENTS } from "@/lib/types"

export default async function EmailPage() {
  const [lists, campaigns] = await Promise.all([
    getEmailLists(),
    getEmailCampaigns(),
  ])
  const { emailSubscribers } = await getCollections()
  const totalSubscribers = await emailSubscribers.countDocuments()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="مركز التسويق البريدي"
        subtitle="إنشاء القوائم، استيراد المشتركين، تقسيم الجمهور، تصميم الحملات وجدولتها."
        action={<EmailCampaignForm />}
      />

      <DisconnectedNotice
        provider="مزوّد البريد الإلكتروني"
        description="لم يتم ربط مزوّد بريد معتمد بعد. الحملات والقوائم والمشتركون تُحفظ في النظام، أما الإرسال الفعلي وتتبّع الفتح والنقرات فيتطلب ربط مزوّد بريد عبر التكامل."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStat icon={<Users className="size-5" />} label="إجمالي المشتركين" value={totalSubscribers} tone="primary" />
        <AdminStat icon={<Mail className="size-5" />} label="القوائم البريدية" value={lists.length} />
        <AdminStat icon={<Send className="size-5" />} label="الحملات البريدية" value={campaigns.length} tone="gold" />
      </div>

      {/* القوائم */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            القوائم البريدية
          </CardTitle>
          <EmailListForm />
        </CardHeader>
        <CardContent className="space-y-3">
          {lists.length > 0 ? (
            lists.map((list) => {
              const seg = EMAIL_SEGMENTS.find((s) => s.value === list.segment)
              return (
                <div key={list._id} className="rounded-xl border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-heading text-sm font-bold">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {seg?.ar ?? list.segment} • {toArabicDigits(list.subscriberCount)} مشترك
                      </p>
                    </div>
                  </div>
                  <EmailSubscriberAdder listId={list._id} />
                </div>
              )
            })
          ) : (
            <EmptyState
              icon={<Mail className="size-7" />}
              title="لا توجد قوائم بريدية"
              description="أنشئ أول قائمة بريدية وحدّد شريحتها."
            />
          )}
        </CardContent>
      </Card>

      {/* الحملات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            الحملات البريدية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length > 0 ? (
            campaigns.map((c) => (
              <div key={c._id} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.subject} • {c.status === "sent" ? "مُرسلة" : c.status === "scheduled" ? "مجدولة" : "مسودة"} • {timeAgo(c.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Eye className="size-3" /> {toArabicDigits(c.opens)}</span>
                  <span className="inline-flex items-center gap-1"><MousePointerClick className="size-3" /> {toArabicDigits(c.clicks)}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Send className="size-7" />}
              title="لا توجد حملات بريدية"
              description="أنشئ أول حملة — تُحفظ حتى يُربط مزوّد البريد."
            />
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        الشرائح المتاحة: {EMAIL_SEGMENTS.map((s) => s.ar).join(" — ")}. يشمل النظام Unsubscribe وتتبّع الفتح والنقرات بعد ربط المزوّد.
      </p>
    </div>
  )
}
