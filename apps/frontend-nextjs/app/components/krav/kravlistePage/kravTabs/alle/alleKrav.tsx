import { IPageResponse } from '@/constants/commonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { ETab, TKravFilter } from '@/constants/krav/kravlist/kravlistConstants'
import { useKravFilter } from '@/query/krav/kravQuery'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { Alert, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { sortKrav } from '../../sortKrav/sortKrav'
import { Krav } from './krav/krav'

export const AllKrav = () => {
  const pageSize: number = 20
  const [sorting] = useState(ETab.SISTE)
  const [filter, setFilter] = useState<TKravFilter>({
    status: [{ label: 'Alle statuser', value: ETab.ALLE }],
    relevans: [{ label: 'Alle relevans', value: ETab.ALLE }],
    tema: [{ label: 'Alle tema', value: ETab.ALLE }],
    lover: [{ label: 'Alle lover', value: ETab.ALLE }],
  })

  const {
    data,
    loading: gqlLoading,
    fetchMore,
    error,
    refetch,
  } = useKravFilter({
    relevans:
      filter.relevans[0]?.value === ETab.ALLE
        ? undefined
        : filter.relevans.map(
            (
              relevans: Readonly<{
                value?: string | number
                label?: React.ReactNode
              }>
            ) => (relevans.value ? relevans.value.toString() : '')
          ),
    lover:
      filter.lover[0].value === ETab.ALLE
        ? undefined
        : filter.lover.map((lov) => (lov.value ? lov.value.toString() : '')),
    status:
      filter.status[0]?.value === ETab.ALLE
        ? undefined
        : filter.status.map((status) => (status.value ? status.value?.toString() : '')),
    pageNumber: 0,
    pageSize,
  })

  const [sortedKravList, setSortedKravList] = useState<TKravQL[]>([])

  const loading: boolean = !data && gqlLoading

  useEffect(() => {
    let sortedData: TKravQL[] = [...kravene.content]
    if (sorting === ETab.SISTE) {
      sortedData.sort((a: TKravQL, b: TKravQL) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData: TKravQL[] = [...kravene.content]
    if (sorting === ETab.SISTE) {
      sortedData.sort((a: TKravQL, b: TKravQL) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  useEffect(() => {
    refetch()
  }, [filter])

  const kravene: IPageResponse<TKravQL> = data?.krav || emptyPage

  return (
    <>
      {loading && !kravene.numberOfElements && (
        <div className='justify-center flex flex-1 mt-10'>
          <Loader size='large' />
        </div>
      )}
      {!loading && kravene.numberOfElements && (
        <>
          {error && <Alert variant='error'>{JSON.stringify(error, null, 2)}</Alert>}
          {!error && (
            <Krav
              filter={filter}
              setFilter={setFilter}
              fetchMore={fetchMore}
              data={data}
              pageSize={pageSize}
              kravene={kravene}
              sortedKravList={sortedKravList}
              loading={loading}
              gqlLoading={gqlLoading}
            />
          )}
        </>
      )}
    </>
  )
}
