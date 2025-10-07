// Secure clipboard utilities

export interface ClipboardOptions {
  clearAfterMs?: number
  showLogs?: boolean
}

export class SecureClipboard {
  private static clearTimer: NodeJS.Timeout | null = null

  /**
   * Copy text to clipboard with automatic clearing after specified time
   */
  static async copyWithAutoClear(
    text: string, 
    options: ClipboardOptions = {}
  ): Promise<boolean> {
    const { clearAfterMs = 12000, showLogs = true } = options

    if (!text) {
      console.warn('Cannot copy empty text to clipboard')
      return false
    }

    // Cancel any existing clear timer
    if (this.clearTimer) {
      clearTimeout(this.clearTimer)
      this.clearTimer = null
    }

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
        if (showLogs) {
          console.log('📋 Text copied to clipboard')
        }

        // Set up auto-clear
        this.clearTimer = setTimeout(async () => {
          await this.clearClipboard(text, showLogs)
          this.clearTimer = null
        }, clearAfterMs)

        return true
      } else {
        // Fallback for older browsers
        return this.fallbackCopy(text, clearAfterMs, showLogs)
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return this.fallbackCopy(text, clearAfterMs, showLogs)
    }
  }

  /**
   * Clear clipboard if it still contains the specified text
   */
  private static async clearClipboard(originalText: string, showLogs: boolean): Promise<void> {
    try {
      // Try to read clipboard first (this might fail due to permissions)
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const currentClipboard = await navigator.clipboard.readText()
          if (currentClipboard === originalText) {
            await navigator.clipboard.writeText('')
            if (showLogs) {
              console.log('🔒 Clipboard cleared for security (verified match)')
            }
            return
          } else if (showLogs) {
            console.log('🔒 Clipboard content changed, skipping clear')
            return
          }
        } catch (readError) {
          // Reading failed, but we can still try to clear
          if (showLogs) {
            console.log('🔒 Cannot read clipboard, attempting to clear anyway')
          }
        }
      }
      
      // If we can't read or reading failed, just clear the clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText('')
        if (showLogs) {
          console.log('🔒 Clipboard cleared for security (forced clear)')
        }
      }
    } catch (error) {
      if (showLogs) {
        console.warn('Could not clear clipboard:', error)
      }
    }
  }

  /**
   * Fallback copy method for older browsers
   */
  private static fallbackCopy(text: string, clearAfterMs: number, showLogs: boolean): boolean {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        if (showLogs) {
          console.log('📋 Text copied to clipboard (fallback)')
        }
        
        // Set up clear timer (though we can't verify/clear in fallback mode)
        this.clearTimer = setTimeout(() => {
          if (showLogs) {
            console.log('🔒 Clipboard clear timer completed (fallback)')
          }
          this.clearTimer = null
        }, clearAfterMs)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Fallback copy failed:', error)
      return false
    }
  }

  /**
   * Cancel any pending clipboard clear operation
   */
  static cancelAutoClear(): void {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer)
      this.clearTimer = null
    }
  }

  /**
   * Check if clipboard API is supported
   */
  static isSupported(): boolean {
    return !!(navigator.clipboard && navigator.clipboard.writeText)
  }
}

// Convenience function for simple copy operations
export async function copyToClipboard(text: string, clearAfterSeconds: number = 12): Promise<boolean> {
  return SecureClipboard.copyWithAutoClear(text, { 
    clearAfterMs: clearAfterSeconds * 1000 
  })
}