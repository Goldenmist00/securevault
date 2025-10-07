"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Folder, FolderOpen } from "lucide-react"
import { useVault } from "@/context/vault-context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function VaultSidebar() {
  const { 
    items, 
    selectItem, 
    selectedId, 
    createItem, 
    query, 
    setQuery, 
    selectedFolder,
    setSelectedFolder,
    availableFolders,
    isMobileSidebarOpen 
  } = useVault()

  return (
    <Card
      className={cn(
        "rounded-2xl bg-card shadow-sm p-3 md:p-4 flex flex-col h-[70vh] md:h-[calc(100vh-9rem)]",
        "md:sticky md:top-20",
        "md:block",
        isMobileSidebarOpen ? "block" : "hidden md:block",
      )}
      role="complementary"
      aria-label="Vault sidebar"
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 rounded-xl"
          aria-label="Search vault"
        />
      </div>

      {/* Folders */}
      <div className="mt-3">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-1">Folders</div>
        <div className="space-y-1">
          {availableFolders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                selectedFolder === folder 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-secondary text-muted-foreground"
              )}
            >
              {selectedFolder === folder ? (
                <FolderOpen className="size-4" />
              ) : (
                <Folder className="size-4" />
              )}
              <span className="truncate">{folder}</span>
              <span className="ml-auto text-xs">
                {folder === "All Items" 
                  ? items.length 
                  : items.filter(i => i.folder === folder).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-3 grid place-items-center rounded-xl border p-6 text-center"
          >
            <div className="space-y-2 max-w-[22rem]">
              <div className="mx-auto size-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <Search className="size-5" aria-hidden />
              </div>
              <div className="text-sm font-medium">No items yet</div>
              <p className="text-xs text-muted-foreground">
                Create your first entry to get started. Your data is encrypted on your device.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 divide-y divide-border overflow-auto rounded-xl border"
          >
            {items.map((it, index) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => selectItem(it.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    it.id === selectedId && "bg-secondary",
                  )}
                  aria-current={it.id === selectedId ? "true" : undefined}
                >
                  <div className="font-medium line-clamp-1">{it.title || "Untitled"}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{it.username || "—"}</div>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-3">
        <Button className="w-full rounded-xl" onClick={createItem}>
          <Plus className="mr-2 size-4" />
          New Item
        </Button>
      </div>
    </Card>
  )
}
