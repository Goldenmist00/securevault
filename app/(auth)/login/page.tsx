"use client"

import type React from "react"

import { useVault } from "@/context/vault-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const { signIn } = useVault()
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(emailOrUsername, password)
    } catch (err: any) {
      setError(err?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="w-full max-w-md p-6 rounded-2xl bg-card shadow-md">
        <div className="flex items-center gap-2">
          <Lock className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="text-xl font-semibold">SecureVault</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your vault is encrypted client-side. We never store your plaintext.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrUsername">Email or Username</Label>
            <Input
              id="emailOrUsername"
              type="text"
              autoComplete="username"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="rounded-xl"
              placeholder="Enter your email or username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            No account?{" "}
            <Link href="/signup" className="underline">
              Create Account
            </Link>
          </p>
        </form>
        </Card>
      </motion.div>
    </main>
  )
}
