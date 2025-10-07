"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KeyRound, LogOut, Menu, Moon, Sun, Lock, Plus, Download, Upload, Shield } from "lucide-react"
import { useVault } from "@/context/vault-context"
import { useTheme } from "@/hooks/use-theme"
import { TwoFactorSetup } from "@/components/two-factor-setup"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const { signOut, openGenerator, toggleSidebar, isMobileSidebarOpen, createItem, session } = useVault()
  const { theme, toggleTheme } = useTheme()
  const [twoFactorOpen, setTwoFactorOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="size-5" />
          </Button>
          {/* brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-primary-foreground">
                <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5m-3 8V7a3 3 0 1 1 6 0v3z"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight">SecureVault</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Vault" className="rounded-xl">
            <Lock className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="New entry" onClick={createItem} className="rounded-xl">
            <Plus className="size-5" />
          </Button>
          <Button variant="secondary" className="rounded-xl" onClick={openGenerator}>
            <KeyRound className="mr-2 size-4" />
            Generate Password
          </Button>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme} className="rounded-xl">
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>
                  {session?.username ? session.username.charAt(0).toUpperCase() : 'SV'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {session?.username ? `@${session.username}` : 'Account'}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTwoFactorOpen(true)} className="gap-2">
                <Shield className="size-4" />
                Enable 2FA
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Download className="size-4" />
                Export Vault
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Upload className="size-4" />
                Import Vault
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="gap-2">
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <TwoFactorSetup
        open={twoFactorOpen}
        onClose={() => setTwoFactorOpen(false)}
        onComplete={(secret) => {
          // TODO: Save 2FA secret to user profile
          console.log('2FA enabled with secret:', secret)
        }}
        username={session?.username || ''}
      />
    </header>
  )
}
