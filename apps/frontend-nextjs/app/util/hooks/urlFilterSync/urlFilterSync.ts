'use client'

import { useEffect } from 'react'

type TUrlFilters = Record<string, string | string[] | undefined>

const buildFilterQuery = (filters: TUrlFilters): string => {
  const params = new URLSearchParams(window.location.search)
  Object.entries(filters).forEach(([key, value]) => {
    params.delete(key)
    const values = Array.isArray(value) ? value : [value]
    values.filter(Boolean).forEach((v) => params.append(key, v as string))
  })
  return params.toString()
}

export const useUrlFilterSync = (filters: TUrlFilters): string => {
  const serialized = JSON.stringify(filters)

  useEffect(() => {
    const query = buildFilterQuery(JSON.parse(serialized) as TUrlFilters)
    if (query !== window.location.search.replace(/^\?/, '')) {
      const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
      window.history.replaceState(window.history.state, '', url)
    }
  }, [serialized])

  if (typeof window === 'undefined') return ''
  const query = buildFilterQuery(filters)
  return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
}
