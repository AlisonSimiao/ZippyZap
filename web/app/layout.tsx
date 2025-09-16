import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { Providers } from "../components/providers"
import { Analytics } from "@vercel/analytics/next"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "ZippyZap - WhatsApp API Integration",
  description: "Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável",
  keywords: "whatsapp api, api whatsapp, integração whatsapp, mensagens whatsapp, webhook whatsapp",
  authors: [{ name: "ZippyZap" }],
  creator: "ZippyZap",
  publisher: "ZippyZap",
  robots: "index, follow",
  generator: "Next.js",
  metadataBase: new URL('https://zippy-zap.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://zippy-zap.vercel.app',
    title: 'ZippyZap - WhatsApp API Integration',
    description: 'Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável',
    siteName: 'ZippyZap',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZippyZap - WhatsApp API Integration',
    description: 'Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável',
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${playfairDisplay.variable} ${sourceSans.variable} antialiased`}>
      <body className="font-sans">
        <Providers>
          <Analytics />
            {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
