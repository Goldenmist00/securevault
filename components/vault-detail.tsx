"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Eye, EyeOff, Edit, Trash2, LinkIcon, Tag, X } from "lucide-react"
import { useVault } from "@/context/vault-context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { estimatePasswordStrength } from "@/lib/generator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function VaultDetail() {
  const {
    selected,
    updateSelected,
    deleteSelected,
    copyPassword,
    copied,
    maskPassword,
    toggleMaskPassword,
    openGenerator,
    availableFolders,
    availableTags,
  } = useVault()
  const { toast } = useToast()
  const [newTag, setNewTag] = useState("")

  const handleDelete = () => {
    if (selected) {
      deleteSelected()
      toast({
        title: "Item deleted",
        description: "Vault item has been permanently removed.",
      })
    }
  }

  const handleCopy = async (value: string) => {
    await copyPassword(value)
    toast({
      title: "Password copied",
      description: "Password copied to clipboard and will auto-clear in 12 seconds.",
    })
  }

  const passwordStrength = selected?.password ? estimatePasswordStrength(selected.password) : null

  const addTag = (tag: string) => {
    if (!selected || !tag.trim()) return
    const trimmedTag = tag.trim()
    if (!selected.tags.includes(trimmedTag)) {
      updateSelected({ tags: [...selected.tags, trimmedTag] })
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    if (!selected) return
    updateSelected({ tags: selected.tags.filter(tag => tag !== tagToRemove) })
  }

  if (!selected) {
    return (
      <Card className="rounded-2xl p-6 bg-card shadow-sm min-h-[50vh] grid place-items-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          Select or create an item to get started.
        </motion.p>
      </Card>
    )
  }

  return (
    <motion.div
      key={selected.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="rounded-2xl p-4 md:p-6 bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-pretty">{selected.title || "Details"}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => updateSelected({})}>
            <Edit className="mr-2 size-4" />
            Edit
          </Button>
          <Button variant="destructive" className="rounded-xl" onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className="rounded-xl"
            value={selected.title}
            onChange={(e) => updateSelected({ title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            className="rounded-xl"
            value={selected.username}
            onChange={(e) => updateSelected({ username: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {passwordStrength && (
              <div className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  passwordStrength.score <= 1 && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                  passwordStrength.score === 2 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
                  passwordStrength.score === 3 && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  passwordStrength.score === 4 && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                )}>
                  {passwordStrength.label}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="password"
              className="rounded-xl"
              type={maskPassword ? "password" : "text"}
              value={selected.password}
              onChange={(e) => updateSelected({ password: e.target.value })}
            />
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={toggleMaskPassword}
              aria-label="Toggle password visibility"
            >
              {maskPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </Button>
            <TooltipProvider delayDuration={200}>
              <Tooltip open={copied} defaultOpen={false}>
                <TooltipTrigger asChild>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" className="rounded-xl" onClick={() => handleCopy(selected.password)}>
                          <Copy className="mr-2 size-4" />
                          Copy
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl max-w-xs">
                        <p>Click to copy password. Browser may ask for clipboard permission for security.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TooltipTrigger>
                <TooltipContent className="rounded-xl">
                  <p>{copied ? "Copied! Auto-clears in ~12s" : "Copy to clipboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" className="rounded-xl bg-transparent" onClick={openGenerator}>
              Generate
            </Button>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="url">URL</Label>
          <div className="flex items-center gap-2">
            <Input
              id="url"
              className="rounded-xl"
              value={selected.url}
              onChange={(e) => updateSelected({ url: e.target.value })}
              placeholder="https://example.com"
            />
            {selected.url && (
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1 rounded-xl px-3 py-2",
                  "bg-secondary text-foreground hover:bg-muted transition",
                )}
              >
                <LinkIcon className="size-4" aria-hidden />
                Open
              </a>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="folder">Folder</Label>
          <Select 
            value={selected.folder || "__none__"} 
            onValueChange={(value) => updateSelected({ folder: value === "__none__" ? "" : value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No folder</SelectItem>
              {availableFolders.filter(f => f !== "All Items").map((folder) => (
                <SelectItem key={folder} value={folder}>{folder}</SelectItem>
              ))}
              <SelectItem value="__new__">+ Create new folder</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selected.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="size-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag(newTag)
                }
              }}
              className="rounded-xl"
            />
            <Button 
              onClick={() => addTag(newTag)}
              variant="outline"
              className="rounded-xl"
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            className="rounded-xl min-h-28"
            value={selected.notes}
            onChange={(e) => updateSelected({ notes: e.target.value })}
          />
        </div>
      </div>
    </Card>
    </motion.div>
  )
}
