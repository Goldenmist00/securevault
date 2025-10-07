export function loadLocal<T = any>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function saveLocal(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}
