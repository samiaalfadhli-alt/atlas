const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]

const LATIN_DIGIT_RE = /\d/g

export function toArabicDigits(value: string | number): string {
  return String(value).replace(LATIN_DIGIT_RE, (d) => arabicDigits[Number(d)] ?? d)
}

export function formatNumber(value: number): string {
  return toArabicDigits(value.toLocaleString("en-US"))
}

export function formatRating(value: number): string {
  return toArabicDigits(value.toFixed(1))
}

export function formatCount(value: number, singular: string, plural: string): string {
  const word = value === 1 ? singular : plural
  return `${formatNumber(value)} ${word}`
}

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

export function formatDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return ""
  const day = toArabicDigits(date.getDate())
  const month = AR_MONTHS[date.getMonth()]
  const year = toArabicDigits(date.getFullYear())
  return `${day} ${month} ${year}`
}

export function timeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "قبل لحظات"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `قبل ${toArabicDigits(minutes)} دقيقة`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `قبل ${toArabicDigits(hours)} ساعة`
  const days = Math.floor(hours / 24)
  if (days < 30) return `قبل ${toArabicDigits(days)} يوم`
  const months = Math.floor(days / 30)
  if (months < 12) return `قبل ${toArabicDigits(months)} شهر`
  const years = Math.floor(days / 365)
  return `قبل ${toArabicDigits(years)} سنة`
}
