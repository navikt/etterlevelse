'use client'

import { SortState } from '@navikt/ds-react'
import { DataGrid } from '@navikt/ds-react/PREVIEW/DataGrid'
import { IDashboardTable } from '@/constants/dashboard/dashboardConstants'

interface IProps {
  columns: DataGrid.Columns<IDashboardTable>
  data: IDashboardTable[]
  isLoading?: boolean
  sort?: SortState
  onSortChange: (sort: SortState | undefined) => void
}

export const DashboardDataGrid = ({
  columns,
  data,
  isLoading = false,
  sort,
  onSortChange,
}: IProps) => (
  <DataGrid
    className='mt-4 dashboard-data-grid'
    style={{ maxHeight: '80vh' }}
    columns={columns}
    data={data}
    isLoading={isLoading}
    getRowId={(dok) => dok.etterlevelseDokumentasjonId}
    settings={{
      rowDensity: 'tight',
      zebraStripes: true,
      columnDividers: false,
      truncateContent: false,
    }}
  >
    <DataGrid.Table
      layout='auto'
      aria-label='Etterlevelsesdokumenter'
      emptyContent='Ingen treff på valgte filtre'
      loadingContent={{ variant: 'skeleton', rows: 5, label: 'Laster etterlevelsesdokumenter' }}
      sorting={{
        allowMultiSort: false,
        sortOrder: sort
          ? [{ columnId: sort.orderBy, direction: sort.direction === 'ascending' ? 'asc' : 'desc' }]
          : [],
        onSortOrderChange: ([entry]) =>
          onSortChange(
            entry
              ? {
                  orderBy: entry.columnId,
                  direction: entry.direction === 'asc' ? 'ascending' : 'descending',
                }
              : undefined
          ),
      }}
    />
  </DataGrid>
)
