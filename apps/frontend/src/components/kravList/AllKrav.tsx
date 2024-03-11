import { PlusIcon } from '@navikt/aksel-icons'
import { Alert, BodyShort, Button, Label, Loader, Select } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { emptyPage } from '../../api/util/EmptyPageConstant'
import { EKravListFilter, EKravStatus, TKravQL, TOption } from '../../constants'
import { KravPanels, sortKrav } from '../../pages/KravListPage'
import { kravStatus } from '../../pages/KravPage'
import { useKravFilter } from '../../query/KravQuery'
import { EListName, codelist } from '../../services/Codelist'

type TKravFilter = {
  status: TOption[]
  relevans: TOption[]
  tema: TOption[]
  lover: TOption[]
}

export const AllKrav = () => {
  const pageSize = 20
  const [sorting] = useState('sist')
  const [filter, setFilter] = useState<TKravFilter>({
    status: [{ label: 'Alle statuser', value: 'alle' }],
    relevans: [{ label: 'Alle relevans', value: 'alle' }],
    tema: [{ label: 'Alle tema', value: 'alle' }],
    lover: [{ label: 'Alle lover', value: 'alle' }],
  })

  const relevans = codelist.getCodes(EListName.RELEVANS)
  const lover = codelist.getCodes(EListName.LOV)

  const {
    data,
    loading: gqlLoading,
    fetchMore,
    error,
    refetch,
  } = useKravFilter({
    relevans:
      filter.relevans[0]?.value === 'alle'
        ? undefined
        : filter.relevans.map((relevans) => (relevans.value ? relevans.value.toString() : '')),
    lover:
      filter.lover[0].value === 'alle'
        ? undefined
        : filter.lover.map((lov) => (lov.value ? lov.value.toString() : '')),
    status:
      filter.status[0]?.value === 'alle'
        ? undefined
        : filter.status.map((status) => (status.value ? status.value?.toString() : '')),
    pageNumber: 0,
    pageSize,
  })

  const [sortedKravList, setSortedKravList] = useState<TKravQL[]>([])

  const loading = !data && gqlLoading
  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data && data.krav.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.krav
        const newData = o.fetchMoreResult && o.fetchMoreResult.krav
        return {
          krav: {
            ...oldData,
            pageNumber: newData.pageNumber,
            numberOfElements: oldData.numberOfElements + newData.numberOfElements,
            content: [...oldData.content, ...newData.content],
          },
        }
      },
    }).catch((e) => console.error(e))
  }

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
        a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0
      )
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) =>
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

  const updateFilter = (value: any, type: EKravListFilter) => {
    const newFilterValue = { ...filter }
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

  const kravene = data?.krav || emptyPage

  const getOptions = (label: string, options: any[]) => [
    { label: label, value: 'alle' },
    ...options,
  ]

  const getLovOptions = () => {
    return getOptions(
      'Alle lover',
      lover.map((lov) => {
        return { label: lov.shortName, value: lov.code }
      })
    )
  }

  const getSelector = (kravFilter: EKravListFilter, options: any[], value: string) => {
    return (
      <div className="ml-3 min-w-fit">
        <Select
          key={'krav_filter_' + kravFilter}
          size={'small'}
          label={`Filter ${kravFilter}`}
          hideLabel
          //placeholder='tema'
          value={value}
          onChange={(params) => {
            updateFilter(
              [
                {
                  value: params.currentTarget.value,
                  label: options.filter((o) => o.value === params.currentTarget.value)[0].label,
                },
              ],
              kravFilter
            )
          }}
          className={'flex'}
        >
          {options.map((option) => (
            <option value={option.value} key={kravFilter + '_' + option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    )
  }

  return loading && !kravene.numberOfElements ? (
    <div className="justify-center flex flex-1 mt-10">
      <Loader size="large" />
    </div>
  ) : error ? (
    <Alert variant={'error'}>{JSON.stringify(error, null, 2)}</Alert>
  ) : (
    <div>
      <div className={'w-full justify-center my-4'}>
        <div className={'flex justify-center content-center w-full'}>
          <div className={'flex justify-start align-middle w-full'}>
            <Label size={'medium'}>{kravene.totalElements ? kravene.totalElements : 0} Krav</Label>
          </div>
          <div className={'flex w-full items-center'}>
            <div className={'flex items-center justify-end w-full'}>
              <Label size={'small'}>Filter</Label>
              {getSelector(
                EKravListFilter.RELEVANS,
                getOptions(
                  'Alle relevans',
                  relevans?.map((relevans) => {
                    return { label: relevans.shortName, value: relevans.code }
                  })
                ),
                filter.relevans[0].value as string
              )}
              {getSelector(EKravListFilter.LOVER, getLovOptions(), filter.lover[0].value as string)}
              {getSelector(
                EKravListFilter.STATUS,
                getOptions(
                  'Alle statuser',
                  Object.values(EKravStatus).map((value) => ({ value, label: kravStatus(value) }))
                ),
                filter.status[0].value as string
              )}
            </div>
          </div>
        </div>
      </div>
      <KravPanels kravene={sortedKravList} loading={loading} />
      {sortedKravList.length === 0 && (
        <div className={'w-full flex justify-center'}>
          <BodyShort size={'small'}>Fant ingen krav</BodyShort>
        </div>
      )}

      {!loading && kravene.totalElements !== 0 && (
        <div className="flex justify-between mt-10">
          <div className="flex items-center">
            <Button
              onClick={lastMer}
              icon={<PlusIcon area-label="" aria-hidden />}
              variant={'secondary'}
              size="medium"
              disabled={gqlLoading || kravene.numberOfElements >= kravene.totalElements}
            >
              Vis mer
            </Button>

            {gqlLoading && (
              <div className="w-full flex justify-center">
                <Loader size="large" />
              </div>
            )}
          </div>
          <Label className={'mr-2.5'}>
            Viser {kravene.numberOfElements}/{kravene.totalElements}
          </Label>
        </div>
      )}
    </div>
  )
}
