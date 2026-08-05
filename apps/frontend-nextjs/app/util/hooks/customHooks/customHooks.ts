'use client'

import { useSearchParams } from 'next/navigation'
import { Dispatch, RefObject, SetStateAction, createRef, useEffect, useRef, useState } from 'react'

export function useDebouncedState<T>(
  initialValue: T,
  delay: number,
  passThrough?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>, T] {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const mounted = useRef(true)
  const passThroughRef = useRef(passThrough)

  useEffect(() => {
    passThroughRef.current = passThrough
  }, [passThrough])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      if (mounted.current) {
        setDebouncedValue(value)
        if (passThroughRef.current) {
          passThroughRef.current(value)
        }
      }
    }, delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  // value returned as actual non-debounced value to be used in inputfields etc
  return [debouncedValue, setValue, value] as const
}

export function useForceUpdate() {
  const [val, setVal] = useState(0)
  return () => setVal(val + 1)
}

export type TRefs<T> = { [id: string]: RefObject<T> }

export function useRefs<T>(ids: string[]) {
  const refs: TRefs<T> =
    ids.reduce((acc, value) => {
      acc[value] = createRef() as RefObject<T>
      return acc
    }, {} as TRefs<T>) || {}

  return refs
}

function useQuery() {
  return new URLSearchParams(useSearchParams())
}

export function useQueryParam<T extends string>(queryParam: string) {
  return (useQuery().get(queryParam) as T) || undefined
}
