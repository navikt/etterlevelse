'use client'

import { useEffect } from 'react'

type TUrlFilters = Record<string, string | string[] | undefined>

export const useUrlFilterSync = (filters: TUrlFilters) => {
  const serialized = JSON.stringify(filters)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    Object.entries(JSON.parse(serialized) as TUrlFilters).forEach(([key, value]) => {
      params.delete(key)
      const values = Array.isArray(value) ? value : [value]
      values.filter(Boolean).forEach((v) => params.append(key, v as string))
    })

    const query = params.toString()
    if (query !== window.location.search.replace(/^\?/, '')) {
      const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      window.history.replaceState(window.history.state, '', url)
    }
  }, [serialized])
}
