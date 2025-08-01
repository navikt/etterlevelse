'use client'

import { user } from '@/services/user/userService'
import { useSearchParams } from 'next/navigation'
import { Dispatch, RefObject, SetStateAction, createRef, useEffect, useState } from 'react'

export function useDebouncedState<T>(
  initialValue: T,
  delay: number,
  passThrough?: (value: T) => void
): [T, Dispatch<SetStateAction<T>>, T] {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value)
      if (passThrough) {
        passThrough(value)
      }
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  // value returned as actual non-debounced value to be used in inputfields etc
  return [debouncedValue, setValue, value]
}

export function useForceUpdate() {
  const [val, setVal] = useState(0)
  return () => setVal(val + 1)
}

export let updateUser: () => void

export function useAwaitUser() {
  useAwait(user.wait())
  updateUser = useForceUpdate()
}

export function useAwait<T>(promise: Promise<T>, setLoading?: Dispatch<SetStateAction<boolean>>) {
  const update = useForceUpdate()

  useEffect(() => {
    ;(async () => {
      if (setLoading) {
        setLoading(true)
      }
      await promise
      update()
      if (setLoading) {
        setLoading(false)
      }
    })()
  }, [])
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

export const useSearch = <T>(searchFunction: (term: string) => Promise<T[]>) => {
  const [search, setSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setSearchResult] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const beginSearch = async () => {
    setLoading(true)
    setSearchResult(await searchFunction(search))
    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      if (search && search.match(/[a-zA-Z]\d/) && search.length > 3) {
        beginSearch()
      } else if (search && search.length > 2 && !search.match(/[a-zA-Z]\d/)) {
        beginSearch()
      } else {
        setSearchResult([])
      }
    })()
  }, [search])

  return [searchResult, setSearch, loading, search] as [
    T[],
    Dispatch<SetStateAction<string>>,
    boolean,
    string,
  ]
}
