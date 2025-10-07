import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { VaultProvider } from "@/context/vault-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "SecureVault",
  description: "Privacy-first encrypted vault and password generator",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans ${inter.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <VaultProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Toaster />
          </VaultProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
