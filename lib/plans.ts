/**
 * باقات اشتراك الشركات في أطلس المنزل.
 *
 * أربع باقات (أساسي / قياسي / احترافي / بريميوم) تُعرض بنمط مقارنة:
 * كل ميزة تُعلام بـ ✓ (مشمولة) أو — (غير مشمولة). التسجيل مجاني ولا يتطلب
 * بطاقة ائتمان؛ تبدأ الفترة التجريبية المجانية فور إنشاء الحساب ثم يتحوّل
 * الاشتراك إلى دفع شهري.
 *
 * هذه الوحدة مشتركة بين العميل (نموذج التسجيل وصفحة الشركاء) والخادم
 * (واجهة التسجيل)، لذا تبقى خالية من أي استيراد خاص بالخادم.
 */

export type PlanId = "basic" | "standard" | "professional" | "premium"

/** صف ميزة في مقارنة الباقات: مُشمول (✓) أو غير مُشمول (—). */
export type PlanFeature = {
  label: string
  included: boolean
}

export type Plan = {
  id: PlanId
  /** اسم الدرجة المختصر: أساسي / قياسي / احترافي / بريميوم. */
  name: { ar: string; en: string }
  /** الاسم الكامل للباقة: الباقة الأساسية … */
  fullName: { ar: string; en: string }
  /** السعر الشهري بعد انتهاء الفترة التجريبية (ريال سعودي). */
  price: number
  currency: "SAR"
  period: "monthly"
  /** عدد أيام التجربة المجانية. */
  trialDays: number
  features: PlanFeature[]
  /** الباقة الأكثر طلبًا — تُبرَز بشارة «الأكثر طلبًا». */
  popular?: boolean
  /** الباقة البريميوم — تُبرَز بشارة 💎. */
  premium?: boolean
  /** اللون المميّز للباقة. */
  accent: "primary" | "gold"
}

/** عدد أيام التجربة المجانية الموحّد لكل الباقات. */
export const TRIAL_DAYS = 30

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: { ar: "أساسي", en: "Basic" },
    fullName: { ar: "الباقة الأساسية", en: "Basic Plan" },
    price: 100,
    currency: "SAR",
    period: "monthly",
    trialDays: TRIAL_DAYS,
    accent: "primary",
    features: [
      { label: "إدراج في الدليل", included: true },
      { label: "ظهور في البحث", included: true },
      { label: "صفحة ملف", included: false },
      { label: "تصوير ريلز", included: false },
      { label: "إعلان مشاهير", included: false },
    ],
  },
  {
    id: "standard",
    name: { ar: "قياسي", en: "Standard" },
    fullName: { ar: "الباقة القياسية", en: "Standard Plan" },
    price: 250,
    currency: "SAR",
    period: "monthly",
    trialDays: TRIAL_DAYS,
    popular: true,
    accent: "primary",
    features: [
      { label: "صفحة ملف خاصة", included: true },
      { label: "واتساب + خرائط", included: true },
      { label: "٤ صور مشاريع", included: true },
      { label: "١ ريلز تصويري", included: true },
      { label: "إعلان مشاهير", included: false },
    ],
  },
  {
    id: "professional",
    name: { ar: "احترافي", en: "Professional" },
    fullName: { ar: "الباقة الاحترافية", en: "Professional Plan" },
    price: 350,
    currency: "SAR",
    period: "monthly",
    trialDays: TRIAL_DAYS,
    accent: "primary",
    features: [
      { label: "أولوية الظهور", included: true },
      { label: "٨ صور مشاريع", included: true },
      { label: "إحصائيات كاملة", included: true },
      { label: "٣ ريلز تصويرية", included: true },
      { label: "١ إعلان مشهور", included: true },
    ],
  },
  {
    id: "premium",
    name: { ar: "بريميوم", en: "Premium" },
    fullName: { ar: "الباقة البريميوم", en: "Premium Plan" },
    price: 500,
    currency: "SAR",
    period: "monthly",
    trialDays: TRIAL_DAYS,
    premium: true,
    accent: "gold",
    features: [
      { label: "بانر الصفحة الرئيسية", included: true },
      { label: "فيديو إعلاني احترافي", included: true },
      { label: "٦ ريلز تصويرية", included: true },
      { label: "٣ إعلانات مشاهير", included: true },
      { label: "مدير حساب مخصص", included: true },
    ],
  },
]

export const PLAN_IDS: PlanId[] = PLANS.map((p) => p.id)

export const PLAN_MAP: Record<PlanId, Plan> = PLANS.reduce(
  (acc, plan) => {
    acc[plan.id] = plan
    return acc
  },
  {} as Record<PlanId, Plan>,
)

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as string[]).includes(value)
}

export function getPlan(id: string): Plan | undefined {
  return isPlanId(id) ? PLAN_MAP[id] : undefined
}

/** نافذة الفترة التجريبية: تاريخ البداية والنهاية بصيغة ISO (الآن + أيام التجربة). */
export function buildTrialWindow(days: number = TRIAL_DAYS): {
  start: string
  end: string
} {
  const start = new Date()
  const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

/** عدد الأيام المتبقية حتى تاريخ ISO (صفر إذا انتهى أو أصبح سالبًا). */
export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  if (Number.isNaN(target)) return 0
  const diff = target - Date.now()
  if (diff <= 0) return 0
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}
