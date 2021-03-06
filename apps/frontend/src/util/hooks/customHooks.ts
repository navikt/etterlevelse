import React, { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { user } from '../../services/User'

export function useDebouncedState<T>(initialValue: T, delay: number, passThrough?: (val: T) => void): [T, Dispatch<SetStateAction<T>>, T] {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
      passThrough && passThrough(value)
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

export function useUpdateOnChange(value: any) {
  const update = useForceUpdate()

  useEffect(() => {
    update()
  }, [value])
}

export let updateUser: () => void

export function useAwaitUser() {
  useAwait(user.wait())
  updateUser = useForceUpdate()
}

export function useAwait<T>(p: Promise<T>, setLoading?: Dispatch<SetStateAction<boolean>>) {
  const update = useForceUpdate()

  useEffect(() => {
    ;(async () => {
      setLoading && setLoading(true)
      await p
      update()
      setLoading && setLoading(false)
    })()
  }, [])
}

type Refs<T> = { [id: string]: RefObject<T> }

export function useRefs<T>(ids: string[]) {
  const refs: Refs<T> =
    ids.reduce((acc, value) => {
      acc[value] = React.createRef()
      return acc
    }, {} as Refs<T>) || {}

  return refs
}

export function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export function useQueryParam<T extends string>(queryParam: string) {
  return (useQuery().get(queryParam) as T) || undefined
}

export function useLocationState<T>() {
  const history = useHistory()
  const location = useLocation<T | undefined>()

  const changeState = (newState: Partial<T>) => {
    history.replace({ ...location, state: { ...location.state, ...newState } })
  }

  return { location, history, state: location.state, changeState }
}

export const useSearch = <T>(searchFunction: (term: string) => Promise<T[]>) => {
  const [search, setSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setSearchResult] = useState<T[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (search && search.length > 2) {
        setLoading(true)
        setSearchResult(await searchFunction(search))
        setLoading(false)
      } else {
        setSearchResult([])
      }
    })()
  }, [search])

  return [searchResult, setSearch, loading, search] as [T[], React.Dispatch<React.SetStateAction<string>>, boolean, string]
}
