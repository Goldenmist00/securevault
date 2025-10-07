// Theme management utilities

export type Theme = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'sv:theme'

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }
  
  return 'light'
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Listen for system theme changes
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }
  
  mediaQuery.addEventListener('change', handler)
  
  return () => {
    mediaQuery.removeEventListener('change', handler)
  }
}