// Wraps one form input with its label, a ✓/✕ status icon and an error message.
// status is null (untouched), 'valid' or 'invalid'.
function FormField({ label, name, status, error, children }) {
  const statusClass = status ? `form-field--${status}` : ''

  return (
    <div className={`form-field ${statusClass}`}>
      <label htmlFor={name}>{label}</label>

      <div className="input-wrapper">
        {children}
        {status === 'valid' && (
          <span className="field-icon field-icon--valid" aria-hidden="true">✓</span>
        )}
        {status === 'invalid' && (
          <span className="field-icon field-icon--invalid" aria-hidden="true">✕</span>
        )}
      </div>

      {status === 'invalid' && (
        <p id={`${name}-error`} className="field-error">{error}</p>
      )}
    </div>
  )
}

export default FormField
