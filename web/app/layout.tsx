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
  description: "Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável. Envie mensagens, arquivos e mídias com webhooks em tempo real.",
  keywords: [
    "whatsapp api",
    "api whatsapp",
    "integração whatsapp",
    "mensagens whatsapp",
    "webhook whatsapp",
    "whatsapp business api",
    "api rest whatsapp",
    "automação whatsapp",
    "chatbot whatsapp",
    "whatsapp brasil",
    "enviar mensagem whatsapp api",
    "whatsapp api oficial"
  ].join(", "),
  authors: [{ name: "ZippyZap" }],
  creator: "ZippyZap",
  publisher: "ZippyZap",
  robots: "index, follow",
  generator: "Next.js",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zippyzap.online'),
  verification: {
    google: 'OMCTgJ-OAioJ_SfRNFX7-kpzt6WnOeDXsMHp7aiCpLw',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://zippyzap.online',
    title: 'ZippyZap - WhatsApp API Integration',
    description: 'Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável',
    siteName: 'ZippyZap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZippyZap - WhatsApp API Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZippyZap - WhatsApp API Integration',
    description: 'Integre mensagens WhatsApp facilmente em suas aplicações com nossa API confiável e escalável',
    images: ['/og-image.png'],
    creator: '@zippyzapOfc',
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZippyZap",
    "url": process.env.NEXT_PUBLIC_APP_URL || "https://zippyzap.online",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "https://zippyzap.online"}/logo.png`,
    "description": "Plataforma de API WhatsApp Business para integração de mensagens em aplicações",
    "sameAs": [
      "https://x.com/zippyzapOfc",
      "https://www.instagram.com/zippyzapapi/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "availableLanguage": ["Portuguese", "English"]
    }
  }

  return (
    <html lang="pt-BR" className={`${playfairDisplay.variable} ${sourceSans.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
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
