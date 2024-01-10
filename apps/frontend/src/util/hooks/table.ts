import { Option, Value } from 'baseui/select'
import { SORT_DIRECTION } from 'baseui/table'
import { useEffect, useState } from 'react'

//WILL DELETE THIS FILE, USING AKSEL TABLE INSTEAD

export type TableConfig<T, K extends keyof T> = {
  sorting?: ColumnCompares<T>
  useDefaultStringCompare?: boolean
  initialSortColumn?: K
  showLast?: (p: T) => boolean
  filter?: Filters<T>
  pageSizes?: number[]
  defaultPageSize?: number
  exclude?: (keyof T)[]
}
export type Filters<T> = {
  [P in keyof T]?:
    | { type: 'search' }
    | { type: 'select'; mapping: (v: T) => Option | Value; options?: (items: T[]) => Value }
    | { type: 'searchMapped'; searchMapping: (v: T) => string }
}

export type TableState<T, K extends keyof T> = {
  sortColumn?: K
  sortDirection?: typeof SORT_DIRECTION.ASC | typeof SORT_DIRECTION.DESC
  direction: ColumnDirection<T>
  data: Array<T>
  sort: (column: K) => void
  filterValues: Record<K, string | undefined>
  setFilter: (column: K, value?: string) => void
  limit: number
  setLimit: (n: number) => void
  page: number
  setPage: (n: number) => void
  numPages: number
  pageStart: number
  pageEnd: number
}

type Compare<T> = (a: T, b: T) => number

export type ColumnCompares<T> = {
  [P in keyof T]?: Compare<T>
}

export type ColumnDirection<T> = {
  [P in keyof T]-?: typeof SORT_DIRECTION.ASC | typeof SORT_DIRECTION.DESC | null
}

const newSort = <T, K extends keyof T>(newColumn?: K, columnPrevious?: K, directionPrevious?: typeof SORT_DIRECTION.ASC | typeof SORT_DIRECTION.DESC) => {
  const newDirection = columnPrevious && newColumn === columnPrevious && directionPrevious === SORT_DIRECTION.ASC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC
  return { newDirection, newColumn }
}

const getSortFunction = <T, K extends keyof T>(sortColumn: K, useDefaultStringCompare: boolean, sorting?: ColumnCompares<T>): Compare<T> | undefined => {
  if (!sorting || !sorting[sortColumn]) {
    if (useDefaultStringCompare) {
      return (a, b) => ((a[sortColumn] as any as string) || '').localeCompare((b[sortColumn] as any as string) || '')
    } else {
      return undefined
    }
  }
  return sorting[sortColumn]
}

const toDirection = <T, K extends keyof T>(direction: typeof SORT_DIRECTION.ASC | typeof SORT_DIRECTION.DESC, column?: K): ColumnDirection<T> => {
  const newDirection: any = {}
  newDirection[column] = direction
  return newDirection
}

export const useTable = <T, K extends keyof T>(initialData: Array<T>, config?: TableConfig<T, K>) => {
  const { sorting, useDefaultStringCompare, showLast } = config || {}
  const initialSort = newSort<T, K>(config?.initialSortColumn)

  const [data, setData] = useState<T[]>(initialData)

  const [isInitialSort, setIsInitialSort] = useState(true)
  const [sortDirection, setSortDirection] = useState(initialSort.newDirection)
  const [sortColumn, setSortColumn] = useState(initialSort.newColumn)
  const [direction, setDirection] = useState<ColumnDirection<T>>(toDirection(initialSort.newDirection, initialSort.newColumn))
  const [filterValues, setFilterValues] = useState<Record<K, string | undefined>>({} as Record<K, string>)
  const [limit, setLimit] = useState(config?.defaultPageSize || 100)
  const [page, setPage] = useState(1)

  useEffect(() => setData(sortTableData()), [sortColumn, sortDirection, filterValues, initialData])

  const sortTableData = () => {
    function filterData(key: K, ordered: T[]) {
      const filter = config?.filter![key]
      if (!filter) return ordered
      switch (filter.type) {
        case 'search':
          return ordered.filter((v) => ((v[key] as any as string) || '').toLowerCase().indexOf(filterValues[key]!.toLowerCase()) >= 0)
        case 'searchMapped':
          return ordered.filter((v) => (filter.searchMapping(v).toLowerCase() || '').indexOf(filterValues[key]!.toLowerCase()) >= 0)
        case 'select':
          ordered = ordered.filter((v) => {
            const mapped = filter.mapping(v)
            const match = Array.isArray(mapped) ? mapped : [mapped]
            return !!match.filter((m) => m.id === (filterValues[key] as any)).length
          })
      }
      return ordered
    }

    if (sortColumn) {
      const sortFunct = getSortFunction(sortColumn, !!useDefaultStringCompare, sorting)
      if (!sortFunct) {
        console.warn(`invalid sort column ${String(sortColumn)} no sort function supplied`)
      } else {
        try {
          const sorted = initialData.slice(0).sort(sortFunct)
          let ordered = sortDirection === SORT_DIRECTION.ASC ? sorted : sorted.reverse()
          if (showLast && isInitialSort) {
            ordered = [...ordered.filter((p) => !showLast(p)), ...ordered.filter(showLast)]
          }
          for (const key in filterValues) {
            if (Object.prototype.hasOwnProperty.call(filterValues, key) && !!filterValues[key]) {
              ordered = filterData(key, ordered)
            }
          }

          return ordered
        } catch (e) {
          console.error('Error during sort of ', initialData, sortFunct, e)
        }
      }
    }
    return initialData
  }

  const sort = (sortColumnName: K) => {
    const { newDirection, newColumn } = newSort<T, K>(sortColumnName, sortColumn, sortDirection)
    setSortColumn(newColumn)
    setSortDirection(newDirection)
    setDirection(toDirection(newDirection, newColumn))
    setIsInitialSort(false)
  }

  const setFilter = (column: K, value?: string) => {
    const f2 = { ...filterValues }
    f2[column] = value
    setFilterValues(f2)
  }

  const numPages = Math.ceil(data.length / limit)
  useEffect(() => {
    if (page > numPages) {
      setPage(numPages)
    }
  }, [limit, numPages])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return
    }
    if (nextPage > numPages) {
      return
    }
    setPage(nextPage)
  }

  const state: TableState<T, K> = {
    data,
    direction,
    sortColumn,
    sortDirection,
    sort,
    filterValues,
    setFilter,
    limit,
    setLimit,
    page,
    setPage: handlePageChange,
    numPages,
    pageStart: (page - 1) * limit,
    pageEnd: page * limit,
  }
  return state
}
