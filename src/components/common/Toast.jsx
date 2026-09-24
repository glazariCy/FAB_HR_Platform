import { useEffect } from 'react'
import './Toast.css'

// Floating notification in the top-right corner of the screen.
function Toast({ type = 'success', autoCloseMs, onClose, children }) {
  useEffect(() => {
    if (!autoCloseMs) return

    const timer = setTimeout(onClose, autoCloseMs)
    
    return () => clearTimeout(timer)
  }, [autoCloseMs, onClose])

  return (
    <div className={`toast toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="toast-icon" aria-hidden="true">{type === 'error' ? '!' : '✓'}</span>
      <div className="toast-message">{children}</div>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}

export default Toast
