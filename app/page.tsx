"use client"

import { Navbar } from "@/components/navbar"
import { VaultSidebar } from "@/components/vault-sidebar"
import { VaultDetail } from "@/components/vault-detail"
import { PasswordGeneratorDialog } from "@/components/password-generator-dialog"
import { ClipboardPermissionDialog } from "@/components/clipboard-permission-dialog"
import { useVault } from "@/context/vault-context"
import { Card } from "@/components/ui/card"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

function DashboardInner() {
  const { isAuthenticated, showClipboardDialog, setShowClipboardDialog } = useVault()

  const handleClipboardPermission = (granted: boolean) => {
    setShowClipboardDialog(false)
    localStorage.setItem('sv:clipboard-permission-asked', 'true')
    
    if (granted) {
      localStorage.setItem('sv:clipboard-permission-granted', 'true')
      console.log("✅ Clipboard permission granted by user")
    } else {
      localStorage.setItem('sv:clipboard-permission-granted', 'false')
      console.log("❌ Clipboard permission denied by user")
    }
  }

  useEffect(() => {
    // Focus handling or onboarding could go here
  }, [])

  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <Card className="w-full max-w-md p-6 bg-card shadow-sm rounded-2xl">
          <div className="space-y-3 text-center">
            <div className="mx-auto size-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
              <span className="sr-only">SecureVault</span>
              {/* decorative lock via emoji avoided; keep minimal shape */}
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="opacity-90">
                <path
                  fill="currentColor"
                  d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5m-3 8V7a3 3 0 1 1 6 0v3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-pretty">Welcome to SecureVault</h1>
            <p className="text-muted-foreground text-balance">
              Privacy-first password manager with client-side encryption. Sign in to access your vault.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href="/login"
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                "bg-secondary text-foreground hover:bg-muted transition",
              )}
            >
              Sign In
            </a>
            <a
              href="/signup"
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-4 py-2.5",
                "bg-primary text-primary-foreground hover:opacity-90 transition",
              )}
            >
              Create Account
            </a>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <section className="md:col-span-1">
              <VaultSidebar />
            </section>
            <section className="md:col-span-2">
              <VaultDetail />
            </section>
          </div>
        </div>
      </main>
      <PasswordGeneratorDialog />
      <ClipboardPermissionDialog 
        open={showClipboardDialog}
        onClose={handleClipboardPermission}
      />
    </div>
  )
}

export default function Page() {
  return <DashboardInner />
}
