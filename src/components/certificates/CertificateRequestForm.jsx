import { useCallback, useEffect, useState } from 'react'
import { Link, useBlocker } from 'react-router'
import { requestCertificate } from '../../api/certificateApi'
import { getTodayString, validateCertificate } from '../../utils/validateCertificate'
import FormField from './FormField'
import LeavePageDialog from './LeavePageDialog'
import './CertificateRequestForm.css'

const initialValues = {
  address_to: '',
  purpose: '',
  issued_on: '',
  employee_id: '',
}

// No field is "touched" at first, so the form doesn't show errors before the user has typed anything
const initialTouched = {
  address_to: false,
  purpose: false,
  issued_on: false,
  employee_id: false,
}

function CertificateRequestForm() {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState(initialTouched)
  // 'idle' | 'submitting' | 'success' | 'error'
  const [submitStatus, setSubmitStatus] = useState('idle')

  // Errors are calculated from the values on every render, so they can never get out of sync
  const errors = validateCertificate(values)
  const isValid = Object.keys(errors).length === 0
  const isEmpty = Object.values(values).every((value) => value === '')
  const isSubmitting = submitStatus === 'submitting'

  // Warn before moving to another page inside the app while the form has content
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !isEmpty && currentLocation.pathname !== nextLocation.pathname,
    [isEmpty],
  )
  const blocker = useBlocker(shouldBlock)

  // Refreshing or closing the tab can't use our own dialog, so ask the browser
  // to show its built-in "Leave site?" warning instead
  useEffect(() => {
    if (isEmpty) return

    function handleBeforeUnload(event) {
      event.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    // Cleanup: remove the listener when the form becomes empty or the page unmounts
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isEmpty])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    // Hide the previous success/error message once the user starts editing again
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  // A field counts as touched once the user leaves it
  function handleBlur(event) {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  async function handleSubmit(event) {
    event.preventDefault() // stops reload
    // The Submit button is disabled until the form is valid, but double-check anyway
    if (!isValid || isSubmitting) return

    setSubmitStatus('submitting')
    try {
      await requestCertificate(values)
      // Success: empty the form (this also turns off the leave-page warning)
      setValues(initialValues)
      setTouched(initialTouched)
      setSubmitStatus('success')
    } catch (error) {
      // Keep what the user typed so they can try again
      console.error('Certificate request failed:', error)
      setSubmitStatus('error')
    }
  }

  // Reset every field and hide all ✓/✕ statuses
  function handleClear() {
    setValues(initialValues)
    setTouched(initialTouched)
    setSubmitStatus('idle')
  }

  // null until the field is touched, then 'valid' or 'invalid'
  function getStatus(name) {
    if (!touched[name]) return null
    return errors[name] ? 'invalid' : 'valid'
  }

  // Props every input needs: connects it to state, validation and screen readers
  function fieldProps(name) {
    const isInvalid = getStatus(name) === 'invalid'
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': isInvalid,
      'aria-describedby': isInvalid ? `${name}-error` : undefined,
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <FormField label="Address to" name="address_to" status={getStatus('address_to')} error={errors.address_to}>
          <textarea rows={3} {...fieldProps('address_to')} />
        </FormField>

        <FormField label="Purpose" name="purpose" status={getStatus('purpose')} error={errors.purpose}>
          <textarea rows={5} {...fieldProps('purpose')} />
        </FormField>

        <FormField label="Issued on" name="issued_on" status={getStatus('issued_on')} error={errors.issued_on}>
          <input type="date" min={getTodayString()} {...fieldProps('issued_on')} />
        </FormField>

        <FormField label="Employee ID" name="employee_id" status={getStatus('employee_id')} error={errors.employee_id}>
          <input type="text" inputMode="numeric" {...fieldProps('employee_id')} />
        </FormField>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear} disabled={isEmpty || isSubmitting}>
            Clear
          </button>
          {!isValid && (
            <p className="form-hint">Complete all fields correctly to enable Submit.</p>
          )}
        </div>

        {submitStatus === 'success' && (
          <p className="alert alert--success" role="status">
            Your certificate request was submitted successfully.{' '}
            <Link to="/requests">View your requests</Link>
          </p>
        )}
        {submitStatus === 'error' && (
          <p className="alert alert--error" role="alert">
            Something went wrong and your request was not submitted. Your information is still here, please try again.
          </p>
        )}
      </form>

      <LeavePageDialog
        open={blocker.state === 'blocked'}
        onStay={() => blocker.reset()}
        onLeave={() => blocker.proceed()}
      />
    </>
  )
}

export default CertificateRequestForm
