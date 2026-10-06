import type { PlanId } from "@/lib/plans"

export type Category =
  | "interior-designer"
  | "architect"
  | "contractor"
  | "furniture"
  | "landscaping"
  | "lighting"
  | "kitchens"
  | "painting"
  | "real-estate"
  | "real-estate-development"
  | "insulation"
  | "hvac"

export type CompanyStatus = "pending" | "approved" | "rejected"

/**
 * أدوار المنصة — موسّعة مع الحفاظ على التوافق مع النظام السابق.
 * - "company"  = المعلن (صاحب شركة) — يعدّل وينشئ لكن لا ينشر مباشرة.
 * - "admin"    = Super Admin / صاحب الموقع — صلاحية كاملة ونشر مباشر.
 * - "content-manager" = مدير المحتوى — إدارة المحتوى والصور والمقالات.
 * - "ads-manager" = مدير الإعلانات — إدارة الحملات والمعلنين والبنرات.
 * - "user" = مستخدم عادي — التصفح والبحث والمفضلة والتقييم.
 */
export type UserRole =
  | "user"
  | "company"
  | "content-manager"
  | "ads-manager"
  | "admin"

export const ROLE_LABELS: Record<UserRole, { ar: string; en: string }> = {
  user: { ar: "مستخدم", en: "User" },
  company: { ar: "معلن / شركة", en: "Advertiser" },
  "content-manager": { ar: "مدير المحتوى", en: "Content Manager" },
  "ads-manager": { ar: "مدير الإعلانات", en: "Ads Manager" },
  admin: { ar: "المالك / Super Admin", en: "Super Admin" },
}

/** الأدوار الإدارية التي تملك صلاحية النشر المباشر والاعتماد. */
export const STAFF_ROLES: UserRole[] = [
  "admin",
  "content-manager",
  "ads-manager",
]

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as string[]).includes(role)
}

export type Project = {
  id: string
  title: string
  titleEn?: string
  description: string
  imageUrl: string
  location?: string
  year?: string
  category?: string
}

/** حالة اشتراك الشركة في الباقة. */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"

/**
 * اشتراك الشركة في إحدى باقات أطلس المنزل.
 * يُنشأ عند التسجيل بفترة تجريبية مجانية مدتها ٣٠ يومًا.
 */
export type Subscription = {
  planId: PlanId
  planName: string
  status: SubscriptionStatus
  /** بداية الفترة التجريبية (ISO). */
  trialStart: string
  /** نهاية الفترة التجريبية (ISO) — بعدها يلزم تفعيل الاشتراك. */
  trialEnd: string
  /** تاريخ بدء الاشتراك الفعلي (ISO). */
  startedAt: string
  /** السعر الشهري بعد التجربة (ريال سعودي). */
  price: number
  currency: "SAR"
  period: "monthly"
}

export type Company = {
  _id: string
  name: string
  nameEn?: string
  slug: string
  category: Category
  tagline: string
  description: string
  city: string
  district?: string
  services: string[]
  phone: string
  email: string
  website?: string
  logoUrl?: string
  coverUrl?: string
  establishedYear?: string
  teamSize?: string
  status: CompanyStatus
  ownerId?: string
  rating: number
  reviewCount: number
  projectCount: number
  portfolio: Project[]
  featured: boolean
  verified: boolean
  subscription?: Subscription
  createdAt: string
  updatedAt: string
}

export type User = {
  _id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  companyId?: string
  passwordHash?: string
  createdAt: string
}

export type Review = {
  _id: string
  companyId: string
  userId: string
  userName: string
  rating: number
  comment: string
  reply?: string
  repliedAt?: string
  createdAt: string
}

export type SessionUser = {
  id: string
  email: string
  name: string
  role: UserRole
  companyId?: string
}

export type CategoryMeta = {
  ar: string
  en: string
  icon: string
  /** Tailwind/CSS color variable name used for solid accents (unified burgundy). */
  colorVar: string
  /** Category header image path. */
  image: string
  description: { ar: string; en: string }
  /** Sub-specialties listed inside the category. */
  subcategories: string[]
}

/**
 * التصنيفات الرئيسية لأطلس المنزل — 12 تصنيفاً رئيسياً،
 * كل تصنيف يحتوي على تخصصات فرعية (subcategories) تُستخدم أيضاً
 * كقائمة الخدمات المتاحة لتخصص الشركة.
 */
export const CATEGORIES: Category[] = [
  "interior-designer",
  "architect",
  "contractor",
  "furniture",
  "landscaping",
  "lighting",
  "kitchens",
  "painting",
  "real-estate",
  "real-estate-development",
  "insulation",
  "hvac",
]

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  "interior-designer": {
    ar: "مصمم داخلي",
    en: "Interior Designer",
    icon: "Sofa",
    colorVar: "primary",
    image: "/generated/categories/cat-interior-designer-0x925e02a0.webp",
    description: {
      ar: "تصميم وتخطيط المساحات الداخلية: المجالس، غرف النوم، الصالات والمكاتب.",
      en: "Interior space planning and design: majlis, bedrooms, living rooms and offices.",
    },
    subcategories: [
      "تصميم داخلي سكني",
      "تصميم تجاري",
      "تشطيبات داخلية",
      "ديكورات جبسية",
      "استشارات ألوان",
      "تجهيز مكاتب",
    ],
  },
  architect: {
    ar: "مهندس معماري",
    en: "Architect",
    icon: "PencilRuler",
    colorVar: "primary",
    image: "/generated/categories/cat-architect-0xb6a18674.webp",
    description: {
      ar: "التصميم المعماري، المخططات، الواجهات، الفلل والمباني والمشاريع.",
      en: "Architectural design, plans, facades, villas, buildings and projects.",
    },
    subcategories: [
      "تصميم معماري",
      "مخططات معمارية",
      "تصميم واجهات",
      "تصميم فلل",
      "تصميم مباني",
      "استشارات معمارية",
    ],
  },
  contractor: {
    ar: "مقاول",
    en: "Contractor",
    icon: "HardHat",
    colorVar: "primary",
    image: "/generated/categories/cat-contractor-0x08db6638.webp",
    description: {
      ar: "البناء، الترميم، التشطيبات، التنفيذ وإدارة المشاريع.",
      en: "Building, restoration, finishing, execution and project management.",
    },
    subcategories: [
      "بناء فلل",
      "بناء عمائر",
      "ترميم",
      "تشطيبات",
      "أعمال خرسانية",
      "إدارة مشاريع",
    ],
  },
  furniture: {
    ar: "أثاث",
    en: "Furniture",
    icon: "Armchair",
    colorVar: "primary",
    image: "/generated/categories/cat-furniture-0xc7f1974b.webp",
    description: {
      ar: "الأثاث المنزلي، المجالس، غرف النوم، الصالات، المكاتب والقطع المخصصة.",
      en: "Home furniture: majlis, bedrooms, living rooms, offices and custom pieces.",
    },
    subcategories: [
      "مجالس",
      "غرف نوم",
      "صالات",
      "مكاتب",
      "قطع مخصصة",
      "أثاث خارجي",
    ],
  },
  landscaping: {
    ar: "حدائق وتنسيق خارجي",
    en: "Landscaping",
    icon: "Trees",
    colorVar: "primary",
    image: "/generated/categories/cat-landscaping-0x55a69074.webp",
    description: {
      ar: "تصميم الحدائق، تنسيق المساحات الخارجية، الزراعة، الجلسات والمسابح.",
      en: "Garden design, outdoor landscaping, planting, seating and pools.",
    },
    subcategories: [
      "تصميم حدائق",
      "تنسيق خارجي",
      "زراعة",
      "جلسات خارجية",
      "مسابح",
      "شبكات ري",
    ],
  },
  lighting: {
    ar: "إضاءة",
    en: "Lighting",
    icon: "Lightbulb",
    colorVar: "primary",
    image: "/generated/categories/cat-lighting-0x82024f03.webp",
    description: {
      ar: "الإضاءة الداخلية والخارجية، الثريات، الإنارة الذكية وحلول الإضاءة.",
      en: "Indoor and outdoor lighting, chandeliers, smart lighting and lighting solutions.",
    },
    subcategories: [
      "إضاءة داخلية",
      "إضاءة خارجية",
      "ثريات",
      "إنارة ذكية",
      "حلول إضاءة",
      "صيانة إنارة",
    ],
  },
  kitchens: {
    ar: "مطابخ",
    en: "Kitchens",
    icon: "CookingPot",
    colorVar: "primary",
    image: "/generated/categories/cat-kitchens-0xff3eb9b3.webp",
    description: {
      ar: "تصميم وتنفيذ المطابخ، المطابخ الجاهزة والمخصصة، الخزائن والأسطح.",
      en: "Kitchen design and execution, ready and custom kitchens, cabinets and countertops.",
    },
    subcategories: [
      "مطابخ جاهزة",
      "مطابخ مخصصة",
      "خزائن",
      "أسطح",
      "تصميم مطابخ",
      "تركيب وصيانة",
    ],
  },
  painting: {
    ar: "دهانات",
    en: "Painting",
    icon: "PaintRoller",
    colorVar: "primary",
    image: "/generated/categories/cat-painting-0x6aa2afb1.webp",
    description: {
      ar: "الدهانات الداخلية والخارجية، ورق الجدران، التشطيبات والديكورات الجدارية.",
      en: "Interior and exterior painting, wallpaper, finishes and wall décor.",
    },
    subcategories: [
      "دهانات داخلية",
      "دهانات خارجية",
      "ورق جدران",
      "تشطيبات جدارية",
      "ديكورات جدارية",
      "أعمال عزل",
    ],
  },
  "real-estate": {
    ar: "شركات عقارية",
    en: "Real Estate Companies",
    icon: "Building2",
    colorVar: "primary",
    image: "/generated/categories/cat-real-estate-0xb3722694.webp",
    description: {
      ar: "بيع وشراء وتأجير العقارات، الوساطة، إدارة الأملاك والتسويق العقاري.",
      en: "Buying, selling and renting property, brokerage, property management and marketing.",
    },
    subcategories: [
      "بيع",
      "شراء",
      "إيجار",
      "إدارة أملاك",
      "وساطة",
      "تسويق عقاري",
    ],
  },
  "real-estate-development": {
    ar: "شركات تطوير عقاري",
    en: "Real Estate Development",
    icon: "LandPlot",
    colorVar: "primary",
    image: "/generated/categories/cat-real-estate-development-0x0683fea3.webp",
    description: {
      ar: "تطوير المشاريع السكنية والتجارية: فلل، شقق، تاون هاوس ومجمعات سكنية.",
      en: "Residential and commercial development: villas, apartments, townhouses and compounds.",
    },
    subcategories: [
      "فلل",
      "شقق",
      "تاون هاوس",
      "مجمعات سكنية",
      "مشاريع تجارية",
      "مشاريع تحت الإنشاء",
    ],
  },
  insulation: {
    ar: "عزل",
    en: "Insulation",
    icon: "Layers",
    colorVar: "primary",
    image: "/generated/categories/cat-insulation-0x6f42b5a4.webp",
    description: {
      ar: "العزل المائي والحراري والصوتي للمباني والفلل، حماية المنزل من الرطوبة والحرارة وتوفير الطاقة.",
      en: "Waterproofing, thermal and acoustic insulation for buildings and villas, protecting homes from moisture and heat and saving energy.",
    },
    subcategories: [
      "عزل مائي",
      "عزل حراري",
      "عزل صوتي",
      "عزل أسطح",
      "عزل خزانات",
      "عزل بدرومات",
    ],
  },
  hvac: {
    ar: "تكييف وتبريد",
    en: "HVAC & Air Conditioning",
    icon: "AirVent",
    colorVar: "primary",
    image: "/generated/categories/cat-hvac-0xc4685ba8.webp",
    description: {
      ar: "تركيب وصيانة أنظمة التكييف المركزي والسبليت، التبريد والتهوية وتكييف المنازل والمباني.",
      en: "Installation and maintenance of central and split AC systems, cooling, ventilation and air conditioning for homes and buildings.",
    },
    subcategories: [
      "تكييف مركزي",
      "تكييف سبليت",
      "صيانة مكيفات",
      "أنظمة تبريد",
      "تهوية",
      "تركيب مكيفات",
    ],
  },
}

export const SAUDI_CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الظهران",
  "أبها",
  "الطائف",
  "تبوك",
  "بريدة",
  "حائل",
  "نجران",
  "جازان",
  "الأحساء",
  "ينبع",
] as const

export type SaudiCity = (typeof SAUDI_CITIES)[number]

/**
 * الخدمات المتاحة لكل تصنيف — تُشتق من التخصصات الفرعية لكل تصنيف
 * لتكون مصدراً موحداً يستخدمه نموذج التسجيل ومحرر الملف وفلترة البحث.
 */
export const SERVICE_OPTIONS: Record<Category, string[]> = Object.fromEntries(
  CATEGORIES.map((cat) => [cat, CATEGORY_META[cat].subcategories]),
) as Record<Category, string[]>

/* ============================================================
 * منصة الإدارة والنشر والإعلانات — أنواع الكيانات
 * كل التعديلات التي يقوم بها المعلن تمر عبر مركز الموافقات
 * ولا تُنشر مباشرة. صاحب الموقع والمديرون ينشرون مباشرة.
 * ============================================================ */

/** أماكن ظهور الإعلان/البنر في الموقع. */
export type AdPlacement =
  | "hero"
  | "mid-page"
  | "bottom"
  | "category-page"
  | "company-page"
  | "project-page"
  | "search-results"
  | "article"
  | "mobile"
  | "desktop"

export const AD_PLACEMENTS: { value: AdPlacement; ar: string; en: string }[] = [
  { value: "hero", ar: "الهيرو الرئيسي", en: "Hero" },
  { value: "mid-page", ar: "منتصف الصفحة", en: "Mid-page" },
  { value: "bottom", ar: "أسفل الصفحة", en: "Bottom" },
  { value: "category-page", ar: "صفحة التصنيف", en: "Category page" },
  { value: "company-page", ar: "صفحة الشركة", en: "Company page" },
  { value: "project-page", ar: "صفحة المشروع", en: "Project page" },
  { value: "search-results", ar: "نتائج البحث", en: "Search results" },
  { value: "article", ar: "داخل المقال", en: "Article" },
  { value: "mobile", ar: "الجوال", en: "Mobile" },
  { value: "desktop", ar: "سطح المكتب", en: "Desktop" },
]

/** نوع الإعلان. */
export type AdType = "banner" | "image" | "video" | "text"

export const AD_TYPES: { value: AdType; ar: string; en: string }[] = [
  { value: "banner", ar: "بنر", en: "Banner" },
  { value: "image", ar: "صورة", en: "Image" },
  { value: "video", ar: "فيديو", en: "Video" },
  { value: "text", ar: "نصي", en: "Text" },
]

/** دورة حياة المحتوى: مسودة ← قيد المراجعة ← معتمد ← منشور (أو مرفوض). */
export type PublishStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "active"
  | "paused"
  | "rejected"
  | "expired"
  | "published"

export const PUBLISH_STATUS_LABELS: Record<
  PublishStatus,
  { ar: string; en: string; tone: "draft" | "pending" | "ok" | "warn" | "bad" | "muted" }
> = {
  draft: { ar: "مسودة", en: "Draft", tone: "draft" },
  "pending-review": { ar: "قيد المراجعة", en: "Pending Review", tone: "pending" },
  approved: { ar: "معتمد", en: "Approved", tone: "ok" },
  active: { ar: "نشط", en: "Active", tone: "ok" },
  paused: { ar: "متوقف", en: "Paused", tone: "warn" },
  rejected: { ar: "مرفوض", en: "Rejected", tone: "bad" },
  expired: { ar: "منتهٍ", en: "Expired", tone: "muted" },
  published: { ar: "منشور", en: "Published", tone: "ok" },
}

/** جهاز الاستهداف. */
export type TargetDevice = "all" | "desktop" | "mobile" | "tablet"

export type Banner = {
  _id: string
  name: string
  advertiserId?: string
  companyId?: string
  desktopImage: string
  mobileImage?: string
  title: string
  description?: string
  ctaLabel?: string
  ctaUrl?: string
  placement: AdPlacement
  category?: string
  city?: string
  startDate?: string
  endDate?: string
  priority: number
  status: PublishStatus
  rejectionReason?: string
  views: number
  clicks: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type Campaign = {
  _id: string
  name: string
  advertiserId?: string
  companyId?: string
  type: AdType
  imageUrl?: string
  videoUrl?: string
  copyText?: string
  linkUrl?: string
  ctaLabel?: string
  placement: AdPlacement
  category?: string
  city?: string
  audience?: string
  devices: TargetDevice
  budget?: number
  startDate?: string
  endDate?: string
  status: PublishStatus
  rejectionReason?: string
  impressions: number
  clicks: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type Article = {
  _id: string
  title: string
  slug: string
  excerpt: string
  body: string
  coverImage?: string
  tags: string[]
  category?: string
  seoTitle?: string
  seoDescription?: string
  status: PublishStatus
  rejectionReason?: string
  authorId: string
  authorName: string
  featured: boolean
  publishedAt?: string
  views: number
  createdAt: string
  updatedAt: string
}

export type MediaContext =
  | "hero"
  | "section"
  | "company"
  | "project"
  | "category"
  | "article"
  | "banner"
  | "general"

export type MediaItem = {
  _id: string
  url: string
  name: string
  alt?: string
  mime: string
  width?: number
  height?: number
  size?: number
  context: MediaContext
  desktopUrl?: string
  mobileUrl?: string
  uploadedBy: string
  createdAt: string
}

/** نوع الكيان الذي طُلب تعديله — يحدّد مكان تطبيق التعديل عند الاعتماد. */
export type ChangeEntityType =
  | "company"
  | "company-project"
  | "banner"
  | "campaign"
  | "article"
  | "media"

export type ChangeFieldValue = string | number | boolean | string[] | null

export type ChangeRequest = {
  _id: string
  entityType: ChangeEntityType
  entityId: string
  entityName: string
  /** الشركة/السياق الذي ينتمي إليه التعديل. */
  companyId?: string
  advertiserId: string
  advertiserName: string
  /** قائمة التغييرات (حقل، قيمة قديمة، قيمة جديدة). */
  changes: Array<{
    field: string
    fieldLabel: string
    oldValue: ChangeFieldValue
    newValue: ChangeFieldValue
  }>
  /** للمشاريع/الكيانات الجديدة: الحمولة الكاملة المراد إضافتها. */
  payload?: Record<string, unknown>
  status: "pending" | "approved" | "rejected" | "changes-requested"
  rejectionReason?: string
  reviewerId?: string
  reviewerName?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type NotificationType =
  | "company-approved"
  | "company-rejected"
  | "ad-approved"
  | "ad-rejected"
  | "image-approved"
  | "change-rejected"
  | "campaign-ended"
  | "banner-expiring"
  | "post-published"
  | "post-failed"
  | "low-budget"
  | "change-requested"
  | "review-requested"

export type AppNotification = {
  _id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: string
}

export type AuditLog = {
  _id: string
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: string
  entityId?: string
  details?: string
  createdAt: string
}

/** مشروع مستقل (لمطوّري العقارات وغيرهم) — منفصل عن أعمال الشركات. */
export type PlatformProject = {
  _id: string
  title: string
  slug: string
  developerId?: string
  developerName?: string
  description: string
  imageUrl: string
  gallery?: string[]
  city?: string
  district?: string
  category?: string
  status: "off-plan" | "under-construction" | "ready" | "sold-out"
  priceFrom?: number
  units?: string
  handoverDate?: string
  publishStatus: PublishStatus
  rejectionReason?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/* ---- البريد الإلكتروني ---- */
export type EmailSegment =
  | "customers"
  | "companies"
  | "advertisers"
  | "real-estate-interest"
  | "furniture-interest"
  | "design-interest"
  | "by-city"

export const EMAIL_SEGMENTS: { value: EmailSegment; ar: string; en: string }[] = [
  { value: "customers", ar: "العملاء", en: "Customers" },
  { value: "companies", ar: "الشركات", en: "Companies" },
  { value: "advertisers", ar: "المعلنون", en: "Advertisers" },
  { value: "real-estate-interest", ar: "المهتمون بالعقار", en: "Real estate interest" },
  { value: "furniture-interest", ar: "المهتمون بالأثاث", en: "Furniture interest" },
  { value: "design-interest", ar: "المهتمون بالتصميم", en: "Design interest" },
  { value: "by-city", ar: "حسب المدينة", en: "By city" },
]

export type EmailList = {
  _id: string
  name: string
  segment: EmailSegment
  subscriberCount: number
  createdAt: string
}

export type EmailSubscriber = {
  _id: string
  listId: string
  email: string
  name?: string
  city?: string
  segment: EmailSegment
  status: "active" | "unsubscribed"
  createdAt: string
}

export type EmailCampaign = {
  _id: string
  name: string
  subject: string
  preheader?: string
  body: string
  listId?: string
  segment?: EmailSegment
  status: "draft" | "scheduled" | "sent" | "failed"
  scheduledAt?: string
  sentAt?: string
  opens: number
  clicks: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

/* ---- النشر الاجتماعي ---- */
export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "pinterest"

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform
  ar: string
  en: string
}[] = [
  { value: "instagram", ar: "إنستغرام", en: "Instagram" },
  { value: "facebook", ar: "فيسبوك", en: "Facebook" },
  { value: "linkedin", ar: "لينكدإن", en: "LinkedIn" },
  { value: "x", ar: "إكس", en: "X" },
  { value: "tiktok", ar: "تيك توك", en: "TikTok" },
  { value: "youtube", ar: "يوتيوب", en: "YouTube" },
  { value: "pinterest", ar: "بنترست", en: "Pinterest" },
]

export type SocialPostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "partial"

export type SocialPost = {
  _id: string
  content: string
  platforms: SocialPlatform[]
  mediaUrls: string[]
  /** نص مخصص لكل منصة (اختياري). */
  perPlatformText?: Partial<Record<SocialPlatform, string>>
  scheduledAt?: string
  status: SocialPostStatus
  /** حالة النشر لكل منصة على حدة. */
  perPlatformStatus?: Partial<
    Record<SocialPlatform, "pending" | "published" | "failed">
  >
  failureReason?: string
  createdBy: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

/* ---- التكاملات الخارجية ---- */
export type IntegrationProvider =
  | "google-analytics"
  | "google-ads"
  | "google-adsense"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "email-smtp"

export type Integration = {
  _id: string
  provider: IntegrationProvider
  /** connected / disconnected — لا تُخزّن أي مفاتيح هنا. */
  status: "connected" | "disconnected"
  accountLabel?: string
  /** معرّف المورد في الخدمة (مثل GA4 property) إن وُجد. */
  resourceRef?: string
  connectedAt?: string
  updatedAt: string
}

/** موضع إعلان AdSense قابل للإدارة. */
export type AdSenseSlot = {
  _id: string
  name: string
  /** داخل المقال / بين الأقسام / Sidebar / أسفل المقال / نتائج المحتوى / مخصص. */
  location: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}
