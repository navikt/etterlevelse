import {useEffect, useState} from 'react'
import {codelist, ListName} from '../../services/Codelist'
import {useKravFilter} from '../../api/KravGraphQLApi'
import {emptyPage, KravListFilter, KravQL, KravStatus} from '../../constants'
import {Block, Responsive, Scale} from 'baseui/block'
import {Option, SelectOverrides} from 'baseui/select'
import CustomizedSelect from '../common/CustomizedSelect'
import {ettlevColors, theme} from '../../util/theme'
import {LabelSmall} from 'baseui/typography'
import {KravPanels, sortKrav} from '../../pages/KravListPage'
import {borderColor} from '../common/Style'
import {kravStatus} from '../../pages/KravPage'
import {Alert, BodyShort, Button, Heading, Label, Loader} from '@navikt/ds-react'
import {PlusIcon} from "@navikt/aksel-icons";

type KravFilter = {
  status: Option[]
  relevans: Option[]
  tema: Option[]
  lover: Option[]
}

export const AllKrav = () => {
  const pageSize = 20
  const [sorting] = useState('sist')
  const [filter, setFilter] = useState<KravFilter>({
    status: [{ label: 'Alle statuser', id: 'alle' }],
    relevans: [{ label: 'Alle relevans', id: 'alle' }],
    tema: [{ label: 'Alle tema', id: 'alle' }],
    lover: [{ label: 'Alle lover', id: 'alle' }],
  })

  // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
  // const [temaFilter, setTemaFilter] = useState<string[]>([])
  // const temaer = codelist.getCodes(ListName.TEMA)

  const relevans = codelist.getCodes(ListName.RELEVANS)
  const lover = codelist.getCodes(ListName.LOV)

  // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
  // const [loverFilter, setLoverFilter] = useState(lover)

  const {
    data,
    loading: gqlLoading,
    fetchMore,
    error,
    refetch,
  } = useKravFilter({
    relevans: filter.relevans[0]?.id === 'alle' ? undefined : filter.relevans.map((r) => (r.id ? r.id.toString() : '')),
    // lover: filter.lover[0].id === 'alle' && filter.tema[0].id === 'alle' ? undefined : filter.lover[0].id !== 'alle' ? filter.lover.map((l) => (l.id ? l.id.toString() : '')) : temaFilter,
    lover: filter.lover[0].id === 'alle' ? undefined : filter.lover.map((l) => (l.id ? l.id.toString() : '')),
    status: filter.status[0]?.id === 'alle' ? undefined : filter.status.map((s) => (s.id ? s.id?.toString() : '')),
    pageNumber: 0,
    pageSize,
  })
  const [sortedKravList, setSortedKravList] = useState<KravQL[]>([])

  const loading = !data && gqlLoading
  const lastMer = () => {
    fetchMore({
      variables: {
        pageNumber: data!.krav.pageNumber + 1,
        pageSize,
      },
      updateQuery: (p, o) => {
        const oldData = p.krav
        const newData = o.fetchMoreResult!.krav
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
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [data])

  useEffect(() => {
    let sortedData = [...kravene.content]
    if (sorting === 'sist') {
      sortedData.sort((a, b) => (a.changeStamp.lastModifiedDate > b.changeStamp.lastModifiedDate ? -1 : 0))
    } else {
      sortedData = sortKrav(sortedData)
    }
    setSortedKravList(sortedData)
  }, [sorting])

  useEffect(() => {
    // USIKKERT OM VI SKAL FILTRERER BASERT PÅ TEMA
    // if (filter.tema[0].id !== 'alle') {
    //   const temaLover: string[] = []
    //   const gyldiglover: LovCode[] = []
    //   lover.forEach((l) => {
    //     if (l.data?.tema === filter.tema[0].id) {
    //       temaLover.push(l.code)
    //       gyldiglover.push(l)
    //     }
    //   })
    //   setTemaFilter(temaLover)
    //   setLoverFilter(gyldiglover)
    // } else {
    //   setTemaFilter([])
    //   setLoverFilter(lover)
    // }

    refetch()
  }, [filter])

  const updateFilter = (value: any, type: KravListFilter) => {
    const newFilterValue = { ...filter }
    if (type === KravListFilter.RELEVANS) {
      newFilterValue.relevans = value
    }
    if (type === KravListFilter.LOVER) {
      newFilterValue.lover = value
    }
    if (type === KravListFilter.STATUS) {
      newFilterValue.status = value
    }
    if (type === KravListFilter.TEMAER) {
      newFilterValue.tema = value
    }
    setFilter(newFilterValue)
  }

  const selectorMarginLeft: Responsive<Scale> = ['0px', '0px', '0px', '12px', '12px', '12px']
  const selectorMarginTop: Responsive<Scale> = ['10px', '10px', '10px', '0px', '0px', '0px']

  const kravene = data?.krav || emptyPage

  const getOptions = (label: string, options: any[]) => [{ label: label, id: 'alle' }, ...options]

  const getLovOptions = () => {
    return getOptions(
      'Alle lover',
      lover.map((l) => {
        return { label: l.shortName, id: l.code }
      }),
    )

    // BRUKER KUN NÅR VI SKAL FILTRERE PÅ TEMA
    // if (filter.tema[0].id === 'alle') {
    //   return getOptions(
    //     'Alle lover',
    //     lover.map((l) => {
    //       return { label: l.shortName, id: l.code }
    //     }),
    //   )
    // } else {
    //   return getOptions(
    //     'Alle lover',
    //     loverFilter?.map((t) => {
    //       return { label: t.shortName, id: t.code }
    //     }),
    //   )
    // }
  }

  //must be run in function to not affect other selectors others overrides
  const getSelector = (filterId: string | undefined, kravFilter: KravListFilter, options: any[], value: Option[]) => {
    const customSelectOverrides: SelectOverrides = {
      Root: {
        style: {
          width: '150px',
        },
      },
      DropdownContainer: {
        style: {
          width: 'fit-content',
          maxWidth: '300px',
        },
      },
    }

    return (
      <Block marginLeft={selectorMarginLeft} marginTop={selectorMarginTop}>
        <CustomizedSelect
          key={'krav_filter_' + kravFilter}
          clearable={false}
          size="compact"
          placeholder="tema"
          options={options}
          overrides={{
            ...customSelectOverrides,
            ControlContainer: {
              style: {
                backgroundColor: filterId === 'alle' ? ettlevColors.white : ettlevColors.green50,
                ...borderColor(filterId === 'alle' ? ettlevColors.grey200 : ettlevColors.green800),
              },
            },
          }}
          value={value}
          onChange={(params) => updateFilter(params.value, kravFilter)}
        />
      </Block>
    )
  }

  return loading && !kravene.numberOfElements ? (
    <Loader size="large" />
  ) : error ? (
    <Alert variant={'error'}>{JSON.stringify(error, null, 2)}</Alert>
  ) : (
    <div>
      <div className={"w-full justify-center mt-4 mb-4"}>
        <div className={"flex justify-center content-center w-full"}>
          <div className={"flex justify-start w-full"}>
            <Heading size={"medium"}>
              {kravene.totalElements ? kravene.totalElements : 0} Krav
            </Heading>
          </div>
          <div className={"flex w-full items-center"}>
            <div className={"flex items-center justify-end w-full"}>
              <Label size={"small"}>Filter</Label>
              {/* {getSelector(filter.tema[0].id?.toString(), KravListFilter.TEMAER, getOptions(
                'Alle tema',
                temaer?.map((t) => {
                  return { label: t.shortName, id: t.code }
                }),
              ), filter.tema)} */}
              {getSelector(
                filter.relevans[0].id?.toString(),
                KravListFilter.RELEVANS,
                getOptions(
                  'Alle relevans',
                  relevans?.map((r) => {
                    return { label: r.shortName, id: r.code }
                  }),
                ),
                filter.relevans,
              )}
              {getSelector(filter.lover[0].id?.toString(), KravListFilter.LOVER, getLovOptions(), filter.lover)}
              {getSelector(
                filter.status[0].id?.toString(),
                KravListFilter.STATUS,
                getOptions(
                  'Alle statuser',
                  Object.values(KravStatus).map((id) => ({ id, label: kravStatus(id) })),
                ),
                filter.status,
              )}
            </div>

            {/*
            <Block >
              <LabelSmall>Sorter:</LabelSmall>
            </Block>
            <Block marginLeft="17px">
              <RadioGroup
                align={ALIGN.horizontal}
                value={sorting}
                onChange={e => setSorting(e.currentTarget.value)}
                name="sorting"
              >
                <Radio value='sist'>
                  Sist endret
                </Radio>
                <Radio value='alfabetisk'>
                  Alfabetisk
                </Radio>
              </RadioGroup>
            </Block>
                      */}
          </div>
        </div>
      </div>
      <KravPanels kravene={sortedKravList} loading={loading} />
      {sortedKravList.length === 0 && (
        <div className={"w-full flex justify-center"}>
          <BodyShort size={"small"}>Fant ingen krav</BodyShort>
        </div>
      )}

      {!loading && kravene.totalElements !== 0 && (
        <Block display={'flex'} justifyContent={'space-between'} marginTop={theme.sizing.scale1000}>
          <Block display="flex" alignItems="center">
            <Button
              onClick={lastMer}
              icon={<PlusIcon/>}
              variant={'secondary'}
              size="medium"
              disabled={gqlLoading || kravene.numberOfElements >= kravene.totalElements}
            >
              Vis mer
            </Button>

            {gqlLoading && (
              <Block marginLeft={theme.sizing.scale400}>
                <Loader size="large" />
              </Block>
            )}
          </Block>
          <LabelSmall marginRight={theme.sizing.scale400}>
            Viser {kravene.numberOfElements}/{kravene.totalElements}
          </LabelSmall>
        </Block>
      )}
    </div>
  )
}
