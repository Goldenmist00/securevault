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

export function showClipboardPermissionInfo(): void {
  const hasShown = localStorage.getItem('sv:clipboard-info-shown')
  if (hasShown) return

  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #3b82f6;
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-width: 320px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    animation: slideIn 0.3s ease-out;
  `

  notification.innerHTML = `
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="flex-shrink: 0; margin-top: 2px;">
        📋
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">Clipboard Access</div>
        <div style="opacity: 0.9;">
          SecureVault needs clipboard permission to copy passwords securely. 
          Click "Allow" when prompted for the best experience.
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        margin-left: 8px;
        opacity: 0.7;
      ">×</button>
    </div>
  `

  // Add animation keyframes
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
  
  document.body.appendChild(notification)

  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideIn 0.3s ease-out reverse'
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, 300)
    }
  }, 8000)

  // Mark as shown
  localStorage.setItem('sv:clipboard-info-shown', 'true')
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