// Sort errors by the top-to-bottom position of their corresponding form field
export const sortFormErrorsByFieldPosition = (a: [string, unknown], b: [string, unknown]) => {
  const [keyA] = a
  const [keyB] = b
  const elementA = typeof document !== 'undefined' ? document.getElementById(keyA) : null
  const elementB = typeof document !== 'undefined' ? document.getElementById(keyB) : null

  // If one element is missing, keep stable ordering for existing ones
  if (elementA && !elementB) return -1
  if (!elementA && elementB) return 1
  if (!elementA && !elementB) return 0

  const rectA = elementA!.getBoundingClientRect()
  const rectB = elementB!.getBoundingClientRect()

  // First sort by Y (top), then by X (left) as a tiebreaker
  if (rectA.top !== rectB.top) return rectA.top - rectB.top
  return rectA.left - rectB.left
}

export default sortFormErrorsByFieldPosition
