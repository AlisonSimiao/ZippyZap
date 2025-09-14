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
  generator: "v0.app",
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
