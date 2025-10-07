"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clipboard, Shield, Check, X } from "lucide-react"
import { requestClipboardPermissionProactively } from "@/lib/clipboard-permissions"

interface ClipboardPermissionDialogProps {
  open: boolean
  onClose: (granted: boolean) => void
}

export function ClipboardPermissionDialog({ open, onClose }: ClipboardPermissionDialogProps) {
  const [requesting, setRequesting] = useState(false)

  const handleAllow = async () => {
    setRequesting(true)
    try {
      const granted = await requestClipboardPermissionProactively()
      onClose(granted)
    } catch (error) {
      onClose(false)
    } finally {
      setRequesting(false)
    }
  }

  const handleSkip = () => {
    onClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={() => !requesting && onClose(false)}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clipboard className="size-5 text-primary" />
            Clipboard Access
          </DialogTitle>
          <DialogDescription>
            SecureVault would like to access your clipboard to copy passwords securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Why we need this permission:
                </div>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                  <li>• Copy passwords to your clipboard instantly</li>
                  <li>• Auto-clear clipboard after 12 seconds for security</li>
                  <li>• Seamless password copying experience</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={requesting}
              className="rounded-xl"
            >
              <X className="mr-2 size-4" />
              Skip
            </Button>
            <Button 
              onClick={handleAllow}
              disabled={requesting}
              className="rounded-xl"
            >
              {requesting ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Requesting...
                </>
              ) : (
                <>
                  <Check className="mr-2 size-4" />
                  Allow Access
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            You can change this permission later in your browser settings.
            <br />
            SecureVault will work without this permission, but copying will be less convenient.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}