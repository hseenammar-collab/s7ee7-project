'use client'

// Disable right-click
export function disableRightClick() {
  if (typeof window === 'undefined') return

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })
}

// Disable keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+U, etc.)
export function disableDevTools() {
  if (typeof window === 'undefined') return

  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault()
      return false
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      return false
    }

    // Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      return false
    }

    // PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault()
      navigator.clipboard.writeText('')
      alert('تصوير الشاشة محظور في هذه المنصة')
      return false
    }
  })
}

// Detect DevTools opening
export function detectDevTools(callback: () => void) {
  if (typeof window === 'undefined') return

  const threshold = 160

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold
    const heightThreshold = window.outerHeight - window.innerHeight > threshold

    if (widthThreshold || heightThreshold) {
      callback()
    }
  }

  setInterval(checkDevTools, 1000)

  // Also detect via debugger
  const element = new Image()
  Object.defineProperty(element, 'id', {
    get: function () {
      callback()
    },
  })

  setInterval(() => {
    console.log(element)
    console.clear()
  }, 1000)
}

// Disable text selection
export function disableTextSelection() {
  if (typeof window === 'undefined') return

  document.addEventListener('selectstart', (e) => {
    e.preventDefault()
    return false
  })

  document.addEventListener('copy', (e) => {
    e.preventDefault()
    return false
  })
}

// Disable drag
export function disableDrag() {
  if (typeof window === 'undefined') return

  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
    return false
  })
}

// Detect screen recording (basic)
export function detectScreenRecording(): boolean {
  if (typeof navigator === 'undefined') return false

  // Check for common recording indicators
  const mediaDevices = navigator.mediaDevices
  if (mediaDevices && mediaDevices.getDisplayMedia) {
    // Recording APIs are available
    return true
  }
  return false
}

// Initialize all protections
export function initializeAntiPiracy() {
  if (typeof window === 'undefined') return

  disableRightClick()
  disableDevTools()
  disableTextSelection()
  disableDrag()

  // Detect DevTools
  detectDevTools(() => {
    // Log the attempt
    console.clear()
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f0f0f;color:#fff;text-align:center;font-family:Arial;direction:rtl;">
        <div>
          <h1 style="color:#ef4444;font-size:2.5rem;margin-bottom:1rem;">تم اكتشاف محاولة غير مصرح بها</h1>
          <p style="font-size:1.25rem;color:#888;margin-bottom:2rem;">تم تسجيل هذه المحاولة وإرسالها للإدارة</p>
          <p>
            <a href="/" style="color:#C5A572;text-decoration:none;font-size:1.1rem;">العودة للرئيسية</a>
          </p>
        </div>
      </div>
    `
  })
}

// Initialize protections for video only (less aggressive)
export function initializeVideoProtection() {
  if (typeof window === 'undefined') return

  disableRightClick()
  disableDrag()

  // Only disable text selection on video container
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('.video-container')) {
      e.preventDefault()
      return false
    }
  })
}
