"use client"

import type React from "react"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptJSON, encryptJSON, deriveKey } from "@/lib/crypto"
import { loadLocal, saveLocal } from "@/lib/storage"
import { api } from "@/lib/api"

import { exportVault, importVault, downloadFile, readFileAsText } from "@/lib/import-export"
import { nanoid } from "nanoid"

type VaultItem = {
  id: string
  title: string
  username: string
  password: string
  url: string
  notes: string
  tags: string[]
  folder: string
  updatedAt: number
}

type Session = {
  username: string
  email: string
  saltB64: string
  token?: string
  userId?: string
}

type Ctx = {
  isAuthenticated: boolean
  items: VaultItem[]
  selectedId: string | null
  selected: VaultItem | null
  query: string
  setQuery: (q: string) => void
  selectedFolder: string
  setSelectedFolder: (folder: string) => void
  availableTags: string[]
  availableFolders: string[]
  selectItem: (id: string) => void
  createItem: () => void
  updateSelected: (patch: Partial<VaultItem>) => void
  deleteSelected: () => void
  maskPassword: boolean
  toggleMaskPassword: () => void
  copyPassword: (value: string) => Promise<void>
  copied: boolean
  signIn: (emailOrUsername: string, password: string) => Promise<void>
  signUp: (username: string, email: string, password: string) => Promise<void>
  signOut: () => void
  generatorOpen: boolean
  openGenerator: () => void
  closeGenerator: () => void
  applyGeneratedPassword: (value: string) => void
  toggleSidebar: () => void
  isMobileSidebarOpen: boolean
  session: Session | null
  exportVaultData: () => Promise<void>
  importVaultData: (file: File) => Promise<void>
  showClipboardDialog: boolean
  setShowClipboardDialog: (show: boolean) => void
}

const VaultCtx = createContext<Ctx | null>(null)

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [items, setItems] = useState<VaultItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("All Items")
  const [maskPassword, setMaskPassword] = useState(true)
  const [copied, setCopied] = useState(false)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showClipboardDialog, setShowClipboardDialog] = useState(false)

  // encryption key held only in memory
  const keyRef = useRef<CryptoKey | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  
  // Track clipboard clear timer
  const clipboardTimerRef = useRef<NodeJS.Timeout | null>(null)
  


  const isAuthenticated = !!session && !!keyRef.current

  // Load session if exists and attempt auto-login (requires password; we won't store it)
  useEffect(() => {
    const s = loadLocal<Session>("sv:session")
    if (s) setSession(s)
  }, [])

  // Show clipboard permission dialog after login
  useEffect(() => {
    if (isAuthenticated) {
      // Check if we've already asked for permission
      const hasAskedPermission = localStorage.getItem('sv:clipboard-permission-asked')
      
      if (!hasAskedPermission) {
        // Small delay to let the UI settle
        setTimeout(() => {
          setShowClipboardDialog(true)
        }, 1500)
      }
    }
  }, [isAuthenticated])

  // Cleanup clipboard timer on unmount
  useEffect(() => {
    return () => {
      if (clipboardTimerRef.current) {
        clearTimeout(clipboardTimerRef.current)
        clipboardTimerRef.current = null
      }
    }
  }, [])



  // Persist encrypted vault whenever items change (local + server sync)
  useEffect(() => {
    const persist = async () => {
      if (!keyRef.current || !session) return
      
      const payload = { items }
      const enc = await encryptJSON(keyRef.current, payload)
      
      // Save locally first
      saveLocal("sv:cipher", enc)
      
      // Sync to server if we have a token
      if (session.token) {
        try {
          await api.syncVault(session.token, enc, items.length)
          console.log('🔄 Vault synced to server')
        } catch (error) {
          console.error('Failed to sync vault to server:', error)
          // Continue with local storage even if server sync fails
        }
      }
    }
    persist()
  }, [items, session])

  const filtered = useMemo(() => {
    let filteredItems = items

    // Filter by folder
    if (selectedFolder !== "All Items") {
      filteredItems = filteredItems.filter(i => i.folder === selectedFolder)
    }

    // Filter by search query
    const q = query.trim().toLowerCase()
    if (q) {
      filteredItems = filteredItems.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.username.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q) ||
          i.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    return filteredItems
  }, [items, query, selectedFolder])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    items.forEach(item => {
      item.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [items])

  const availableFolders = useMemo(() => {
    const folders = new Set<string>()
    items.forEach(item => {
      if (item.folder) folders.add(item.folder)
    })
    return ["All Items", ...Array.from(folders).sort()]
  }, [items])

  const selected = useMemo(() => {
    const list = filtered.length ? filtered : items
    const id = selectedId ?? list[0]?.id ?? null
    return list.find((i) => i.id === id) ?? null
  }, [filtered, items, selectedId])

  function selectItem(id: string) {
    setSelectedId(id)
    setIsMobileSidebarOpen(false)
  }
  function createItem() {
    const it: VaultItem = {
      id: nanoid(),
      title: "New Item",
      username: "",
      password: "",
      url: "",
      notes: "",
      tags: [],
      folder: selectedFolder === "All Items" ? "" : selectedFolder,
      updatedAt: Date.now(),
    }
    setItems((prev) => [it, ...prev])
    setSelectedId(it.id)
  }
  function updateSelected(patch: Partial<VaultItem>) {
    if (!selected) return
    setItems((prev) => prev.map((i) => (i.id === selected.id ? { ...i, ...patch, updatedAt: Date.now() } : i)))
  }
  function deleteSelected() {
    if (!selected) return
    setItems((prev) => prev.filter((i) => i.id !== selected.id))
    setSelectedId(null)
  }

  function toggleMaskPassword() {
    setMaskPassword((m) => !m)
  }

  async function copyPassword(value: string) {
    if (!value) return
    
    // Cancel any existing clipboard clear timer
    if (clipboardTimerRef.current) {
      clearTimeout(clipboardTimerRef.current)
      clipboardTimerRef.current = null
    }
    
    // Try modern clipboard API first (requires user gesture)
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      console.log("📋 Password copied to clipboard (modern API)")
      
      // Set up auto-clear with modern API
      setupClipboardClear(value, true)
      return
    } catch (modernError) {
      console.log("Modern clipboard API failed, trying fallback...")
    }
    
    // Fallback method (works without permissions)
    try {
      const textArea = document.createElement("textarea")
      textArea.value = value
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      textArea.style.opacity = "0"
      textArea.style.pointerEvents = "none"
      textArea.setAttribute('readonly', '')
      textArea.setAttribute('contenteditable', 'true')
      
      document.body.appendChild(textArea)
      
      // For mobile devices
      if (navigator.userAgent.match(/ipad|android|iphone/i)) {
        textArea.contentEditable = 'true'
        textArea.readOnly = true
        const range = document.createRange()
        range.selectNodeContents(textArea)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        textArea.setSelectionRange(0, 999999)
      } else {
        textArea.select()
        textArea.setSelectionRange(0, 999999)
      }
      
      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
      
      if (successful) {
        setCopied(true)
        console.log("📋 Password copied to clipboard (fallback method)")
        
        // Set up auto-clear with fallback method (limited functionality)
        setupClipboardClear(value, false)
      } else {
        throw new Error("Copy command failed")
      }
    } catch (fallbackError) {
      console.error("All clipboard methods failed:", fallbackError)
      
      // Show manual copy option as last resort
      showManualCopyDialog(value)
    }
  }
  
  function setupClipboardClear(originalValue: string, canClear: boolean) {
    // Clear the visual indicator after 12 seconds
    setTimeout(() => setCopied(false), 12000)
    
    if (!canClear) {
      console.log("🔒 Auto-clear not available with fallback method")
      return
    }
    
    // Clear clipboard after 12 seconds (only with modern API)
    clipboardTimerRef.current = setTimeout(async () => {
      try {
        console.log("🔒 Attempting to clear clipboard...")
        
        // Try to verify current content before clearing
        let shouldClear = true
        try {
          const currentContent = await navigator.clipboard.readText()
          if (currentContent !== originalValue) {
            console.log("🔒 Clipboard content changed, skipping clear")
            shouldClear = false
          }
        } catch (readError) {
          console.log("🔒 Cannot read clipboard, attempting clear anyway")
        }
        
        if (shouldClear) {
          await navigator.clipboard.writeText("")
          console.log("🔒 Clipboard cleared for security after 12 seconds")
        }
      } catch (clearError) {
        console.warn("Could not clear clipboard:", clearError)
      }
      
      clipboardTimerRef.current = null
    }, 12000)
  }
  
  function showManualCopyDialog(value: string) {
    // Create a modal-like overlay for manual copy
    const overlay = document.createElement("div")
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    const dialog = document.createElement("div")
    dialog.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Copy Password Manually</h3>
      <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
        Please select and copy the password below:
      </p>
      <textarea readonly style="
        width: 100%;
        padding: 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        resize: none;
        background: #f9fafb;
        margin-bottom: 16px;
      " rows="3">${value}</textarea>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="manual-copy-close" style="
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Close</button>
      </div>
    `
    
    overlay.appendChild(dialog)
    document.body.appendChild(overlay)
    
    // Auto-select the text
    const textarea = dialog.querySelector("textarea") as HTMLTextAreaElement
    textarea.select()
    textarea.setSelectionRange(0, 99999)
    
    // Close dialog
    const closeBtn = dialog.querySelector("#manual-copy-close") as HTMLButtonElement
    const closeDialog = () => {
      document.body.removeChild(overlay)
    }
    
    closeBtn.onclick = closeDialog
    overlay.onclick = (e) => {
      if (e.target === overlay) closeDialog()
    }
    
    // Auto-close after 30 seconds
    setTimeout(closeDialog, 30000)
    
    console.log("📋 Manual copy dialog shown")
  }

  async function signUp(username: string, email: string, password: string) {
    try {
      // Call backend API
      const response = await api.signUp(username, email, password)
      
      if (!response.success) {
        throw new Error(response.error || 'Signup failed')
      }

      // Get user profile to get salt
      const profileResponse = await api.getUserProfile(response.token!)
      if (!profileResponse.success) {
        throw new Error('Failed to get user profile')
      }

      // Derive client-side key using salt from server
      const saltBytes = Uint8Array.from(atob(profileResponse.data.saltB64), (c) => c.charCodeAt(0))
      const key = await deriveKey(password, saltBytes)
      keyRef.current = key

      // Create session
      const sess: Session = { 
        username: response.user!.username,
        email, 
        saltB64: profileResponse.data.saltB64,
        token: response.token,
        userId: response.user!.id
      }
      setSession(sess)
      saveLocal("sv:session", sess)

      // Initialize empty vault and sync to server
      setItems([])
      const encryptedData = await encryptJSON(key, { items: [] })
      await api.syncVault(response.token!, encryptedData, 0)
      
      router.push("/")
    } catch (error: any) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async function signIn(emailOrUsername: string, password: string) {
    try {
      // Call backend API
      const response = await api.signIn(emailOrUsername, password)
      
      if (!response.success) {
        throw new Error(response.error || 'Sign in failed')
      }

      // Get user profile to get salt
      const profileResponse = await api.getUserProfile(response.token!)
      if (!profileResponse.success) {
        throw new Error('Failed to get user profile')
      }

      // Derive client-side key using salt from server
      const saltBytes = Uint8Array.from(atob(profileResponse.data.saltB64), (c) => c.charCodeAt(0))
      const key = await deriveKey(password, saltBytes)
      keyRef.current = key

      // Create session
      const sess: Session = { 
        username: response.user!.username,
        email: response.user!.email, 
        saltB64: profileResponse.data.saltB64,
        token: response.token,
        userId: response.user!.id
      }
      setSession(sess)
      saveLocal("sv:session", sess)

      // Load vault from server
      const vaultResponse = await api.getVault(response.token!)
      if (vaultResponse.success && vaultResponse.vault) {
        try {
          const data = await decryptJSON(key, vaultResponse.vault.encryptedData)
          setItems(Array.isArray(data.items) ? data.items : [])
        } catch (decryptError) {
          console.error('Failed to decrypt vault:', decryptError)
          setItems([])
        }
      } else {
        setItems([])
      }
      
      router.push("/")
    } catch (error: any) {
      console.error('Signin error:', error)
      throw error
    }
  }

  function signOut() {
    // Clear any pending clipboard timers
    if (clipboardTimerRef.current) {
      clearTimeout(clipboardTimerRef.current)
      clipboardTimerRef.current = null
    }
    
    keyRef.current = null
    setSession(null)
    setItems([])
    setSelectedId(null)
    setCopied(false)
    // keep encrypted data and session; user can log back in
    router.push("/login")
  }

  function openGenerator() {
    setGeneratorOpen(true)
  }
  function closeGenerator() {
    setGeneratorOpen(false)
  }
  function applyGeneratedPassword(value: string) {
    updateSelected({ password: value })
  }

  function toggleSidebar() {
    setIsMobileSidebarOpen((s) => !s)
  }

  async function exportVaultData() {
    if (!keyRef.current || !session) {
      throw new Error("Not authenticated")
    }

    try {
      const exportData = await exportVault(items, keyRef.current)
      const filename = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadFile(exportData, filename)
      console.log("✅ Vault exported successfully")
    } catch (error) {
      console.error("Export failed:", error)
      throw error
    }
  }

  async function importVaultData(file: File) {
    if (!keyRef.current || !session) {
      throw new Error("Not authenticated")
    }

    try {
      const fileContent = await readFileAsText(file)
      const importedItems = await importVault(fileContent, keyRef.current)
      
      // Merge with existing items (avoid duplicates by ID)
      const existingIds = new Set(items.map(item => item.id))
      const newItems = importedItems.filter(item => !existingIds.has(item.id))
      
      setItems(prev => [...newItems, ...prev])
      console.log(`✅ Imported ${newItems.length} new items`)
    } catch (error) {
      console.error("Import failed:", error)
      throw error
    }
  }

  const value: Ctx = {
    isAuthenticated,
    items: filtered,
    selectedId,
    selected,
    query,
    setQuery,
    selectedFolder,
    setSelectedFolder,
    availableTags,
    availableFolders,
    selectItem,
    createItem,
    updateSelected,
    deleteSelected,
    maskPassword,
    toggleMaskPassword,
    copyPassword,
    copied,
    signIn,
    signUp,
    signOut,
    generatorOpen,
    openGenerator,
    closeGenerator,
    applyGeneratedPassword,
    toggleSidebar,
    isMobileSidebarOpen,
    session,
    exportVaultData,
    importVaultData,
    showClipboardDialog,
    setShowClipboardDialog,
  }

  return <VaultCtx.Provider value={value}>{children}</VaultCtx.Provider>
}

export function useVault() {
  const ctx = useContext(VaultCtx)
  if (!ctx) throw new Error("useVault must be used within VaultProvider")
  return ctx
}
