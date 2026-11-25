import { Select } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useRef, useState } from 'react'

type TProps = {
  label: string
  index: number
  arrayLength: number
  updateIndex: (newIndex: number) => void
  marginLeft?: boolean
}

export const RearrangeButtons: FunctionComponent<TProps> = ({
  label,
  index,
  arrayLength,
  updateIndex,
  marginLeft,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null)
  const [moved, setMoved] = useState<boolean>(false)

  useEffect(() => {
    if (moved && selectRef.current) {
      selectRef.current.focus({ preventScroll: true })
      selectRef.current.scrollIntoView({ block: 'center' })
      setMoved(false)
    }
  }, [index, moved])

  return (
    <div className={`flex ${marginLeft ? 'ml-10' : ''}`}>
      {arrayLength !== 1 && (
        <Select
          ref={selectRef}
          label='Velg posisjon'
          value={index}
          onChange={(e) => {
            const newIndex = parseInt(e.target.value)
            if (newIndex !== index) {
              setMoved(true)
              updateIndex(newIndex)
            }
          }}
        >
          {Array.from({ length: arrayLength }, (_, i) => (
            <option key={i + '_' + index + '_' + label} value={i}>
              {`${i + 1} av ${arrayLength}`}
            </option>
          ))}
        </Select>
      )}
    </div>
  )
}
