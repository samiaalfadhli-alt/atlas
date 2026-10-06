import type { Metadata } from "next"
import { Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google"
import Script from "next/script"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { EtlaqEditBridge } from "@/components/etlaq-edit-bridge"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/contexts/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"

const sansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://studio.etlaq.sa"),
  title: "أطلس المنزل | دليل شركات البناء والتصميم والعقارات",
  description: "أطلس المنزل دليل سعودي يجمع المصممين الداخليين والمهندسين والمقاولين، وشركات الأثاث والحدائق والإضاءة والمطابخ والدهانات، والشركات العقارية والتطوير العقاري في مكان واحد لتختار شريك مشروعك بثقة.",
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    shortcut: [{ url: "/logo.webp", type: "image/webp" }],
    apple: [{ url: "/logo.webp", type: "image/webp" }],
  },
  openGraph: {
    type: "website",
    title: "أطلس المنزل | دليل شركات البناء والتصميم والعقارات",
    description: "أطلس المنزل دليل سعودي يجمع المصممين الداخليين والمهندسين والمقاولين، وشركات الأثاث والحدائق والإضاءة والمطابخ والدهانات، والشركات العقارية والتطوير العقاري في مكان واحد لتختار شريك مشروعك بثقة.",
    siteName: "Etlaq",
    images: [
      {
        url: "https://studio.etlaq.sa/images/etlaq%20og.png",
        width: 1200,
        height: 630,
        alt: "Etlaq app preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أطلس المنزل | دليل شركات البناء والتصميم والعقارات",
    description: "أطلس المنزل دليل سعودي يجمع المصممين الداخليين والمهندسين والمقاولين، وشركات الأثاث والحدائق والإضاءة والمطابخ والدهانات، والشركات العقارية والتطوير العقاري في مكان واحد لتختار شريك مشروعك بثقة.",
    images: ["https://studio.etlaq.sa/images/etlaq%20og.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        fontMono.variable,
        sansArabic.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-full flex-col">
        <Script id="etlaq-theme-init" strategy="beforeInteractive">
          {`(function(){try{var stored=localStorage.getItem("theme");var theme=stored==="dark"?"dark":"light";var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(theme);root.style.colorScheme=theme}catch(_){}})();`}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <SiteHeader />
                <div className="flex flex-1 flex-col">{children}</div>
                <SiteFooter />
              </TooltipProvider>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <EtlaqEditBridge />
      </body>
    </html>
  )
}
