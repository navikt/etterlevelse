'use client'

import { IPageResponse, TOption } from '@/constants/commonConstants'
import { EListName, ICode, TLovCode } from '@/constants/kodeverk/kodeverkConstants'
import { EKravStatus, TKravFilters, TKravQL } from '@/constants/krav/kravConstants'
import { EKravListFilter, ETab, TKravFilter } from '@/constants/krav/kravlist/kravlistConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { kravStatus } from '@/util/krav/kravUtil'
import { ApolloClient, ObservableQuery, OperationVariables } from '@apollo/client'
import { PlusIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, Label, Loader, Select } from '@navikt/ds-react'
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction, useContext } from 'react'
import { KravPanels } from '../../sisteRedigertKrav/kravPanels/KravPanels'

type TProps = {
  filter: TKravFilter
  setFilter: Dispatch<SetStateAction<TKravFilter>>
  fetchMore: <
    TFetchData = {
      krav: IPageResponse<TKravQL>
    },
    TFetchVars extends OperationVariables = TKravFilters,
  >(
    fetchMoreOptions: ObservableQuery.FetchMoreOptions<
      {
        krav: IPageResponse<TKravQL>
      },
      TKravFilters,
      TFetchData,
      TFetchVars
    >
  ) => Promise<ApolloClient.QueryResult<TFetchData>>
  data:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  pageSize: number
  kravene: IPageResponse<TKravQL>
  sortedKravList: TKravQL[]
  loading: boolean
  gqlLoading: boolean
}

export const Krav: FunctionComponent<TProps> = ({
  filter,
  setFilter,
  fetchMore,
  data,
  pageSize,
  kravene,
  sortedKravList,
  loading,
  gqlLoading,
}) => {
  const codelist = useContext(CodelistContext)
  const relevans = codelist.utils.getCodes(EListName.RELEVANS) as ICode[]
  const lover = codelist.utils.getCodes(EListName.LOV) as TLovCode[]

  const getLovOptions = (): any[] => {
    return getOptions(
      'Alle lover',
      lover.map((lov: TLovCode) => {
        return { label: lov.shortName, value: lov.code }
      })
    )
  }

  const getOptions = (label: string, options: any[]): any[] => [
    { label: label, value: ETab.ALLE },
    ...options,
  ]

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
    <div>
      <div className='w-full justify-center my-4'>
        <div className='flex justify-center content-center w-full'>
          <div className='flex justify-start align-middle w-full'>
            <Label size='medium'>{kravene.totalElements ? kravene.totalElements : 0} Krav</Label>
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
              {getSelector(EKravListFilter.LOVER, getLovOptions(), filter.lover[0].value as string)}
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
  )
}
