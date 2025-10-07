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

export default function SignupPage() {
  const { signUp } = useVault()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await signUp(username, email, password)
    } catch (err: any) {
      setError(err?.message || "Failed to create account")
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
          <h1 className="text-xl font-semibold">Create Account</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your vault is encrypted client-side. We never store your plaintext.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl"
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign In
            </Link>
          </p>
        </form>
        </Card>
      </motion.div>
    </main>
  )
}
