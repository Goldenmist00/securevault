// Clipboard permission utilities

export async function requestClipboardPermission(): Promise<boolean> {
  try {
    // Check if permissions API is available
    if (!navigator.permissions) {
      console.log("Permissions API not available")
      return false
    }

    // Check current permission status
    const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
    
    if (permission.state === 'granted') {
      console.log("Clipboard permission already granted")
      return true
    }
    
    if (permission.state === 'denied') {
      console.log("Clipboard permission denied")
      return false
    }
    
    // Permission is 'prompt' - will be requested on first use
    console.log("Clipboard permission will be requested on use")
    return true
    
  } catch (error) {
    console.log("Could not check clipboard permissions:", error)
    return false
  }
}

export async function requestClipboardPermissionProactively(): Promise<boolean> {
  try {
    // Try to trigger clipboard permission by attempting a write
    // This will show the permission dialog to the user
    await navigator.clipboard.writeText("")
    console.log("📋 Clipboard permission granted proactively")
    return true
  } catch (error) {
    console.log("📋 Clipboard permission denied or not available:", error)
    return false
  }
}

export function checkClipboardPermissionStatus(): 'granted' | 'denied' | 'unknown' {
  const asked = localStorage.getItem('sv:clipboard-permission-asked')
  const granted = localStorage.getItem('sv:clipboard-permission-granted')
  
  if (!asked) return 'unknown'
  return granted === 'true' ? 'granted' : 'denied'
}

export function getClipboardCapabilities() {
  return {
    hasClipboardAPI: !!navigator.clipboard,
    hasPermissionsAPI: !!navigator.permissions,
    hasExecCommand: !!document.execCommand,
    isSecureContext: window.isSecureContext,
    userAgent: navigator.userAgent,
  }
}