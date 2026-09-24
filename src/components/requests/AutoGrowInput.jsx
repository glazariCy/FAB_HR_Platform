import { useLayoutEffect, useRef } from 'react'

// A one-line text box that wraps long text onto new lines and grows taller to fit,
// so the whole filter value stays readable.
function AutoGrowInput({ value, ...props }) {
  const textareaRef = useRef(null)

  // After every value change, set the height to fit the content.
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    textarea.style.height = 'auto'
    //if empty, keep the one line input
    if (value === '') return
    const borders = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${textarea.scrollHeight + borders}px`
  }, [value])

  // enter does not add a line break
  function handleKeyDown(event) {
    if (event.key === 'Enter') event.preventDefault()
  }

  return <textarea ref={textareaRef} rows={1} value={value} onKeyDown={handleKeyDown} {...props} />
}

export default AutoGrowInput
