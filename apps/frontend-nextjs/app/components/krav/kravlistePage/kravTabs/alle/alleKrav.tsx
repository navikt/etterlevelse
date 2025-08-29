import { kravStatus } from '@/components/etterlevelse/krav/kravComponents'
import { IPageResponse, TOption } from '@/constants/commonConstants'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { EKravListFilter, ETab } from '@/constants/krav/kravlist/kravlistConstants'
import { useKravFilter } from '@/query/krav/kravQuery'
import { codelist } from '@/services/kodeverk/kodeverkService'
import { emptyPage } from '@/util/common/emptyPageUtil'
import { PlusIcon } from '@navikt/aksel-icons'
import { Alert, BodyShort, Button, Label, Loader, Select } from '@navikt/ds-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { sortKrav } from '../../sortKrav/sortKrav'
import { KravPanels } from '../sisteRedigertKrav/kravPanels/KravPanels'

type TKravFilter = {
  status: TOption[]
  relevans: TOption[]
  tema: TOption[]
  lover: TOption[]
}

export const AllKrav = () => {
  const pageSize: number = 20
  const [sorting] = useState(ETab.SISTE)
  const [filter, setFilter] = useState<TKravFilter>({
    status: [{ label: 'Alle statuser', value: ETab.ALLE }],
    relevans: [{ label: 'Alle relevans', value: ETab.ALLE }],
    tema: [{ label: 'Alle tema', value: ETab.ALLE }],
    lover: [{ label: 'Alle lover', value: ETab.ALLE }],
  })

  const relevans = codelist.getCodes(EListName.RELEVANS) as ICode[]
  const lover = codelist.getCodes(EListName.LOV) as TLovCode[]

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
  const lastMer = (): void => {
    fetchMore({
      variables: {
        pageNumber: data && data.krav.pageNumber + 1,
        pageSize,
      },
      updateQuery: (
        oldKravData: {
          krav: IPageResponse<TKravQL>
        },
        newKravData: {
          fetchMoreResult: {
            krav: IPageResponse<TKravQL>
          }
          variables: {
            pageNumber: number
            pageSize: number
          }
        }
      ) => {
        const oldData: IPageResponse<TKravQL> = oldKravData.krav
        const newData: IPageResponse<TKravQL> =
          newKravData.fetchMoreResult && newKravData.fetchMoreResult.krav
        return {
          krav: {
            ...oldData,
            pageNumber: newData.pageNumber,
            numberOfElements: oldData.numberOfElements + newData.numberOfElements,
            content: [...oldData.content, ...newData.content],
          },
        }
      },
    }).catch((error: any) => console.error(error))
  }

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

  const updateFilter = (value: any, type: EKravListFilter): void => {
    const newFilterValue: {
      status: TOption[]
      relevans: TOption[]
      tema: TOption[]
      lover: TOption[]
    } = { ...filter }
    if (type === EKravListFilter.RELEVANS) {
      newFilterValue.relevans = value
    }
    if (type === EKravListFilter.LOVER) {
      newFilterValue.lover = value
    }
    if (type === EKravListFilter.STATUS) {
      newFilterValue.status = value
    }
    if (type === EKravListFilter.TEMAER) {
      newFilterValue.tema = value
    }
    setFilter(newFilterValue)
  }

  const kravene: IPageResponse<TKravQL> = data?.krav || emptyPage

  const getOptions = (label: string, options: any[]): any[] => [
    { label: label, value: ETab.ALLE },
    ...options,
  ]

  const getLovOptions = (): any[] => {
    return getOptions(
      'Alle lover',
      lover.map((lov: TLovCode) => {
        return { label: lov.shortName, value: lov.code }
      })
    )
  }

  const getSelector = (kravFilter: EKravListFilter, options: any[], value: string) => (
    <div className='ml-3 min-w-fit'>
      <Select
        key={`krav_filter_${kravFilter}`}
        size='small'
        label={`Filter ${kravFilter}`}
        hideLabel
        //placeholder='tema'
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => {
          updateFilter(
            [
              {
                value: event.currentTarget.value,
                label: options.filter(
                  (option: any) => option.value === event.currentTarget.value
                )[0].label,
              },
            ],
            kravFilter
          )
        }}
        className='flex'
      >
        {options.map((option: any) => (
          <option value={option.value} key={`${kravFilter}_${option.value}`}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  )

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
            <div>
              <div className='w-full justify-center my-4'>
                <div className='flex justify-center content-center w-full'>
                  <div className='flex justify-start align-middle w-full'>
                    <Label size='medium'>
                      {kravene.totalElements ? kravene.totalElements : 0} Krav
                    </Label>
                  </div>
                  <div className='flex w-full items-center'>
                    <div className='flex items-center justify-end w-full'>
                      <Label size='small'>Filter</Label>
                      {getSelector(
                        EKravListFilter.RELEVANS,
                        getOptions(
                          'Alle relevans',
                          relevans?.map((relevans: ICode) => {
                            return { label: relevans.shortName, value: relevans.code }
                          })
                        ),
                        filter.relevans[0].value as string
                      )}
                      {getSelector(
                        EKravListFilter.LOVER,
                        getLovOptions(),
                        filter.lover[0].value as string
                      )}
                      {getSelector(
                        EKravListFilter.STATUS,
                        getOptions(
                          'Alle statuser',
                          Object.values(EKravStatus).map((value: EKravStatus) => ({
                            value,
                            label: kravStatus(value),
                          }))
                        ),
                        filter.status[0].value as string
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <KravPanels kravene={sortedKravList} loading={loading} />
              {sortedKravList.length === 0 && (
                <div className='w-full flex justify-center'>
                  <BodyShort size='small'>Fant ingen krav</BodyShort>
                </div>
              )}

              {!loading && kravene.totalElements !== 0 && (
                <div className='flex justify-between mt-10'>
                  <div className='flex items-center'>
                    <Button
                      onClick={lastMer}
                      icon={<PlusIcon area-label='' aria-hidden />}
                      variant='secondary'
                      size='medium'
                      disabled={gqlLoading || kravene.numberOfElements >= kravene.totalElements}
                    >
                      Vis mer
                    </Button>

                    {gqlLoading && (
                      <div className='w-full flex justify-center'>
                        <Loader size='large' />
                      </div>
                    )}
                  </div>
                  <Label className='mr-2.5'>
                    Viser {kravene.numberOfElements}/{kravene.totalElements}
                  </Label>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
