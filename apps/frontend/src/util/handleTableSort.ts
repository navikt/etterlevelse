import { SortState } from '@navikt/ds-react'

export const handleSort = (
  sort: SortState | undefined,
  setSort: React.Dispatch<React.SetStateAction<SortState | undefined>>,
  sortKey?: string
) => {
  setSort(
    sort && sortKey === sort.orderBy && sort.direction === 'descending'
      ? undefined
      : ({
          orderBy: sortKey,
          direction:
            sort && sortKey === sort.orderBy && sort.direction === 'ascending'
              ? 'descending'
              : 'ascending',
        } as SortState)
  )
}
