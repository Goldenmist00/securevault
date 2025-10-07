// Import/Export utilities for vault data

export interface ExportData {
  version: string
  exportedAt: number
  itemCount: number
  encryptedData: any
}

export async function exportVault(
  items: any[], 
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const { encryptJSON } = await import('./crypto')
    
    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: Date.now(),
      itemCount: items.length,
      encryptedData: await encryptJSON(encryptionKey, { items })
    }
    
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    throw new Error(`Export failed: ${error}`)
  }
}

export async function importVault(
  jsonData: string,
  encryptionKey: CryptoKey
): Promise<any[]> {
  try {
    const { decryptJSON } = await import('./crypto')
    
    const exportData: ExportData = JSON.parse(jsonData)
    
    if (!exportData.version || !exportData.encryptedData) {
      throw new Error('Invalid export file format')
    }
    
    const decryptedData = await decryptJSON(encryptionKey, exportData.encryptedData)
    
    if (!Array.isArray(decryptedData.items)) {
      throw new Error('Invalid vault data structure')
    }
    
    return decryptedData.items
  } catch (error) {
    throw new Error(`Import failed: ${error}`)
  }
}

export function downloadFile(content: string, filename: string, mimeType: string = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('File reading error'))
    }
    
    reader.readAsText(file)
  })
}