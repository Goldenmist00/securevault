"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Shield, Smartphone, Key } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateTotpSetup, verifyTotpToken } from "@/lib/totp"

interface TwoFactorSetupProps {
  open: boolean
  onClose: () => void
  onComplete: (secret: string) => void
  username: string
}

export function TwoFactorSetup({ open, onClose, onComplete, username }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      generateSetup()
    }
  }, [open, username])

  const generateSetup = async () => {
    try {
      const setup = await generateTotpSetup(username)
      setQrCode(setup.qrCodeUrl)
      setSecret(setup.secret)
      setStep('setup')
      setError("")
    } catch (error) {
      setError("Failed to generate 2FA setup")
    }
  }

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      toast({
        title: "Secret copied",
        description: "TOTP secret copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy secret to clipboard",
        variant: "destructive",
      })
    }
  }

  const verifyAndComplete = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const isValid = verifyTotpToken(verificationCode.replace(/\s/g, ''), secret)
      
      if (isValid) {
        onComplete(secret)
        toast({
          title: "2FA enabled",
          description: "Two-factor authentication has been successfully enabled",
        })
        onClose()
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('setup')
    setVerificationCode("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            Enable Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) or enter the secret manually.
            </div>

            {qrCode && (
              <Card className="p-4 text-center">
                <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-3" />
                <div className="text-xs text-muted-foreground mb-2">
                  Can't scan? Enter this code manually:
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                    {secret}
                  </code>
                  <Button size="sm" variant="outline" onClick={copySecret}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Smartphone className="size-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100">Recommended Apps:</div>
                <div className="text-blue-700 dark:text-blue-300">
                  Google Authenticator, Authy, Microsoft Authenticator, or 1Password
                </div>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full rounded-xl">
              I've Added the Account
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to complete setup.
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="rounded-xl text-center text-lg font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')} 
                className="flex-1 rounded-xl"
              >
                Back
              </Button>
              <Button 
                onClick={verifyAndComplete} 
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 rounded-xl"
              >
                {loading ? "Verifying..." : "Enable 2FA"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}