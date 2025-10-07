"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy } from "lucide-react"
import { useVault } from "@/context/vault-context"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { generateSecurePassword, type PasswordOptions } from "@/lib/generator"

export function PasswordGeneratorDialog() {
  const { generatorOpen, closeGenerator, applyGeneratedPassword } = useVault()
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [num, setNum] = useState(true)
  const [sym, setSym] = useState(true)
  const [exclude, setExclude] = useState(true)
  const [value, setValue] = useState("")
  const [copied, setCopied] = useState(false)

  const passwordOptions: PasswordOptions = useMemo(() => ({
    length,
    includeUppercase: upper,
    includeLowercase: lower,
    includeNumbers: num,
    includeSymbols: sym,
    excludeLookAlikes: exclude,
  }), [length, upper, lower, num, sym, exclude])

  useEffect(() => {
    // generate on open
    if (generatorOpen) {
      try {
        setValue(generateSecurePassword(passwordOptions))
      } catch (error) {
        console.error('Password generation error:', error)
        setValue("")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatorOpen])

  const onGenerate = () => {
    try {
      setValue(generateSecurePassword(passwordOptions))
    } catch (error) {
      console.error('Password generation error:', error)
      setValue("")
    }
  }

  const onCopy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 12000)
  }

  return (
    <Dialog open={generatorOpen} onOpenChange={(open) => (open ? null : closeGenerator())}>
      <DialogContent className="rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>Generate Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
          <div className="space-y-2">
            <Label>Password length: {length}</Label>
            <Slider value={[length]} min={8} max={64} step={1} onValueChange={(v) => setLength(v[0] ?? 16)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={upper} onCheckedChange={(v) => setUpper(Boolean(v))} /> Uppercase
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={lower} onCheckedChange={(v) => setLower(Boolean(v))} /> Lowercase
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={num} onCheckedChange={(v) => setNum(Boolean(v))} /> Numbers
            </label>
            <label className="inline-flex items-center gap-2">
              <Checkbox checked={sym} onCheckedChange={(v) => setSym(Boolean(v))} /> Symbols
            </label>
            <label className="inline-flex items-center gap-2 col-span-2">
              <Checkbox checked={exclude} onCheckedChange={(v) => setExclude(Boolean(v))} /> Exclude look-alikes
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={value}
              className="rounded-xl font-mono tracking-tight"
              aria-label="Generated password"
            />
            <TooltipProvider>
              <Tooltip open={copied}>
                <TooltipTrigger asChild>
                  <Button variant="secondary" className="rounded-xl" onClick={onCopy}>
                    <Copy className="mr-2 size-4" />
                    Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl">
                  {copied ? "Copied! Auto-clears in ~12s" : "Copy to clipboard"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button className="rounded-xl" onClick={onGenerate}>
              Generate
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              className="rounded-xl"
              onClick={() => {
                applyGeneratedPassword(value)
                closeGenerator()
              }}
            >
              Use Password
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
