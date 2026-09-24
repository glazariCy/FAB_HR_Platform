import { useEffect, useRef } from 'react'
import './LeavePageDialog.css'

// Warns the user that their unfinished request will be lost if they leave the page.
// Uses the native <dialog> element, which gives us the backdrop, focus handling
// and closing with the Escape key for free.
function LeavePageDialog({ open, onStay, onLeave }) {
  const dialogRef = useRef(null)

  // <dialog> is opened/closed with methods, not props, so sync it with the `open` prop here
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Escape key: treat it as "Stay on page"
  function handleCancel(event) {
    event.preventDefault()
    onStay()
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      onCancel={handleCancel}
      aria-labelledby="leave-dialog-title"
      aria-describedby="leave-dialog-text"
    >
      <h2 id="leave-dialog-title">Leave this page?</h2>
      <p id="leave-dialog-text">
        You have an unfinished certificate request. If you leave this page,
        the information you entered will be lost.
      </p>
      <div className="dialog-actions">
        <button type="button" className="btn-secondary" onClick={onLeave}>
          Leave page
        </button>
        <button type="button" className="btn-primary" onClick={onStay}>
          Stay on page
        </button>
      </div>
    </dialog>
  )
}

export default LeavePageDialog
