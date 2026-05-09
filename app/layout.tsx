import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { ConditionalHeader } from "@/components/conditional-header"
import { Footer } from "@/components/footer"
import { ConditionalFooter } from "@/components/conditional-footer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FloatingContact } from "@/components/floating-contact"
import { LiveChat } from "@/components/live-chat"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Breadcrumb } from "@/components/breadcrumb"
import { AccessibilitySkipLink } from "@/components/accessibility-skip-link"
import { FloatingElements } from "@/components/floating-elements"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "Joson Furniture - Filipino Craft, World-Class Comfort | Philippines",
  description:
    "Joson Furniture blends tradition and innovation to create pieces that bring world-class comfort into every home. Shop bed frames, bunk beds, sofa beds and more.",
  generator: "v0.app",
  keywords:
    "furniture Philippines, bed frame, bunk bed, platform bed, sofa bed, Filipino furniture, Joson Furniture, affordable furniture, loft bed, canopy bed, day bed",
  authors: [{ name: "Joson Furniture" }],
  creator: "Joson Furniture",
  publisher: "Joson Furniture",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://josonfurniture.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Joson Furniture - Filipino Craft, World-Class Comfort",
    description: "Where Filipino artistry meets timeless design. Shop quality bed frames, bunk beds, and more.",
    url: "https://josonfurniture.com",
    siteName: "Joson Furniture",
    images: [
      {
        url: "https://res.cloudinary.com/dbviya1rj/image/upload/q_auto/f_auto/v1773613973/q1ckzznmcv9chhnkjyzy.png",
        width: 32,
        height: 32,
        alt: "Joson Furniture Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Joson Furniture - Filipino Craft, World-Class Comfort",
    description: "Where Filipino artistry meets timeless design.",
    images: ["https://res.cloudinary.com/dbviya1rj/image/upload/q_auto/f_auto/v1773613973/q1ckzznmcv9chhnkjyzy.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Joson Furniture",
              description:
                "Filipino furniture brand blending tradition and innovation. Shop bed frames, bunk beds, sofa beds and more.",
              url: "https://josonfurniture.com",
              logo: "https://res.cloudinary.com/dbviya1rj/image/upload/q_auto/f_auto/v1773613973/q1ckzznmcv9chhnkjyzy.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+63-917-133-8888",
                contactType: "customer service",
                areaServed: "PH",
                availableLanguage: "English",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "PH",
              },
              sameAs: ["https://www.facebook.com/josonfurniture", "https://www.instagram.com/josonfurniture"],
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <AccessibilitySkipLink />
          <ConditionalHeader />
          <Breadcrumb />
          <main id="main-content" role="main">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
            </ErrorBoundary>
          </main>
          <ConditionalFooter />
          <FloatingElements />
          <ScrollToTop />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
