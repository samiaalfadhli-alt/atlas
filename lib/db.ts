import "server-only"

import { ObjectId, type Collection, type Db, type Filter } from "mongodb"

import { getMongoDb } from "@/lib/mongodb"
import {
  type AdSenseSlot,
  type Article,
  type AppNotification,
  type AuditLog,
  type Banner,
  type Campaign,
  type ChangeRequest,
  type Company,
  type EmailCampaign,
  type EmailList,
  type EmailSubscriber,
  type Integration,
  type MediaItem,
  type PlatformProject,
  type Review,
  type SocialPost,
  type User,
} from "@/lib/types"
import { hashPassword } from "@/lib/auth"

export const COL = {
  users: "users",
  companies: "companies",
  reviews: "reviews",
  banners: "banners",
  campaigns: "campaigns",
  articles: "articles",
  media: "media",
  changeRequests: "change_requests",
  notifications: "notifications",
  auditLogs: "audit_logs",
  projects: "projects",
  emailLists: "email_lists",
  emailSubscribers: "email_subscribers",
  emailCampaigns: "email_campaigns",
  socialPosts: "social_posts",
  integrations: "integrations",
  adsenseSlots: "adsense_slots",
} as const

function usersCol(db: Db): Collection<User> {
  return db.collection<User>(COL.users)
}
function companiesCol(db: Db): Collection<Company> {
  return db.collection<Company>(COL.companies)
}
function reviewsCol(db: Db): Collection<Review> {
  return db.collection<Review>(COL.reviews)
}
function bannersCol(db: Db): Collection<Banner> {
  return db.collection<Banner>(COL.banners)
}
function campaignsCol(db: Db): Collection<Campaign> {
  return db.collection<Campaign>(COL.campaigns)
}
function articlesCol(db: Db): Collection<Article> {
  return db.collection<Article>(COL.articles)
}
function mediaCol(db: Db): Collection<MediaItem> {
  return db.collection<MediaItem>(COL.media)
}
function changeRequestsCol(db: Db): Collection<ChangeRequest> {
  return db.collection<ChangeRequest>(COL.changeRequests)
}
function notificationsCol(db: Db): Collection<AppNotification> {
  return db.collection<AppNotification>(COL.notifications)
}
function auditLogsCol(db: Db): Collection<AuditLog> {
  return db.collection<AuditLog>(COL.auditLogs)
}
function projectsCol(db: Db): Collection<PlatformProject> {
  return db.collection<PlatformProject>(COL.projects)
}
function emailListsCol(db: Db): Collection<EmailList> {
  return db.collection<EmailList>(COL.emailLists)
}
function emailSubscribersCol(db: Db): Collection<EmailSubscriber> {
  return db.collection<EmailSubscriber>(COL.emailSubscribers)
}
function emailCampaignsCol(db: Db): Collection<EmailCampaign> {
  return db.collection<EmailCampaign>(COL.emailCampaigns)
}
function socialPostsCol(db: Db): Collection<SocialPost> {
  return db.collection<SocialPost>(COL.socialPosts)
}
function integrationsCol(db: Db): Collection<Integration> {
  return db.collection<Integration>(COL.integrations)
}
function adsenseSlotsCol(db: Db): Collection<AdSenseSlot> {
  return db.collection<AdSenseSlot>(COL.adsenseSlots)
}

export async function getCollections() {
  const db = await getMongoDb()
  return {
    db,
    users: usersCol(db),
    companies: companiesCol(db),
    reviews: reviewsCol(db),
    banners: bannersCol(db),
    campaigns: campaignsCol(db),
    articles: articlesCol(db),
    media: mediaCol(db),
    changeRequests: changeRequestsCol(db),
    notifications: notificationsCol(db),
    auditLogs: auditLogsCol(db),
    projects: projectsCol(db),
    emailLists: emailListsCol(db),
    emailSubscribers: emailSubscribersCol(db),
    emailCampaigns: emailCampaignsCol(db),
    socialPosts: socialPostsCol(db),
    integrations: integrationsCol(db),
    adsenseSlots: adsenseSlotsCol(db),
  }
}

export async function ensureIndexes() {
  const {
    users,
    companies,
    reviews,
    banners,
    campaigns,
    articles,
    media,
    changeRequests,
    notifications,
    auditLogs,
    projects,
    emailLists,
    emailSubscribers,
    emailCampaigns,
    socialPosts,
    integrations,
    adsenseSlots,
  } = await getCollections()
  await Promise.all([
    users.createIndex({ email: 1 }, { unique: true }),
    companies.createIndex({ slug: 1 }, { unique: true }),
    companies.createIndex({ category: 1, status: 1 }),
    companies.createIndex({ city: 1, status: 1 }),
    companies.createIndex({ featured: 1, status: 1 }),
    reviews.createIndex({ companyId: 1, createdAt: -1 }),
    banners.createIndex({ status: 1, placement: 1, priority: -1 }),
    banners.createIndex({ advertiserId: 1, createdAt: -1 }),
    campaigns.createIndex({ status: 1, placement: 1 }),
    campaigns.createIndex({ advertiserId: 1, createdAt: -1 }),
    articles.createIndex({ slug: 1 }, { unique: true }),
    articles.createIndex({ status: 1, publishedAt: -1 }),
    media.createIndex({ context: 1, createdAt: -1 }),
    changeRequests.createIndex({ status: 1, createdAt: -1 }),
    changeRequests.createIndex({ advertiserId: 1, status: 1 }),
    notifications.createIndex({ userId: 1, read: 1, createdAt: -1 }),
    auditLogs.createIndex({ createdAt: -1 }),
    auditLogs.createIndex({ actorId: 1, createdAt: -1 }),
    projects.createIndex({ slug: 1 }, { unique: true }),
    projects.createIndex({ publishStatus: 1, createdAt: -1 }),
    emailLists.createIndex({ name: 1 }),
    emailSubscribers.createIndex({ listId: 1, email: 1 }, { unique: true }),
    emailSubscribers.createIndex({ segment: 1, status: 1 }),
    emailCampaigns.createIndex({ status: 1, scheduledAt: 1 }),
    socialPosts.createIndex({ status: 1, scheduledAt: 1 }),
    integrations.createIndex({ provider: 1 }, { unique: true }),
    adsenseSlots.createIndex({ location: 1 }),
  ])
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function newId(): string {
  return new ObjectId().toString()
}

export function projectImage(seed: string, w = 800, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

const SEED_COMPANIES: Array<
  Omit<Company, "_id" | "createdAt" | "updatedAt" | "rating" | "reviewCount">
> = [
  {
    name: "شركة البناء الحديث",
    nameEn: "Al Binaa Al Hadith",
    slug: "al-binaa-al-hadith",
    category: "contractor",
    tagline: "نبني بيوتاً تدوم أجيالاً",
    description:
      "شركة سعودية متخصصة في تنفيذ مشاريع البناء السكني والتجاري بأيدي هندسية وكوادر فنية مدربة، نلتزم بالمواعيد والمواصفات ونستخدم أحدث التقنيات في صب الخرسانة وأعمال العزل.",
    city: "الرياض",
    district: "حي النرجس",
    services: ["بناء فلل", "بناء عمائر", "أعمال خرسانية", "إدارة مشاريع"],
    phone: "0551234567",
    email: "info@albinaahadith.sa",
    website: "https://albinaahadith.sa",
    establishedYear: "2009",
    teamSize: "120+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("binaa-cover", 1200, 500),
    projectCount: 3,
    portfolio: [
      {
        id: newId(),
        title: "فيلا حي النرجس",
        description: "فيلا سكنية بمساحة ٦٠٠ متر مربع بتشطيب فاخر وحديقة خارجية.",
        imageUrl: projectImage("binaa-villa-narjis"),
        location: "الرياض - حي النرجس",
        year: "2023",
        category: "سكني",
      },
      {
        id: newId(),
        title: "عمارة سكنية متعددة الأدوار",
        description: "مبنى من ثمانية أدوار ب٤٨ وحدة سكنية بتصميم عصري.",
        imageUrl: projectImage("binaa-tower"),
        location: "الرياض - حي الياسمين",
        year: "2022",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مجمع تجاري",
        description: "مجمع محلات تجارية بمسطحات مرنة ومواقف مغطاة.",
        imageUrl: projectImage("binaa-mall"),
        location: "الرياض - طريق الملك فهد",
        year: "2024",
        category: "تجاري",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "مؤسسة الإعمار للمقاولات",
    nameEn: "Al Imaar Contracting",
    slug: "al-imaar-contracting",
    category: "contractor",
    tagline: "دقة في التنفيذ وثقة في المواعيد",
    description:
      "مؤسسة مقاولات متكاملة تقدم خدمات البناء والتشطيب والترميم بخبرة تتجاوز خمسة عشر عاماً، ونفّذنا مئات المشاريع السكنية والإدارية في مختلف مناطق المملكة.",
    city: "جدة",
    district: "حي الشاطئ",
    services: ["بناء فلل", "تشطيبات", "ترميم", "إدارة مشاريع"],
    phone: "0552345678",
    email: "info@alimaar.sa",
    website: "https://alimaar.sa",
    establishedYear: "2010",
    teamSize: "85+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("imaar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "فلل الشاطئ الذكية",
        description: "ثلاث فلل متصلة بأنظمة منزل ذكي وتشطيب راقٍ.",
        imageUrl: projectImage("imaar-shati"),
        location: "جدة - حي الشاطئ",
        year: "2023",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مبنى إداري",
        description: "مبنى إداري من أربعة أدوار بتشطيب خارجي حجري.",
        imageUrl: projectImage("imaar-office"),
        location: "جدة - حي الروضة",
        year: "2021",
        category: "إداري",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "شركة ركائز البناء",
    nameEn: "Rukaiz Building",
    slug: "rukaiz-building",
    category: "contractor",
    tagline: "أساسات راسخة لمشاريعك",
    description:
      "متخصصون في أعمال الأساسات والخرسانة الجاهزة والهياكل الإنشائية للمشاريع الكبرى، مع فريق هندسي يضمن الجودة والاستدامة في كل مرحلة.",
    city: "الدمام",
    district: "حي الفيصلية",
    services: ["أعمال خرسانية", "بناء عمائر", "بناء فلل"],
    phone: "0553456789",
    email: "info@rukaiz.sa",
    establishedYear: "2014",
    teamSize: "60+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("rukaiz-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "برج تجاري",
        description: "هيكل خرساني لبرج تجاري من اثني عشر دوراً.",
        imageUrl: projectImage("rukaiz-tower"),
        location: "الدمام - الكورنيش",
        year: "2024",
        category: "تجاري",
      },
      {
        id: newId(),
        title: "مجمع سكني",
        description: "تنفيذ أساسات مجمع سكني من عشرين فيلا.",
        imageUrl: projectImage("rukaiz-compound"),
        location: "الخبر - حي العقربية",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  {
    name: "استوديو لمسة تصميم",
    nameEn: "Lamsa Design Studio",
    slug: "lamsa-design-studio",
    category: "interior-designer",
    tagline: "نحوّل المساحات إلى تجارب",
    description:
      "استوديو تصميم داخلي متخصص في المساحات السكنية والتجارية، نقدّم حلولاً إبداعية تجمع بين الجمال والوظيفة مع مراعاة الهوية السعودية العصرية.",
    city: "الرياض",
    district: "حي العليا",
    services: ["تصميم داخلي سكني", "تصميم تجاري", "تشطيبات داخلية", "تجهيز مكاتب"],
    phone: "0554567890",
    email: "info@lamsadesign.sa",
    website: "https://lamsadesign.sa",
    establishedYear: "2016",
    teamSize: "24+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("lamsa-cover", 1200, 500),
    projectCount: 3,
    portfolio: [
      {
        id: newId(),
        title: "شقة عصرية بحي العليا",
        description: "تصميم داخلي لشقة بمساحة ٢٢٠ متراً بطابع مينيمالي دافئ.",
        imageUrl: projectImage("lamsa-apartment"),
        location: "الرياض - حي العليا",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مكتب شركة تقنية",
        description: "تجهيز مكتب بمساحة ٤٠٠ متر بمساحات عمل مفتوحة وقاعات اجتماعات.",
        imageUrl: projectImage("lamsa-office"),
        location: "الرياض - طريق الملك فهد",
        year: "2023",
        category: "تجاري",
      },
      {
        id: newId(),
        title: "استقبال فيلا",
        description: "تصميم ريسبشن بأسقف جبسية وإضاءة ديكورية مميزة.",
        imageUrl: projectImage("lamsa-recep"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "ديكور البيت الأنيق",
    nameEn: "Albayt Alaniq Decor",
    slug: "albayt-alaniq-decor",
    category: "interior-designer",
    tagline: "أناقة تليق بمنزلك",
    description:
      "متخصصون في أعمال الديكور والتشطيبات الداخلية والجبس والأثاث، نحوّل المساحات الفارغة إلى بيئات متناسقة تعكس ذوقك الخاص.",
    city: "جدة",
    district: "حي السلامة",
    services: ["تشطيبات داخلية", "ديكورات جبسية", "استشارات ألوان", "تصميم داخلي سكني"],
    phone: "0555678901",
    email: "info@albayanitaq.sa",
    establishedYear: "2018",
    teamSize: "18+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("aniq-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "غرفة معيشة",
        description: "تشطيب جبسي وإضاءة لغرفة معيشة بنمط كلاسيكي حديث.",
        imageUrl: projectImage("aniq-living"),
        location: "جدة - حي السلامة",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مطعم فاخر",
        description: "تصميم وتنفيذ ديكور مطعم بطابع شرقي عصري.",
        imageUrl: projectImage("aniq-restaurant"),
        location: "جدة - الكورنيش",
        year: "2023",
        category: "تجاري",
      },
    ],
    featured: false,
    verified: true,
  },
  {
    name: "مساحة للتصميم الداخلي",
    nameEn: "Masaaha Interior",
    slug: "masaaha-interior",
    category: "interior-designer",
    tagline: "تصميم بمعنى",
    description:
      "استوديو تصميم داخلي يركز على المساحات التجارية والمكاتب والضيافة، نقدّم تصاميم متكاملة من الفكرة حتى التنفيذ مع إدارة جودة صارمة.",
    city: "الخبر",
    district: "حي الثقبة",
    services: ["تصميم تجاري", "تشطيبات داخلية", "تجهيز مكاتب", "تصميم داخلي سكني"],
    phone: "0556789012",
    email: "info@masaaha.sa",
    website: "https://masaaha.sa",
    establishedYear: "2019",
    teamSize: "15+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("masaaha-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مقهى متخصص",
        description: "تصميم داخلي لمقهى بمساحة ١٨٠ متراً بأجواء دافئة.",
        imageUrl: projectImage("masaaha-cafe"),
        location: "الخبر - حي الثقبة",
        year: "2024",
        category: "تجاري",
      },
      {
        id: newId(),
        title: "عيادة طبية",
        description: "تجهيز عيادة بتصميم هادئ ومواد صحية مناسبة.",
        imageUrl: projectImage("masaaha-clinic"),
        location: "الدمام - حي الفيصلية",
        year: "2023",
        category: "تجاري",
      },
    ],
    featured: false,
    verified: true,
  },
  {
    name: "مكتب الرواد الهندسي",
    nameEn: "Al Ruwad Engineering",
    slug: "al-ruwad-engineering",
    category: "architect",
    tagline: "هندسةٌ تبنى الثقة",
    description:
      "مكتب استشاري هندسي معتمد يقدم خدمات التصميم المعماري والإنشائي والإشراف على التنفيذ، مع خبرة في إصدار الرخص واعتماد الرسومات البلدية.",
    city: "الرياض",
    district: "حي الملقا",
    services: ["تصميم معماري", "مخططات معمارية", "استشارات معمارية", "تصميم فلل"],
    phone: "0557890123",
    email: "info@ruwad-eng.sa",
    website: "https://ruwad-eng.sa",
    establishedYear: "2012",
    teamSize: "32+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("ruwad-cover", 1200, 500),
    projectCount: 3,
    portfolio: [
      {
        id: newId(),
        title: "تصميم مجمع سكني",
        description: "تصاميم معمارية وإنشائية لمجمع من عشر فلل متناسقة.",
        imageUrl: projectImage("ruwad-compound"),
        location: "الرياض - حي الملقا",
        year: "2024",
        category: "تصميم",
      },
      {
        id: newId(),
        title: "إشراف برج إداري",
        description: "إشراف هندسي كامل على تنفيذ برج إداري.",
        imageUrl: projectImage("ruwad-supervise"),
        location: "الرياض - العليا",
        year: "2023",
        category: "إشراف",
      },
      {
        id: newId(),
        title: "اعتماد رخصة بناء",
        description: "إصدار رخصة بناء وتجهيز المخططات البلدية لفيلا.",
        imageUrl: projectImage("ruwad-permit"),
        location: "الرياض - حي النرجس",
        year: "2024",
        category: "رخص",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "مكاتب التقنية الهندسية",
    nameEn: "Engineering Tech Offices",
    slug: "engineering-tech-offices",
    category: "architect",
    tagline: "حلول هندسية متكاملة",
    description:
      "نقدم خدمات التصميم الإنشائي وأنظمة MEP والدراسات الهندسية للمشاريع السكنية والتجارية، مع فريق متخصص في الاستدامة وكفاءة الطاقة.",
    city: "الدمام",
    district: "حي الجلوية",
    services: ["استشارات معمارية", "تصميم مباني", "تصميم معماري", "مخططات معمارية"],
    phone: "0558901234",
    email: "info@engtech.sa",
    establishedYear: "2015",
    teamSize: "28+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("engtech-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "تصميم أنظمة MEP",
        description: "تصميم أنظمة كهرباء وإنارة وتكييف لمبنى تجاري.",
        imageUrl: projectImage("engtech-mep"),
        location: "الدمام - الكورنيش",
        year: "2024",
        category: "تصميم",
      },
      {
        id: newId(),
        title: "دراسة جدوى",
        description: "دراسة هندسية واقتصادية لمشروع برج سكني.",
        imageUrl: projectImage("engtech-study"),
        location: "الخبر - حي العقربية",
        year: "2023",
        category: "دراسات",
      },
    ],
    featured: false,
    verified: true,
  },
  {
    name: "مكتب الإحسان للاستشارات",
    nameEn: "Al Ihsan Consulting",
    slug: "al-ihsan-consulting",
    category: "architect",
    tagline: "استشارات هندسية موثوقة",
    description:
      "مكتب استشاري متخصص في الدراسات والتصاميم المعمارية والإشراف على المشاريع، مع التركيز على جودة التنفيذ والالتزام بالأنظمة السعودية للبناء.",
    city: "أبها",
    district: "حي المروج",
    services: ["تصميم معماري", "تصميم فلل", "استشارات معمارية", "مخططات معمارية"],
    phone: "0559012345",
    email: "info@ihsan-eng.sa",
    establishedYear: "2017",
    teamSize: "20+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("ihsan-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "منتجع جبلي",
        description: "تصميم معماري لمنتجع يواكب طبيعة عسير.",
        imageUrl: projectImage("ihsan-resort"),
        location: "أبها - السودة",
        year: "2024",
        category: "تصميم",
      },
      {
        id: newId(),
        title: "فيلا حديثة",
        description: "تصميم وإشراف على فيلا بمعايير استدامة.",
        imageUrl: projectImage("ihsan-villa"),
        location: "أبها - حي المروج",
        year: "2023",
        category: "تصميم",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- أثاث ----
  {
    name: "مصنع مجالس الأصالة",
    nameEn: "Al Asala Majlis",
    slug: "al-asala-majlis",
    category: "furniture",
    tagline: "مجالس وقفٌ أصيل ولمسة عصرية",
    description:
      "مصنع سعودي متخصص في صناعة المجالس والكنب وغرف النوم بأيدي حرفيين مهرة، نمزج بين الأصالة السعودية والتصميم العصري ونقدّم قطعاً مخصصة تناسب مساحاتك.",
    city: "الرياض",
    district: "حي السلي",
    services: ["مجالس", "غرف نوم", "قطع مخصصة"],
    phone: "0531122334",
    email: "info@alasala-majlis.sa",
    website: "https://alasala-majlis.sa",
    establishedYear: "2011",
    teamSize: "70+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("asala-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مجلس ضيافة فاخر",
        description: "مجلس بكراسي منجدّة وقماش مخمل وأطراف خشب زان.",
        imageUrl: projectImage("asala-majlis"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "غرفة نوم كاملة",
        description: "طقم غرفة نوم بتصميم عصري وخامات متينة.",
        imageUrl: projectImage("asala-bedroom"),
        location: "الرياض - حي الياسمين",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "أثاث نوار",
    nameEn: "Nawar Furniture",
    slug: "nawar-furniture",
    category: "furniture",
    tagline: "أثاث يحكي ذوقك",
    description:
      "علامة أثاث عصرية تقدّم الصالات والمكاتب والقطع المخصصة بتصاميم بسيطة وأنيقة، مع حرص على جودة الخامات وتفاصيل التنفيذ التي تدوم.",
    city: "جدة",
    district: "حي الروضة",
    services: ["صالات", "مكاتب", "قطع مخصصة"],
    phone: "0532233445",
    email: "info@nawar-furniture.sa",
    establishedYear: "2019",
    teamSize: "22+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("nawar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "صالة معيشة مفتوحة",
        description: "طقم صالة بألوان محايدة وخامات قماشية ناعمة.",
        imageUrl: projectImage("nawar-living"),
        location: "جدة - حي الروضة",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مكتب منزلي",
        description: "مكتب ومكتبة بتصميم مينيمالي عملي.",
        imageUrl: projectImage("nawar-office"),
        location: "جدة - حي الشاطئ",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- حدائق وتنسيق خارجي ----
  {
    name: "حدائق الواحة",
    nameEn: "Al Waha Gardens",
    slug: "al-waha-gardens",
    category: "landscaping",
    tagline: "لحديقتك روحٌ نعتني بها",
    description:
      "متخصصون في تصميم وتنفيذ الحدائق السكنية والتجارية، نقدّم حلول تنسيق خارجي متكاملة تشمل الزراعة وشبكات الري والإضاءة الخارجية والجلسات الخضراء.",
    city: "الرياض",
    district: "حي الدار البيضاء",
    services: ["تصميم حدائق", "تنسيق خارجي", "شبكات ري"],
    phone: "0533344556",
    email: "info@alwaha-gardens.sa",
    website: "https://alwaha-gardens.sa",
    establishedYear: "2013",
    teamSize: "40+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("waha-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "حديقة فيلا حي حطين",
        description: "حديقة بمساحة ٣٠٠ متر بنباتات ظل وممرات حجرية.",
        imageUrl: projectImage("waha-villa-garden"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "جلسات خارجية لمجلس",
        description: "تنسيق جلسات خارجية مظللة بأشجار وشبكة ري ذكية.",
        imageUrl: projectImage("waha-majlis"),
        location: "الرياض - حي الملقا",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "بيت الشجر لتنسيق الحدائق",
    nameEn: "Bait Al Shajar",
    slug: "bait-al-shajar",
    category: "landscaping",
    tagline: "مساحات خضراء تتنفّس",
    description:
      "شركة تنسيق حدائق متخصصة في تصميم المسابح والجلسات الخارجية والزراعة الموسمية، نحوّل الفراغات الخارجية إلى واحات تجمع بين الجمال والاستدامة.",
    city: "الخبر",
    district: "حي العقربية",
    services: ["تصميم حدائق", "مسابح", "جلسات خارجية"],
    phone: "0534455667",
    email: "info@baitalshajar.sa",
    establishedYear: "2016",
    teamSize: "30+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("shajar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مسبح فيلا",
        description: "تصميم وتنفيذ مسبح مع شلال وتشطيب فاخر.",
        imageUrl: projectImage("shajar-pool"),
        location: "الخبر - حي العقربية",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "حديقة جبلية",
        description: "تنسيق حديقة بنباتات تتحمّل الحرارة وإضاءة خارجية.",
        imageUrl: projectImage("shajar-garden"),
        location: "الدمام - حي الفيصلية",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- إضاءة ----
  {
    name: "نور للإنارة الذكية",
    nameEn: "Noor Smart Lighting",
    slug: "noor-smart-lighting",
    category: "lighting",
    tagline: "إضاءة تُضيء لحظاتك",
    description:
      "متخصصون في حلول الإنارة الذكية للمنشآت السكنية والتجارية، نقدّم تصميم أنظمة إضاءة داخلية وخارجية مع تحكّم عبر التطبيق ودراسات إضاءة احترافية.",
    city: "الرياض",
    district: "حي قرطبة",
    services: ["إنارة ذكية", "إضاءة داخلية", "حلول إضاءة"],
    phone: "0535566778",
    email: "info@noor-lighting.sa",
    website: "https://noor-lighting.sa",
    establishedYear: "2017",
    teamSize: "26+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("noor-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "إضاءة فيلا ذكية",
        description: "نظام إنارة ذكي يتحكّم في الأجواء لكل غرفة.",
        imageUrl: projectImage("noor-villa"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "إضاءة مكتب تجاري",
        description: "حلول إضاءة موفّرة للطاقة لمكتب بمساحة ٦٠٠ متر.",
        imageUrl: projectImage("noor-office"),
        location: "الرياض - طريق الملك فهد",
        year: "2023",
        category: "تجاري",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "ثريات الفنار",
    nameEn: "Al Fannar Chandeliers",
    slug: "al-fannar-chandeliers",
    category: "lighting",
    tagline: "إضاءة تزدان بالفخامة",
    description:
      "متجر متخصص في الثريات والإنارة الديكورية الداخلية والخارجية، نقدّم قطعاً فاخرة مستوردة ومصنوعة محلياً مع خدمة تركيب وصيانة احترافية.",
    city: "جدة",
    district: "حي السلامة",
    services: ["ثريات", "إضاءة داخلية", "إضاءة خارجية"],
    phone: "0536677889",
    email: "info@alfannar-light.sa",
    establishedYear: "2014",
    teamSize: "16+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("fannar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "ثريا مجلس رئيسي",
        description: "ثريا كريستال ضخمة لسقف مجلس بارتفاع ٦ أمتار.",
        imageUrl: projectImage("fannar-chandelier"),
        location: "جدة - حي الشاطئ",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "إضاءة واجهة فيلا",
        description: "إنارة خارجية معمارية تبرز تفاصيل الواجهة.",
        imageUrl: projectImage("fannar-facade"),
        location: "جدة - حي الروضة",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- مطابخ ----
  {
    name: "مطابخ الروافد",
    nameEn: "Al Rawafid Kitchens",
    slug: "al-rawafid-kitchens",
    category: "kitchens",
    tagline: "مطابخ صُمّمت لتدوم",
    description:
      "متخصصون في تصميم وتنفيذ المطابخ المخصصة والخزائن والأسطح، نستخدم خامات عالية الجودة وأجهزة مدمجة مع حرص على أدق تفاصيل التركيب والصيانة.",
    city: "الرياض",
    district: "حي النرجس",
    services: ["مطابخ مخصصة", "خزائن", "أسطح"],
    phone: "0537788990",
    email: "info@rawafid-kitchens.sa",
    website: "https://rawafid-kitchens.sa",
    establishedYear: "2015",
    teamSize: "34+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("rawafid-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مطبخ جزيرة عصري",
        description: "مطبخ بجزيرة وسطح كوارتز وخزائن بدون مقابض.",
        imageUrl: projectImage("rawafid-modern"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مطبخ كلاسيكي",
        description: "مطبخ بخزائن خشبية وفرن مدمج بلمسة كلاسيكية.",
        imageUrl: projectImage("rawafid-classic"),
        location: "الرياض - حي الياسمين",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "مطابخ البيت العصري",
    nameEn: "Al Asri Kitchens",
    slug: "al-asri-kitchens",
    category: "kitchens",
    tagline: "مطبخك جاهز بأسبوع",
    description:
      "نقدّم المطابخ الجاهزة بتصاميم مرنة وأسعار تنافسية مع خدمة تصميم وتركيب وصيانة سريعة، مناسبة للشقق والفلل بأحجام مختلفة.",
    city: "الدمام",
    district: "حي الفيصلية",
    services: ["مطابخ جاهزة", "تصميم مطابخ", "تركيب وصيانة"],
    phone: "0538899001",
    email: "info@alasri-kitchens.sa",
    establishedYear: "2020",
    teamSize: "18+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("asri-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مطبخ شقة",
        description: "مطبخ جاهز بتصميم عملي لمساحة ١٢ متراً.",
        imageUrl: projectImage("asri-apartment"),
        location: "الدمام - حي الفيصلية",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "مطبخ مفتوح",
        description: "مطبخ مفتوح على الصالة بأسطح متينة.",
        imageUrl: projectImage("asri-open"),
        location: "الخبر - حي الثقبة",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- دهانات ----
  {
    name: "دهانات الإتقان",
    nameEn: "Al Itqan Painting",
    slug: "al-itqan-painting",
    category: "painting",
    tagline: "تشطيبٌ يُرفع عنه الحجاب",
    description:
      "شركة دهانات متخصصة في الأعمال الداخلية والخارجية والديكورات الجدارية، نستخدم دهانات عالية الجودة ومقاومة للرطوبة مع فريق محترف يلتزم بالمواعيد.",
    city: "الرياض",
    district: "حي العليا",
    services: ["دهانات داخلية", "دهانات خارجية", "ديكورات جدارية"],
    phone: "0539900112",
    email: "info@itqan-painting.sa",
    website: "https://itqan-painting.sa",
    establishedYear: "2013",
    teamSize: "45+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("itqan-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "دهانات صالة معيشة",
        description: "تشطيب داخلي بألوان دافئة ولمسات ديكورية.",
        imageUrl: projectImage("itqan-living"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "دهانات واجهة فيلا",
        description: "دهان خارجي مقاوم للعوامل الجوية بلمسة معمارية.",
        imageUrl: projectImage("itqan-facade"),
        location: "الرياض - حي النرجس",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "ورق جدران وديكور لمسة",
    nameEn: "Lamsa Wallpaper & Decor",
    slug: "lamsa-wallpaper",
    category: "painting",
    tagline: "جدرانٌ بلمسة فنية",
    description:
      "متخصصون في تركيب ورق الجدران والتشطيبات الجدارية والديكورات الإبداعية، نقدّم تشكيلة واسعة من الخامات والأنماط تناسب الذوق الكلاسيكي والعصري.",
    city: "جدة",
    district: "حي الروضة",
    services: ["ورق جدران", "ديكورات جدارية", "تشطيبات جدارية"],
    phone: "0531011223",
    email: "info@lamsa-wallpaper.sa",
    establishedYear: "2018",
    teamSize: "14+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("lamsawall-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "جدار مميّز لغرفة نوم",
        description: "ورق جدران بتصميم هادئ يبرز رأس السرير.",
        imageUrl: projectImage("lamsawall-bedroom"),
        location: "جدة - حي الروضة",
        year: "2024",
        category: "سكني",
      },
      {
        id: newId(),
        title: "ديكور جداري لمجلس",
        description: "تشطيب جداري بلمسة ذهبية تليق بالمجلس.",
        imageUrl: projectImage("lamsawall-majlis"),
        location: "جدة - حي الشاطئ",
        year: "2023",
        category: "سكني",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- شركات عقارية ----
  {
    name: "دار العقارية",
    nameEn: "Dar Real Estate",
    slug: "dar-real-estate",
    category: "real-estate",
    tagline: "قرارك العقاري يبدأ من هنا",
    description:
      "شركة عقارية متكاملة تقدّم خدمات البيع والشراء والتأجير وإدارة الأملاك في مختلف مدن المملكة، مع فريق وساطة مدرّب وقاعدة عملاء واسعة.",
    city: "الرياض",
    district: "حي العليا",
    services: ["بيع", "شراء", "إيجار", "إدارة أملاك"],
    phone: "0532122334",
    email: "info@dar-realestate.sa",
    website: "https://dar-realestate.sa",
    establishedYear: "2008",
    teamSize: "90+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("dar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "فيلا للبيع بحي حطين",
        description: "فيلا بتشطيب فاخر ومسبح وحديقة.",
        imageUrl: projectImage("dar-villa"),
        location: "الرياض - حي حطين",
        year: "2024",
        category: "بيع",
      },
      {
        id: newId(),
        title: "شقق للإيجار",
        description: "إدارة محفظة شقق سكنية للإيجار السنوي.",
        imageUrl: projectImage("dar-apartments"),
        location: "الرياض - حي العليا",
        year: "2023",
        category: "إيجار",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "الوسيط العقاري",
    nameEn: "Al Waseet Real Estate",
    slug: "al-waseet-real-estate",
    category: "real-estate",
    tagline: "وساطةٌ بثقة وتسويق عقاري",
    description:
      "مكتب وساطة عقارية متخصص في التسويق العقاري وإتمام صفقات البيع والإيجار، نقدّم استشارات تسعير وحملات تسويق احترافية للعقارات السكنية والتجارية.",
    city: "جدة",
    district: "حي الروضة",
    services: ["وساطة", "تسويق عقاري", "بيع", "إيجار"],
    phone: "0533233445",
    email: "info@alwaseet-re.sa",
    establishedYear: "2014",
    teamSize: "38+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("waseet-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "حملة تسويق مجمع سكني",
        description: "تسويق وإتمام بيع وحدات مجمع سكني خلال ٣ أشهر.",
        imageUrl: projectImage("waseet-campaign"),
        location: "جدة - حي الشاطئ",
        year: "2024",
        category: "تسويق",
      },
      {
        id: newId(),
        title: "وساطة بيع فيلا",
        description: "وساطة وتثمين وإتمام بيع فيلا بحي الروضة.",
        imageUrl: projectImage("waseet-brokerage"),
        location: "جدة - حي الروضة",
        year: "2023",
        category: "وساطة",
      },
    ],
    featured: false,
    verified: true,
  },
  // ---- شركات تطوير عقاري ----
  {
    name: "مشاريع المعمار للتطوير",
    nameEn: "Al Maamar Development",
    slug: "al-maamar-development",
    category: "real-estate-development",
    tagline: "نُطوّر مجتمعات تدوم",
    description:
      "شركة تطوير عقاري متخصصة في المشاريع السكنية من فلل ومجمعات، نقدّم مشاريع جاهزة وتحت الإنشاء بمعايير جودة عالية ومواقع مختارة.",
    city: "الرياض",
    district: "حي الملقا",
    services: ["فلل", "مجمعات سكنية", "مشاريع تحت الإنشاء"],
    phone: "0534344556",
    email: "info@maamar-dev.sa",
    website: "https://maamar-dev.sa",
    establishedYear: "2010",
    teamSize: "150+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("maamar-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "مجمع فلل حي الملقا",
        description: "مجمع من ٤٠ فيلا بتصاميم متناسقة وخدمات مشتركة.",
        imageUrl: projectImage("maamar-compound"),
        location: "الرياض - حي الملقا",
        year: "2024",
        category: "تطوير",
      },
      {
        id: newId(),
        title: "مشروع فلل تحت الإنشاء",
        description: "مشروع فلل جاهز للبيع بمراحل تسليم متدرجة.",
        imageUrl: projectImage("maamar-under"),
        location: "الرياض - حي الدار البيضاء",
        year: "2025",
        category: "تطوير",
      },
    ],
    featured: true,
    verified: true,
  },
  {
    name: "تطوير الأفق",
    nameEn: "Al Ufuq Development",
    slug: "al-ufuq-development",
    category: "real-estate-development",
    tagline: "أفقٌ جديد للسكن والاستثمار",
    description:
      "مطوّر عقاري يقدّم مشاريع الشقق والتاون هاوس والمشاريع التجارية متعددة الاستخدامات، نمزج بين التصميم العصري والقيمة الاستثمارية المستدامة.",
    city: "جدة",
    district: "حي الشاطئ",
    services: ["شقق", "تاون هاوس", "مشاريع تجارية"],
    phone: "0535455667",
    email: "info@ufuq-dev.sa",
    establishedYear: "2016",
    teamSize: "110+",
    status: "approved",
    ownerId: undefined,
    logoUrl: undefined,
    coverUrl: projectImage("ufuq-cover", 1200, 500),
    projectCount: 2,
    portfolio: [
      {
        id: newId(),
        title: "برج سكني بواجهة بحرية",
        description: "برج شقق بإطلالة بحرية ومرافق متكاملة.",
        imageUrl: projectImage("ufuq-tower"),
        location: "جدة - كورنيش",
        year: "2024",
        category: "تطوير",
      },
      {
        id: newId(),
        title: "تاون هاوس العائلات",
        description: "مجمع تاون هاوس بحدائق خاصة ومواقف مغطاة.",
        imageUrl: projectImage("ufuq-townhouse"),
        location: "جدة - حي الشاطئ",
        year: "2023",
        category: "تطوير",
      },
    ],
    featured: false,
    verified: true,
  },
]

let seedPromise: Promise<void> | undefined

export function seedDatabase(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = undefined
      throw error
    })
  }
  return seedPromise
}

async function runSeed(): Promise<void> {
  await ensureIndexes()
  const { users, companies, integrations, adsenseSlots, banners } =
    await getCollections()

  // Migrate legacy category keys to the new 10-category model.
  await Promise.all([
    companies.updateMany(
      { category: "construction" } as unknown as Filter<Company>,
      { $set: { category: "contractor" } },
    ),
    companies.updateMany(
      { category: "interior" } as unknown as Filter<Company>,
      { $set: { category: "interior-designer" } },
    ),
    companies.updateMany(
      { category: "engineering" } as unknown as Filter<Company>,
      { $set: { category: "architect" } },
    ),
  ])

  const adminEmail = "admin@atlas-almanzil.sa"
  const existingAdmin = await users.findOne({ email: adminEmail })
  if (!existingAdmin) {
    await users.insertOne({
      _id: newId(),
      name: "إدارة أطلس المنزل",
      email: adminEmail,
      phone: "0500000000",
      role: "admin",
      passwordHash: hashPassword(ADMIN_DEMO_PASSWORD),
      createdAt: new Date().toISOString(),
    } as User)
  }

  // بذر مستخدمي إدارة إضافيين لتجربة الأدوار (يمكن تغيير كلمات المرور لاحقًا).
  const staffSeeds: Array<{ name: string; email: string; role: User["role"] }> = [
    { name: "مدير المحتوى", email: "content@atlas-almanzil.sa", role: "content-manager" },
    { name: "مدير الإعلانات", email: "ads@atlas-almanzil.sa", role: "ads-manager" },
  ]
  for (const staff of staffSeeds) {
    const exists = await users.findOne({ email: staff.email })
    if (!exists) {
      await users.insertOne({
        _id: newId(),
        name: staff.name,
        email: staff.email,
        phone: "",
        role: staff.role,
        passwordHash: hashPassword(STAFF_DEMO_PASSWORD),
        createdAt: new Date().toISOString(),
      } as User)
    }
  }

  // بذر سجلّات التكامل — كلها «غير متصل» حتى يربطها صاحب الموقع عبر OAuth/API.
  const now0 = new Date().toISOString()
  const integrationProviders = [
    "google-analytics",
    "google-ads",
    "google-adsense",
    "instagram",
    "facebook",
    "linkedin",
    "x",
    "tiktok",
    "youtube",
    "pinterest",
    "email-smtp",
  ] as const
  for (const provider of integrationProviders) {
    const exists = await integrations.findOne({ provider })
    if (!exists) {
      await integrations.insertOne({
        _id: newId(),
        provider,
        status: "disconnected",
        updatedAt: now0,
      } as Integration)
    }
  }

  // مواضع إعلانات AdSense الافتراضية القابلة للإدارة.
  const defaultSlots = [
    "داخل المقال",
    "بين الأقسام",
    "الشريط الجانبي",
    "أسفل المقال",
    "نتائج المحتوى",
  ]
  for (const location of defaultSlots) {
    const exists = await adsenseSlots.findOne({ location })
    if (!exists) {
      await adsenseSlots.insertOne({
        _id: newId(),
        name: location,
        location,
        enabled: false,
        createdAt: now0,
        updatedAt: now0,
      } as AdSenseSlot)
    }
  }

  const companyCount = await companies.countDocuments()
  if (companyCount === 0) {
    const now = new Date().toISOString()
    await companies.insertMany(
      SEED_COMPANIES.map((c) => ({
        ...c,
        _id: newId(),
        rating: 0,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
      })) as Company[],
    )
  }

  // بنرات عرض رئيسية مملوكة للمنصة — تظهر في الصفحة الرسمية ككاروسيل متحرّك
  // متعدد الصور. تُبذر مرة واحدة فقط ولا تُكرّر عند إعادة البذر.
  const heroBannerCount = await banners.countDocuments({ placement: "hero" })
  if (heroBannerCount === 0) {
    const nowB = new Date().toISOString()
    const seedBanners: Array<Omit<Banner, "_id">> = [
      {
        name: "عرض التصميم الداخلي",
        desktopImage: "/generated/banners/banner-interior-0x0e6685ac.webp",
        title: "صمّم منزلك بأيدٍ سعودية ماهرة",
        description:
          "اكتشف أفضل مصممي الديكور الداخلي في المملكة — من الفكرة حتى آخر لمسة.",
        ctaLabel: "تصفّح مصممي الديكور",
        ctaUrl: "/companies?category=interior-designer",
        placement: "hero",
        priority: 30,
        status: "active",
        views: 0,
        clicks: 0,
        createdBy: "system",
        createdAt: nowB,
        updatedAt: nowB,
      },
      {
        name: "عرض المقاولات والعمارة",
        desktopImage: "/generated/banners/banner-architecture-0x9788a813.webp",
        title: "مقاولون ومعماريون موثوقون لمشروعك",
        description:
          "نفّذ مشروعك بثقة مع مقاولين ومعماريين معتمدين ومراجَعين عبر المنصة.",
        ctaLabel: "اعثر على مقاولك",
        ctaUrl: "/companies?category=contractor",
        placement: "hero",
        priority: 20,
        status: "active",
        views: 0,
        clicks: 0,
        createdBy: "system",
        createdAt: nowB,
        updatedAt: nowB,
      },
      {
        name: "عرض العقارات والتطوير",
        desktopImage: "/generated/banners/banner-real-estate-0x1263ba42.webp",
        title: "فرص عقارية وتطوير في كل مدن المملكة",
        description:
          "تصفّح أبرز شركات العقارات والتطوير العقاري واستثمر بوضوح وثقة.",
        ctaLabel: "استكشف العقارات",
        ctaUrl: "/companies?category=real-estate",
        placement: "hero",
        priority: 10,
        status: "active",
        views: 0,
        clicks: 0,
        createdBy: "system",
        createdAt: nowB,
        updatedAt: nowB,
      },
    ]
    await banners.insertMany(
      seedBanners.map((b) => ({ ...b, _id: newId() }) as Banner),
    )
  }
}

// Demo admin password — set during seeding.
export const ADMIN_DEMO_PASSWORD = "atlas-admin-1234"

// Demo password for seeded staff accounts (content/ads managers).
export const STAFF_DEMO_PASSWORD = "atlas-staff-1234"
